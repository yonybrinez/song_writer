import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { updateProfileSchema, deleteAccountSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"

const DEFAULT_EDITOR_EMAIL = "editor@chordsheet.app"

async function getEditorFallback() {
  return prisma.user.findFirst({
    where: { role: { in: ["EDITOR", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
  })
}

export async function PATCH(req: NextRequest) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  try {
    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, currentPassword } = parsed.data
    const userId = session.user.id

    const current = await prisma.user.findUnique({ where: { id: userId } })
    if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const emailChanging = email !== current.email

    // Require current password when changing email
    if (emailChanging) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change your email." },
          { status: 400 }
        )
      }
      const valid = await bcrypt.compare(currentPassword, current.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 })
      }

      const taken = await prisma.user.findUnique({ where: { email } })
      if (taken && taken.id !== userId) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const result = await requireAuth()
  if ("error" in result) return result.error
  const { session } = result

  try {
    const body = await req.json()
    const parsed = deleteAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const userId = session.user.id
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Incorrect password." }, { status: 400 })

    // Find the fallback user to receive orphaned songs
    let editor = await prisma.user.findUnique({ where: { email: DEFAULT_EDITOR_EMAIL } })
    if (!editor) editor = await getEditorFallback()

    if (editor && editor.id !== userId) {
      await prisma.song.updateMany({
        where: { authorId: userId },
        data: { authorId: editor.id },
      })
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
