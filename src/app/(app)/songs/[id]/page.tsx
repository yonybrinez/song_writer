import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { SongViewPage } from "@/components/songs/song-view-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SongPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: true,
      songTags: { include: { tag: true } },
    },
  })

  if (!song) notFound()

  const isOwner = session?.user.id === song.authorId
  const isAdmin = session?.user.role === "ADMIN"

  const canEdit = isOwner || isAdmin || (song.isPublic && song.allowEdits)
  const canDelete = isOwner || isAdmin
  const canCopy = !isOwner && song.isPublic

  return (
    <SongViewPage
      song={{
        ...song,
        createdAt: song.createdAt.toISOString(),
        updatedAt: song.updatedAt.toISOString(),
      }}
      canEdit={canEdit}
      canDelete={canDelete}
      canCopy={canCopy}
    />
  )
}
