import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { categorySchema } from "@/lib/validations"
import { slugify } from "@/lib/utils"

export async function GET() {
  const result = await requireRole("VIEWER")
  if ("error" in result) return result.error

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { songs: true } } },
  })

  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const result = await requireRole("ADMIN")
  if ("error" in result) return result.error

  try {
    const body = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const slug = slugify(parsed.data.name)
    const category = await prisma.category.create({
      data: { ...parsed.data, slug },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
