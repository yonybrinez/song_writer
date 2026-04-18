import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AppLayoutClient } from "@/components/layout/app-layout-client"

// Song view pages allow unauthenticated access — the page handles access control
const SONG_VIEW_RE = /^\/songs\/[^/]+$/

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") ?? ""
    if (!SONG_VIEW_RE.test(pathname)) {
      redirect("/login")
    }
    return <>{children}</>
  }

  return (
    <AppLayoutClient
      userRole={session.user.role}
      userName={session.user.name ?? ""}
      userEmail={session.user.email}
    >
      {children}
    </AppLayoutClient>
  )
}
