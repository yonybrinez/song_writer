import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { z } from "zod"

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).optional(),
  name: z.string().min(1).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("ADMIN")
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params

  // Prevent admin from demoting themselves
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own role" }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const DEFAULT_EDITOR_EMAIL = "editor@chordsheet.app"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("ADMIN")
  if ("error" in result) return result.error
  const { session } = result

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  // Transfer songs to the default editor before deleting
  let editor = await prisma.user.findUnique({ where: { email: DEFAULT_EDITOR_EMAIL } })
  if (!editor) {
    editor = await prisma.user.findFirst({
      where: { role: { in: ["EDITOR", "ADMIN"] }, id: { not: id } },
      orderBy: { createdAt: "asc" },
    })
  }

  if (editor) {
    await prisma.song.updateMany({ where: { authorId: id }, data: { authorId: editor.id } })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
