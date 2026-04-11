"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toaster"
import { Minus, Plus, RotateCcw, Save } from "lucide-react"

interface TransposeControlProps {
  songId: string
  originalKey?: string
  onTransposed?: (content: string, key: string | undefined) => void
  canSave?: boolean
}

export function TransposeControl({ songId, originalKey, onTransposed, canSave }: TransposeControlProps) {
  const [offset, setOffset] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  async function applyTranspose(newOffset: number) {
    if (newOffset === 0) {
      setOffset(0)
      onTransposed?.("", originalKey)
      return
    }

    try {
      const res = await fetch(`/api/songs/${songId}/transpose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semitones: newOffset }),
      })

      if (!res.ok) throw new Error("Transpose failed")
      const data = await res.json()
      setOffset(newOffset)
      onTransposed?.(data.content, data.key)
    } catch {
      toast("Failed to transpose", "error")
    }
  }

  async function saveTransposition() {
    if (offset === 0 || !canSave) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/songs/${songId}/transpose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semitones: offset }),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()

      // Save to song
      const updateRes = await fetch(`/api/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, key: data.key }),
      })

      if (!updateRes.ok) throw new Error()
      setOffset(0)
      toast("Transposition saved", "success")
    } catch {
      toast("Failed to save transposition", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const displayKey = originalKey
    ? offset === 0
      ? originalKey
      : `${originalKey} +${offset}`
    : offset === 0
    ? "—"
    : `+${offset}`

  return (
    <div className="flex items-center gap-2 no-print">
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Key</span>
      <div className="flex items-center rounded-lg border border-slate-700 overflow-hidden">
        <button
          onClick={() => applyTranspose(offset - 1)}
          className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border-r border-slate-700"
          title="Transpose down"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="px-3 py-1.5 text-sm font-mono font-semibold text-indigo-400 min-w-[3.5rem] text-center">
          {displayKey}
        </span>
        <button
          onClick={() => applyTranspose(offset + 1)}
          className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border-l border-slate-700"
          title="Transpose up"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {offset !== 0 && (
        <>
          <button
            onClick={() => applyTranspose(0)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset transpose"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          {canSave && (
            <Button size="sm" onClick={saveTransposition} loading={isSaving}>
              <Save className="h-3 w-3" />
              Save
            </Button>
          )}
        </>
      )}
    </div>
  )
}
