import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CategoriesManager } from "@/components/categories/categories-manager"

export default async function CategoriesPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/songs")

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { songs: true } } },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-100">Categories</h1>
        <p className="text-xs text-slate-500">{categories.length} categories</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <CategoriesManager initialCategories={categories} />
      </div>
    </div>
  )
}
