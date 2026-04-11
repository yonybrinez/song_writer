"use client"

import { useRouter, usePathname } from "next/navigation"
import { useTransition, useState } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SongsFilterProps {
  categories: { id: string; name: string; color: string }[]
  tags: { id: string; name: string }[]
  currentSearch: string
  currentCategoryId?: string
  currentTagId?: string
}

export function SongsFilter({
  categories,
  tags,
  currentSearch,
  currentCategoryId,
  currentTagId,
}: SongsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const current = {
      search,
      categoryId: currentCategoryId,
      tagId: currentTagId,
      ...updates,
    }
    Object.entries(current).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search, page: "1" })
  }

  return (
    <div className="border-b border-slate-800 px-3 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center flex-1 sm:flex-none min-w-0">
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs..."
            className="h-8 w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-8 pr-8 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); updateParams({ search: undefined, page: "1" }) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-slate-600 flex-shrink-0">Category:</span>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => updateParams({ categoryId: undefined, page: "1" })}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition-colors flex-shrink-0",
                !currentCategoryId ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParams({ categoryId: currentCategoryId === c.id ? undefined : c.id, page: "1" })}
                className={cn(
                  "rounded-md px-2 py-1 text-xs transition-colors flex-shrink-0",
                  currentCategoryId === c.id
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
                style={currentCategoryId === c.id ? { backgroundColor: c.color } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-xs text-slate-600">Tag:</span>
          <select
            value={currentTagId ?? ""}
            onChange={(e) => updateParams({ tagId: e.target.value || undefined, page: "1" })}
            className="h-7 rounded-md border border-slate-700 bg-slate-800 text-xs text-slate-300 px-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
