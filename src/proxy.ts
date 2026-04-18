import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Song view pages (/songs/{id}) are publicly accessible — access control is in the page itself
const SONG_VIEW_RE = /^\/songs\/[^/]+$/

export default auth((req) => {
  const { nextUrl, auth: session } = req

  const isLoggedIn = !!session?.user
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/terms")
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
  const isSongView = SONG_VIEW_RE.test(nextUrl.pathname)

  if (isApiAuth) return NextResponse.next()

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/songs", nextUrl))
    }
    return NextResponse.next()
  }

  // Allow unauthenticated access to song view pages (public songs)
  if (isSongView) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-pathname", nextUrl.pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/songs", nextUrl))
    }
  }

  // Forward pathname for layout to detect song view context
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
