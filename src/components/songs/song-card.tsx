import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Music, Clock, Hash, GitFork } from "lucide-react"

interface SongCardProps {
  song: {
    id: string
    title: string
    artist?: string | null
    key?: string | null
    tempo?: number | null
    version: number
    sourceId?: string | null
    category?: { name: string; color: string } | null
    songTags: { tag: { name: string } }[]
    updatedAt: string | Date
    author: { name?: string | null }
  }
}

export function SongCard({ song }: SongCardProps) {
  const isVersion = song.version > 1 && !!song.sourceId
  const authorLabel = song.author.name || null

  return (
    <Link
      href={`/songs/${song.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30">
            <Music className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {song.title}
            </h3>
            {song.artist && (
              <p className="truncate text-xs text-slate-500">{song.artist}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isVersion && (
            <span className="flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-600/10 px-1.5 py-0.5 text-xs font-mono font-bold text-amber-400">
              <GitFork className="h-2.5 w-2.5" />
              v{song.version}
            </span>
          )}
          {song.key && (
            <span className="rounded-md border border-indigo-500/40 bg-indigo-600/10 px-2 py-0.5 text-xs font-mono font-bold text-indigo-400">
              {song.key}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {song.category && (
          <Badge color={song.category.color}>{song.category.name}</Badge>
        )}
        {song.songTags.slice(0, 3).map((st) => (
          <Badge key={st.tag.name} variant="outline">
            <Hash className="h-2.5 w-2.5 mr-0.5 inline" />
            {st.tag.name}
          </Badge>
        ))}
        {song.songTags.length > 3 && (
          <Badge variant="outline">+{song.songTags.length - 3}</Badge>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(song.updatedAt)}
        </span>
        {song.tempo && <span>{song.tempo} BPM</span>}
        {authorLabel && <span className="ml-auto truncate">{authorLabel}</span>}
      </div>
    </Link>
  )
}
