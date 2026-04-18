import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SongCard } from "@/components/songs/song-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Music } from "lucide-react"
import { SongsFilter } from "@/components/songs/songs-filter"

interface PageProps {
  searchParams: Promise<{
    search?: string
    categoryId?: string
    tagId?: string
    page?: string
  }>
}

export default async function SongsPage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams

  const search = params.search ?? ""
  const categoryId = params.categoryId
  const tagId = params.tagId
  const page = Math.max(1, parseInt(params.page ?? "1"))
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    // Own songs OR public songs from others
    OR: [
      { authorId: session?.user.id },
      { isPublic: true },
    ],
    ...(search
      ? {
          AND: [{
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { artist: { contains: search, mode: "insensitive" as const } },
            ],
          }],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(tagId ? { songTags: { some: { tagId } } } : {}),
  }

  const [songs, total, categories, tags] = await Promise.all([
    prisma.song.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        songTags: { include: { tag: true } },
      },
    }),
    prisma.song.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ])

  const canCreate = !!session?.user
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">Songs</h1>
            <p className="text-xs text-slate-500">{total} {total === 1 ? "song" : "songs"}</p>
          </div>
          {canCreate && (
            <Link href="/songs/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New Song
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <SongsFilter
        categories={categories}
        tags={tags}
        currentSearch={search}
        currentCategoryId={categoryId}
        currentTagId={tagId}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <Music className="h-7 w-7 text-slate-600" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">No songs yet</p>
              <p className="text-sm text-slate-600 mt-1">
                {search ? "Try a different search" : canCreate ? "Create your first song to get started" : "No songs available"}
              </p>
            </div>
            {canCreate && !search && (
              <Link href="/songs/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create your first song
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={{
                  ...song,
                  updatedAt: song.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/songs?${new URLSearchParams({ ...params, page: String(p) })}`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
