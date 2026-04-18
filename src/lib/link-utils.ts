export type LinkType = "youtube" | "spotify" | "soundcloud" | "drive" | "other"

export function detectLinkType(url: string): LinkType {
  const lower = url.toLowerCase()
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube"
  if (lower.includes("spotify.com")) return "spotify"
  if (lower.includes("soundcloud.com")) return "soundcloud"
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) return "drive"
  return "other"
}

export const LINK_TYPE_CONFIG: Record<
  LinkType,
  { label: string; color: string; bg: string; border: string }
> = {
  youtube:    { label: "YouTube",    color: "text-red-400",    bg: "bg-red-600/15",    border: "border-red-500/30"    },
  spotify:    { label: "Spotify",    color: "text-green-400",  bg: "bg-green-600/15",  border: "border-green-500/30"  },
  soundcloud: { label: "SoundCloud", color: "text-orange-400", bg: "bg-orange-600/15", border: "border-orange-500/30" },
  drive:      { label: "Drive",      color: "text-blue-400",   bg: "bg-blue-600/15",   border: "border-blue-500/30"   },
  other:      { label: "Link",       color: "text-slate-400",  bg: "bg-slate-700/40",  border: "border-slate-600/40"  },
}

export function formatDisplayUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const short = pathname.replace(/\/$/, "").split("/").pop() || hostname
    return `${hostname}${short !== hostname ? `/${short}` : ""}`
  } catch {
    return url
  }
}
