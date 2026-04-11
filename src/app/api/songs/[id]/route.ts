import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { songSchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"

const SONG_INCLUDE = {
  author: { select: { id: true, name: true, email: true } },
  category: true,
  songTags: { include: { tag: true } },
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id }, include: SONG_INCLUDE })
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canView = song.isPublic || song.authorId === session.user.id || session.user.role === "ADMIN"
  if (!canView) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ song })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id } })
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = song.authorId === session.user.id
  const isAdmin = session.user.role === "ADMIN"
  const canEdit = isOwner || isAdmin || (song.isPublic && song.allowEdits)

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = songSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { tagIds, ...data } = parsed.data

    // Non-owners cannot change isPublic or allowEdits
    if (!isOwner && !isAdmin) {
      delete (data as Partial<typeof data>).isPublic
      delete (data as Partial<typeof data>).allowEdits
    }

    const tagRecords = await Promise.all(
      tagIds.map((name) =>
        prisma.tag.upsert({
          where: { slug: slugify(name) },
          update: {},
          create: { name, slug: slugify(name) },
        })
      )
    )

    await prisma.songTag.deleteMany({ where: { songId: id } })

    const updated = await prisma.song.update({
      where: { id },
      data: {
        ...data,
        songTags: {
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
      },
      include: SONG_INCLUDE,
    })

    return NextResponse.json({ song: updated })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id } })
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "ADMIN" && song.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.song.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
