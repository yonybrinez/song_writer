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

  const canEdit =
    session?.user.role === "ADMIN" ||
    (session?.user.role === "EDITOR" && song.authorId === session.user.id)

  return (
    <SongViewPage
      song={{
        ...song,
        createdAt: song.createdAt.toISOString(),
        updatedAt: song.updatedAt.toISOString(),
      }}
      canEdit={canEdit}
      userId={session?.user.id}
    />
  )
}
