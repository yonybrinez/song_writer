"use client"

import { useState, useRef, useEffect } from "react"
import { Download, FileText, FileCode, File, ChevronDown } from "lucide-react"
import { toast } from "@/components/ui/toaster"

interface ExportMenuProps {
  songId: string
  songTitle: string
  content: string
}

export function ExportMenu({ songId, songTitle, content }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function exportAs(format: "markdown" | "html" | "pdf") {
    setLoading(format)
    setOpen(false)
    try {
      if (format === "pdf") {
        const htmlRes = await fetch(`/api/songs/${songId}/export?format=html`)
        if (!htmlRes.ok) throw new Error()
        const htmlContent = await htmlRes.text()

        const win = window.open("", "_blank")
        if (!win) throw new Error("popup blocked")
        win.document.open()
        win.document.write(htmlContent)
        win.document.close()
        win.addEventListener("load", () => {
          setTimeout(() => {
            win.focus()
            win.print()
          }, 250)
        })
        toast("Print dialog opened — save as PDF", "success")
      } else {
        const res = await fetch(
          `/api/songs/${songId}/export?format=${format === "html" ? "html-download" : format}`
        )
        if (!res.ok) throw new Error()
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${songTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format === "markdown" ? "md" : "html"}`
        a.click()
        URL.revokeObjectURL(url)
        toast(`${format.toUpperCase()} exported`, "success")
      }
    } catch {
      toast("Export failed", "error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative no-print" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:border-slate-700"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-xl z-50 dark:border-slate-700 dark:bg-slate-800">
          <div className="py-1">
            {[
              { fmt: "pdf" as const, label: "PDF", icon: File },
              { fmt: "markdown" as const, label: "Markdown", icon: FileText },
              { fmt: "html" as const, label: "HTML", icon: FileCode },
            ].map(({ fmt, label, icon: Icon }) => (
              <button
                key={fmt}
                onClick={() => exportAs(fmt)}
                disabled={loading !== null}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {loading === fmt ? "Exporting..." : label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
