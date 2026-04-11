import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { toMarkdown, toHtml } from "@/lib/chordpro/serializers"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("VIEWER")
  if ("error" in result) return result.error

  const { id } = await params
  const song = await prisma.song.findUnique({ where: { id } })
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const format = new URL(req.url).searchParams.get("format") ?? "html"
  const filename = song.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()

  if (format === "markdown") {
    const md = toMarkdown(song.content, song.title, song.artist ?? undefined, song.key ?? undefined)
    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.md"`,
      },
    })
  }

  const html = toHtml(song.content, song.title, song.artist ?? undefined, song.key ?? undefined)
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": format === "html-download" ? `attachment; filename="${filename}.html"` : "inline",
    },
  })
}
