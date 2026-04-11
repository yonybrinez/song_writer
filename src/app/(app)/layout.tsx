import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppLayoutClient } from "@/components/layout/app-layout-client"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

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
