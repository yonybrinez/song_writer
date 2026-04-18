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
import { ArrowLeft, Edit, Trash2, Minus, Plus, Copy, GitFork, Music2, ExternalLink } from "lucide-react"
import { LINK_TYPE_CONFIG, formatDisplayUrl, type LinkType } from "@/lib/link-utils"
import { ClientDate } from "@/components/ui/client-date"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface Song {
  id: string
  title: string
  artist?: string | null
  key?: string | null
  tempo?: number | null
  timeSignature?: string | null
  content: string
  notes?: string | null
  isPublic: boolean
  allowEdits: boolean
  version: number
  sourceId?: string | null
  source?: { id: string; title: string; author: { name?: string | null } } | null
  createdAt: string
  updatedAt: string
  category?: { name: string; color: string } | null
  songTags: { tag: { name: string } }[]
  referenceLinks: { id: string; url: string; label?: string | null; type: string }[]
  author: { name?: string | null }
}

interface SongViewPageProps {
  song: Song
  canEdit: boolean
  canDelete: boolean
  canCopy: boolean
  isAuthenticated: boolean
}

export function SongViewPage({ song, canEdit, canDelete, canCopy, isAuthenticated }: SongViewPageProps) {
  const router = useRouter()
  const [currentContent, setCurrentContent] = useState(song.content)
  const [currentKey, setCurrentKey] = useState(song.key ?? undefined)
  const [fontSize, setFontSize] = useState(16)
  const [deleting, setDeleting] = useState(false)
  const [copying, setCopying] = useState(false)

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

  async function handleCopy() {
    setCopying(true)
    try {
      const res = await fetch(`/api/songs/${song.id}/copy`, { method: "POST" })
      if (!res.ok) throw new Error()
      const { song: copy } = await res.json()
      toast("Song copied to your library", "success")
      router.push(`/songs/${copy.id}/edit`)
      router.refresh()
    } catch {
      toast("Failed to copy song", "error")
      setCopying(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3 no-print dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/songs" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{song.title}</h1>
            {song.artist && <p className="text-xs text-slate-500">{song.artist}</p>}
          </div>

          {isAuthenticated && (
            <TransposeControl
              songId={song.id}
              originalKey={currentKey}
              onTransposed={handleTransposed}
              canSave={canEdit}
            />
          )}

          {/* Font size */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 overflow-hidden dark:border-slate-700">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors dark:hover:text-slate-300 dark:hover:bg-slate-800"
              title="Decrease font size"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 text-xs text-slate-500 font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(28, s + 2))}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors dark:hover:text-slate-300 dark:hover:bg-slate-800"
              title="Increase font size"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <ExportMenu songId={song.id} songTitle={song.title} content={currentContent} />

          {!isAuthenticated && <ThemeToggle />}

          {canCopy && (
            <Button size="sm" variant="secondary" onClick={handleCopy} loading={copying}>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          )}

          {canEdit && (
            <Link href={`/songs/${song.id}/edit`}>
              <Button size="sm" variant="secondary">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}

          {canDelete && (
            <Button size="sm" variant="danger" onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Song content */}
      <div className="flex-1 px-6 py-6 max-w-4xl mx-auto w-full">
        {/* Version lineage banner */}
        {song.version > 1 && song.sourceId && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-600/5 px-4 py-2.5 no-print">
            <GitFork className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300">
              Version {song.version}{song.author.name ? ` by ${song.author.name}` : ""}
            </span>
            {song.source && (
              <>
                <span className="text-xs text-amber-500">·</span>
                <span className="text-xs text-amber-500">Original:</span>
                <a
                  href={`/songs/${song.source.id}`}
                  className="text-xs text-amber-400 hover:text-amber-200 underline underline-offset-2 transition-colors"
                >
                  {song.source.title}
                </a>
                {song.source.author.name && (
                  <span className="text-xs text-amber-500">
                    by {song.source.author.name}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mb-6 flex flex-wrap items-center gap-2 no-print">
          {song.category && (
            <Badge color={song.category.color}>{song.category.name}</Badge>
          )}
          {song.songTags.map((st) => (
            <Badge key={st.tag.name} variant="outline"># {st.tag.name}</Badge>
          ))}
          {song.tempo && (
            <span className="text-xs text-slate-500 dark:text-slate-600">{song.tempo} BPM</span>
          )}
          {song.timeSignature && (
            <span className="text-xs text-slate-500 dark:text-slate-600">{song.timeSignature}</span>
          )}
          {song.isPublic && song.allowEdits && (
            <span className="text-xs text-emerald-600 border border-emerald-700/40 rounded px-1.5 py-0.5">
              Open for edits
            </span>
          )}
          {song.isPublic && !song.allowEdits && (
            <span className="text-xs text-slate-600 border border-slate-700/40 rounded px-1.5 py-0.5">
              Public
            </span>
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

        {/* Reference Links */}
        {song.referenceLinks.length > 0 && (
          <div className="mt-8 no-print">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              References
            </p>
            <div className="flex flex-wrap gap-2">
              {song.referenceLinks.map((link) => {
                const cfg = LINK_TYPE_CONFIG[link.type as LinkType] ?? LINK_TYPE_CONFIG.other
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "group flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                      "hover:brightness-125",
                      cfg.bg,
                      cfg.border,
                    ].join(" ")}
                  >
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors max-w-[180px] truncate dark:text-slate-400 dark:group-hover:text-slate-200">
                      {link.label || formatDisplayUrl(link.url)}
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0 dark:text-slate-600" />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes — only visible to the owner */}
        {song.notes && canDelete && (
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50/50 p-4 no-print dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Private notes</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap dark:text-slate-400">{song.notes}</p>
          </div>
        )}

        {/* Register banner — shown to unauthenticated visitors */}
        {!isAuthenticated && (
          <div className="mt-12 mb-6 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-900/60 p-6 no-print">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/25">
                <Music2 className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-slate-100">
                  Build your own song library
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  Create an account to write, edit, and share songs with chords — completely free.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link href="/login">
                  <Button size="sm" variant="secondary">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
