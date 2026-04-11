"use client"

import { Menu, Music } from "lucide-react"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
          <Music className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-100">ChordSheet</span>
      </div>
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  )
}
