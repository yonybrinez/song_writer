import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { categorySchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("ADMIN")
  if ("error" in result) return result.error

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const slug = slugify(parsed.data.name)
    const category = await prisma.category.update({
      where: { id },
      data: { ...parsed.data, slug },
    })

    return NextResponse.json({ category })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireRole("ADMIN")
  if ("error" in result) return result.error

  const { id } = await params

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
