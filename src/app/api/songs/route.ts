import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { songSchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const result = await requireRole("VIEWER")
  if ("error" in result) return result.error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const categoryId = searchParams.get("categoryId")
  const tagId = searchParams.get("tagId")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { artist: { contains: search } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(tagId ? { songTags: { some: { tagId } } } : {}),
  }

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        songTags: { include: { tag: true } },
      },
    }),
    prisma.song.count({ where }),
  ])

  return NextResponse.json({ songs, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const result = await requireRole("EDITOR")
  if ("error" in result) return result.error
  const { session } = result

  try {
    const body = await req.json()
    const parsed = songSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { tagIds, ...data } = parsed.data

    // Upsert tags
    const tagRecords = await Promise.all(
      tagIds.map((name) =>
        prisma.tag.upsert({
          where: { slug: slugify(name) },
          update: {},
          create: { name, slug: slugify(name) },
        })
      )
    )

    const song = await prisma.song.create({
      data: {
        ...data,
        authorId: session.user.id,
        songTags: {
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        songTags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ song }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
