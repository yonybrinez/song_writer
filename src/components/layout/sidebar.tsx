"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Music, LayoutGrid, Users, LogOut, ChevronRight, HelpCircle } from "lucide-react"

interface SidebarProps {
  userRole: string
  userName: string
  userEmail: string
}

const navItems = [
  { href: "/songs", label: "Songs", icon: Music, roles: ["VIEWER", "EDITOR", "ADMIN"] },
  { href: "/categories", label: "Categories", icon: LayoutGrid, roles: ["ADMIN"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/help", label: "Help", icon: HelpCircle, roles: ["VIEWER", "EDITOR", "ADMIN"] },
]

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-100">ChordSheet</div>
          <div className="text-xs text-slate-500">Song Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                    active
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                  {item.label}
                  {active && <ChevronRight className="ml-auto h-3 w-3" />}
                </Link>
              )
            })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 text-xs font-bold flex-shrink-0">
            {(userName || userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-200">{userName || "User"}</div>
            <div className="truncate text-xs text-slate-500">{userRole}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
