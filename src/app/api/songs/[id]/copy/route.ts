import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params
  const source = await prisma.song.findUnique({
    where: { id },
    include: { songTags: { include: { tag: true } } },
  })

  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canAccess =
    source.isPublic ||
    source.authorId === session.user.id ||
    session.user.role === "ADMIN"
  if (!canAccess) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Always point to the root original, never to an intermediate copy
  const rootSourceId = source.sourceId ?? source.id

  // Count original + all existing copies to determine the next version number
  const existingCount = await prisma.song.count({
    where: {
      OR: [{ id: rootSourceId }, { sourceId: rootSourceId }],
    },
  })
  const newVersion = existingCount + 1

  const copy = await prisma.song.create({
    data: {
      title: source.title,
      artist: source.artist,
      key: source.key,
      tempo: source.tempo,
      timeSignature: source.timeSignature,
      content: source.content,
      notes: source.notes,
      isPublic: false,
      allowEdits: false,
      version: newVersion,
      sourceId: rootSourceId,
      authorId: session.user.id,
      categoryId: source.categoryId,
      songTags: {
        create: source.songTags.map((st) => ({ tagId: st.tagId })),
      },
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
      songTags: { include: { tag: true } },
    },
  })

  return NextResponse.json({ song: copy }, { status: 201 })
}
