import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UsersManager } from "@/components/admin/users-manager"

export default async function AdminUsersPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/songs")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { songs: true } },
    },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-100">Users</h1>
        <p className="text-xs text-slate-500">{users.length} users</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <UsersManager
          initialUsers={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  )
}
