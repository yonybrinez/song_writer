"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SongViewer } from "./song-viewer"
import { TransposeControl } from "./transpose-control"
import { ExportMenu } from "./export-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toaster"
import { ArrowLeft, Edit, Trash2, Minus, Plus } from "lucide-react"
import { ClientDate } from "@/components/ui/client-date"
import { cn } from "@/lib/utils"

interface Song {
  id: string
  title: string
  artist?: string | null
  key?: string | null
  tempo?: number | null
  timeSignature?: string | null
  content: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  category?: { name: string; color: string } | null
  songTags: { tag: { name: string } }[]
  author: { name?: string | null; email: string }
}

interface SongViewPageProps {
  song: Song
  canEdit: boolean
  userId?: string
}

export function SongViewPage({ song, canEdit, userId }: SongViewPageProps) {
  const router = useRouter()
  const [currentContent, setCurrentContent] = useState(song.content)
  const [currentKey, setCurrentKey] = useState(song.key ?? undefined)
  const [fontSize, setFontSize] = useState(16)
  const [deleting, setDeleting] = useState(false)

  function handleTransposed(content: string, key: string | undefined) {
    if (content) {
      setCurrentContent(content)
      setCurrentKey(key)
    } else {
      setCurrentContent(song.content)
      setCurrentKey(song.key ?? undefined)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this song? This cannot be undone.")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/songs/${song.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast("Song deleted", "success")
      router.push("/songs")
      router.refresh()
    } catch {
      toast("Failed to delete", "error")
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm px-4 sm:px-6 py-3 no-print">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/songs" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-slate-100 truncate">{song.title}</h1>
            {song.artist && <p className="text-xs text-slate-500">{song.artist}</p>}
          </div>

          <TransposeControl
            songId={song.id}
            originalKey={currentKey}
            onTransposed={handleTransposed}
            canSave={canEdit}
          />

          {/* Font size */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Decrease font size"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 text-xs text-slate-500 font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Increase font size"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <ExportMenu songId={song.id} songTitle={song.title} content={currentContent} />

          {canEdit && (
            <>
              <Link href={`/songs/${song.id}/edit`}>
                <Button size="sm" variant="secondary">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Song content */}
      <div className="flex-1 px-6 py-6 max-w-4xl mx-auto w-full">
        {/* Metadata */}
        <div className="mb-6 flex flex-wrap items-center gap-2 no-print">
          {song.category && (
            <Badge color={song.category.color}>{song.category.name}</Badge>
          )}
          {song.songTags.map((st) => (
            <Badge key={st.tag.name} variant="outline"># {st.tag.name}</Badge>
          ))}
          {song.tempo && (
            <span className="text-xs text-slate-600">{song.tempo} BPM</span>
          )}
          {song.timeSignature && (
            <span className="text-xs text-slate-600">{song.timeSignature}</span>
          )}
          <ClientDate
            date={song.updatedAt}
            prefix="Updated "
            className="ml-auto text-xs text-slate-600"
          />
        </div>

        {/* Lyrics + chords */}
        <SongViewer
          content={currentContent}
          fontSize={fontSize}
          className="print:text-black"
        />

        {/* Notes */}
        {song.notes && canEdit && (
          <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-4 no-print">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Private notes</p>
            <p className="text-sm text-slate-400 whitespace-pre-wrap">{song.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
