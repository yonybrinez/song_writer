"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toaster"
import { Plus, Trash2, Edit, Check, X, LayoutGrid } from "lucide-react"

interface Category {
  id: string
  name: string
  color: string
  _count: { songs: number }
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#06b6d4",
]

export function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")

  async function createCategory() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast(d.error || "Failed to create", "error")
        return
      }
      const d = await res.json()
      setCategories((prev) => [...prev, { ...d.category, _count: { songs: 0 } }])
      setNewName("")
      setShowNew(false)
      toast("Category created", "success")
    } finally {
      setCreating(false)
    }
  }

  async function updateCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    })
    if (!res.ok) { toast("Failed to update", "error"); return }
    const d = await res.json()
    setCategories((prev) => prev.map((c) => c.id === id ? { ...d.category, _count: c._count } : c))
    setEditingId(null)
    toast("Category updated", "success")
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Songs will keep their data.")) return
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (!res.ok) { toast("Failed to delete", "error"); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    toast("Category deleted", "success")
  }

  return (
    <div className="max-w-xl space-y-4">
      <Button onClick={() => setShowNew(!showNew)} size="sm">
        <Plus className="h-3.5 w-3.5" />
        New Category
      </Button>

      {showNew && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
          <Input
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
          />
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: newColor === c ? "white" : "transparent" }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={createCategory} loading={creating} size="sm">Create</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center text-slate-600">
          <LayoutGrid className="h-8 w-8 mb-3" />
          <p>No categories yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-800 rounded-md px-2 py-1 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id)}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: c, borderColor: editColor === c ? "white" : "transparent" }}
                      />
                    ))}
                  </div>
                  <button onClick={() => updateCategory(cat.id)} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm font-medium text-slate-200">{cat.name}</span>
                  <Badge variant="outline">{cat._count.songs} songs</Badge>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color) }}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
