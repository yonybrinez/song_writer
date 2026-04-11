import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { transposeSchema } from "@/lib/validations"
import { transposeChordPro, transposeKey } from "@/lib/chordpro/transposer"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("VIEWER")
  if ("error" in result) return result.error

  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id } })
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const body = await req.json()
    const parsed = transposeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid semitones value" }, { status: 400 })
    }

    const { semitones } = parsed.data
    const transposedContent = transposeChordPro(song.content, semitones)
    const newKey = song.key ? transposeKey(song.key, semitones) : undefined

    return NextResponse.json({ content: transposedContent, key: newKey })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
