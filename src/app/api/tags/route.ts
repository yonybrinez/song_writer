import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const result = await requireRole("VIEWER")
  if ("error" in result) return result.error

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { songTags: true } } },
  })

  return NextResponse.json({ tags })
}
