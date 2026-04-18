import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
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
      source: {
        select: {
          id: true,
          title: true,
          author: { select: { name: true, email: true } },
        },
      },
    },
  })

  if (!song) notFound()

  // Private songs require authentication
  if (!song.isPublic) {
    if (!session?.user) redirect("/login")
    const isOwner = session.user.id === song.authorId
    const isAdmin = session.user.role === "ADMIN"
    if (!isOwner && !isAdmin) notFound()
  }

  const isAuthenticated = !!session?.user
  const isOwner = session?.user?.id === song.authorId
  const isAdmin = session?.user?.role === "ADMIN"

  const canEdit = isAuthenticated && (isOwner || isAdmin || (song.isPublic && song.allowEdits))
  const canDelete = isAuthenticated && (isOwner || isAdmin)
  const canCopy = isAuthenticated && !isOwner && song.isPublic

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
      isAuthenticated={isAuthenticated}
    />
  )
}
