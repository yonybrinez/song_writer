import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const ROLE_ORDER: Record<string, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { session }
}

export async function requireRole(minRole: "VIEWER" | "EDITOR" | "ADMIN") {
  const result = await requireAuth()
  if ("error" in result) return result

  const { session } = result
  const userRoleLevel = ROLE_ORDER[session.user.role] ?? 0
  const minRoleLevel = ROLE_ORDER[minRole]

  if (userRoleLevel < minRoleLevel) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { session }
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN"
}

export function isEditor(role: string): boolean {
  return role === "EDITOR" || role === "ADMIN"
}
