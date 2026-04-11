"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SongEditor } from "./song-editor"
import { TagInput } from "./tag-input"
import { toast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { Save, ArrowLeft } from "lucide-react"

interface Category {
  id: string
  name: string
  color: string
}

interface SongFormProps {
  songId?: string
  initialData?: {
    title: string
    artist: string
    key: string
    tempo: string
    timeSignature: string
    content: string
    notes: string
    isPublic: boolean
    categoryId: string
    tagIds: string[]
  }
  categories: Category[]
}

const COMMON_KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm", "C#m", "F#m",
]

const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"]

export function SongForm({ songId, initialData, categories }: SongFormProps) {
  const router = useRouter()
  const isEditing = !!songId

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    artist: initialData?.artist ?? "",
    key: initialData?.key ?? "",
    tempo: initialData?.tempo ?? "",
    timeSignature: initialData?.timeSignature ?? "",
    content: initialData?.content ?? "",
    notes: initialData?.notes ?? "",
    isPublic: initialData?.isPublic ?? false,
    categoryId: initialData?.categoryId ?? "",
    tagIds: initialData?.tagIds ?? [],
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"meta" | "lyrics">("lyrics")

  const updateContent = useCallback((content: string) => {
    setForm((prev) => ({ ...prev, content }))
  }, [])

  async function handleSave() {
    if (!form.title.trim()) {
      toast("Title is required", "error")
      return
    }

    setSaving(true)
    try {
      const body = {
        title: form.title,
        artist: form.artist || undefined,
        key: form.key || undefined,
        tempo: form.tempo ? parseInt(form.tempo) : undefined,
        timeSignature: form.timeSignature || undefined,
        content: form.content,
        notes: form.notes || undefined,
        isPublic: form.isPublic,
        categoryId: form.categoryId || null,
        tagIds: form.tagIds,
      }

      const url = isEditing ? `/api/songs/${songId}` : "/api/songs"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        toast(data.error || "Failed to save", "error")
        return
      }

      const data = await res.json()
      toast(isEditing ? "Song updated" : "Song created", "success")
      router.push(`/songs/${data.song.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/50 px-4 py-3 no-print">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Song title..."
          className="flex-1 bg-transparent text-lg font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none"
        />

        {/* Tabs */}
        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
          {(["lyrics", "meta"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {tab === "lyrics" ? "Lyrics & Chords" : "Details"}
            </button>
          ))}
        </div>

        <Button onClick={handleSave} loading={saving} size="sm">
          <Save className="h-3.5 w-3.5" />
          {isEditing ? "Update" : "Save"}
        </Button>
      </div>

      {/* Main content */}
      {activeTab === "lyrics" ? (
        <SongEditor value={form.content} onChange={updateContent} className="flex-1" />
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-xl space-y-5">
            <Input
              label="Artist"
              value={form.artist}
              onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))}
              placeholder="Artist name"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Key"
                value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
              >
                <option value="">Select key...</option>
                {COMMON_KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </Select>

              <Select
                label="Time Signature"
                value={form.timeSignature}
                onChange={(e) => setForm((p) => ({ ...p, timeSignature: e.target.value }))}
              >
                <option value="">Select...</option>
                {TIME_SIGNATURES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>

            <Input
              label="Tempo (BPM)"
              type="number"
              value={form.tempo}
              onChange={(e) => setForm((p) => ({ ...p, tempo: e.target.value }))}
              placeholder="120"
              min={20}
              max={300}
            />

            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <TagInput
              value={form.tagIds}
              onChange={(tags) => setForm((p) => ({ ...p, tagIds: tags }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Notes (private)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Personal notes about this song..."
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                  className="sr-only"
                />
                <div className={cn(
                  "h-5 w-9 rounded-full transition-colors",
                  form.isPublic ? "bg-indigo-600" : "bg-slate-700"
                )}>
                  <div className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    form.isPublic ? "translate-x-4" : "translate-x-0.5"
                  )} />
                </div>
              </div>
              <span className="text-sm text-slate-300">Public song</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
