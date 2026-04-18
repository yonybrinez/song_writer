import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { SongForm } from "@/components/songs/song-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSongPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const [song, categories] = await Promise.all([
    prisma.song.findUnique({
      where: { id },
      include: {
        songTags: { include: { tag: true } },
        referenceLinks: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!song) notFound()

  const isOwner = session?.user.id === song.authorId
  const isAdmin = session?.user.role === "ADMIN"
  const canEdit =
    isAdmin ||
    (session?.user.role === "EDITOR" && isOwner) ||
    (song.isPublic && song.allowEdits)

  if (!canEdit) redirect(`/songs/${id}`)

  return (
    <SongForm
      songId={id}
      categories={categories}
      isOwner={isOwner || isAdmin}
      initialData={{
        title: song.title,
        artist: song.artist ?? "",
        key: song.key ?? "",
        tempo: song.tempo?.toString() ?? "",
        timeSignature: song.timeSignature ?? "",
        content: song.content,
        notes: song.notes ?? "",
        isPublic: song.isPublic,
        allowEdits: song.allowEdits,
        categoryId: song.categoryId ?? "",
        tagIds: song.songTags.map((st) => st.tag.name),
        referenceLinks: song.referenceLinks.map((rl) => ({
          url: rl.url,
          label: rl.label ?? "",
          type: rl.type as "youtube" | "spotify" | "soundcloud" | "drive" | "other",
        })),
      }}
    />
  )
}
