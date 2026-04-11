"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toaster"
import { Trash2, Music } from "lucide-react"
import { ClientDate } from "@/components/ui/client-date"

interface User {
  id: string
  email: string
  name?: string | null
  role: string
  createdAt: string
  _count: { songs: number }
}

const ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#6366f1",
  EDITOR: "#22c55e",
  VIEWER: "#94a3b8",
}

export function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[]
  currentUserId: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function changeRole(userId: string, role: string) {
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const d = await res.json()
        toast(d.error || "Failed to update role", "error")
        return
      }
      const d = await res.json()
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: d.user.role } : u))
      toast("Role updated", "success")
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user and all their songs?")) return
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) { toast("Failed to delete user", "error"); return }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast("User deleted", "success")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="max-w-3xl space-y-2">
      {users.map((user) => {
        const isCurrentUser = user.id === currentUserId
        const loading = loadingId === user.id

        return (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-slate-400">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200 truncate">
                  {user.name || user.email}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                <span className="truncate">{user.email}</span>
                <span className="flex items-center gap-0.5">
                  <Music className="h-3 w-3" />
                  {user._count.songs}
                </span>
                <ClientDate date={user.createdAt} prefix="Joined " />
              </div>
            </div>

            <select
              value={user.role}
              onChange={(e) => changeRole(user.id, e.target.value)}
              disabled={isCurrentUser || loading}
              className="rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: ROLE_COLORS[user.role] }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r} style={{ color: ROLE_COLORS[r] }}>{r}</option>
              ))}
            </select>

            {!isCurrentUser && (
              <button
                onClick={() => deleteUser(user.id)}
                disabled={loading}
                className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
