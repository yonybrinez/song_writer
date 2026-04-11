"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { SongViewer } from "./song-viewer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Eye, Edit3, HelpCircle } from "lucide-react"

interface SongEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

type Mode = "edit" | "split" | "preview"

const HELP_TEXT = `ChordPro format — place chords in [brackets] before the letter:

[G]Amazing [C]grace, how [G]sweet the [D]sound
[G]That saved a [C]wretch like [G]me

Use # to mark sections:
# Verse 1
# Chorus
# Bridge

Example:
# Verse 1
[G]Amazing [C]grace, how [G]sweet the [D]sound
[G]That saved a [C]wretch like [G]me`

export function SongEditor({ value, onChange, className }: SongEditorProps) {
  const [mode, setMode] = useState<Mode>("split")
  const [showHelp, setShowHelp] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart
        const end = el.selectionEnd
        const newValue = value.slice(0, start) + "  " + value.slice(end)
        onChange(newValue)
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2
        })
      }

      // Shortcut: Ctrl+[ to insert chord bracket
      if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart
        const selected = value.slice(start, el.selectionEnd)
        const insertion = selected ? `[${selected}]` : "[]"
        const newValue = value.slice(0, start) + insertion + value.slice(el.selectionEnd)
        onChange(newValue)
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + (selected ? insertion.length : 1)
        })
      }
    },
    [value, onChange]
  )

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/50 no-print">
        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
          {(["edit", "split", "preview"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {m === "edit" ? <span className="flex items-center gap-1"><Edit3 className="h-3 w-3" />Edit</span>
               : m === "split" ? "Split"
               : <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Preview</span>}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          title="ChordPro format help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-400 font-mono whitespace-pre no-print">
          {HELP_TEXT}
        </div>
      )}

      {/* Content area */}
      <div className={cn("flex-1 flex min-h-0", mode === "split" && "divide-x divide-slate-800")}>
        {/* Editor pane */}
        {(mode === "edit" || mode === "split") && (
          <div className={cn("flex flex-col", mode === "split" ? "w-1/2" : "w-full")}>
            <div className="px-3 py-1.5 text-xs text-slate-600 border-b border-slate-800/50 font-mono no-print">
              ChordPro source · <kbd className="bg-slate-800 px-1 rounded text-slate-500">Ctrl+[</kbd> inserts chord
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className={cn(
                "flex-1 w-full resize-none bg-transparent px-4 py-3 text-sm font-mono text-slate-300",
                "focus:outline-none placeholder:text-slate-600",
                "leading-relaxed"
              )}
              placeholder={"# Verse 1\n[G]Amazing [C]grace, how [G]sweet the [D]sound\n[G]That saved a [C]wretch like [G]me\n\n# Chorus\n[D]Praise [G]God..."}
            />
          </div>
        )}

        {/* Preview pane */}
        {(mode === "preview" || mode === "split") && (
          <div className={cn("flex flex-col overflow-y-auto", mode === "split" ? "w-1/2" : "w-full")}>
            <div className="px-3 py-1.5 text-xs text-slate-600 border-b border-slate-800/50 no-print">
              Live preview
            </div>
            <div className="flex-1 px-4 py-3 overflow-y-auto">
              <SongViewer content={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
