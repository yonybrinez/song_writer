"use client"

import { useMemo, useState } from "react"
import { parseChordPro, type ParsedLine } from "@/lib/chordpro/parser"
import { cn } from "@/lib/utils"

interface SongViewerProps {
  content: string
  fontSize?: number
  className?: string
}

function ChordLyricLine({ line }: { line: Extract<ParsedLine, { type: "chord-lyric" }> }) {
  const hasChords = line.tokens.some((t) => t.chord !== "")

  return (
    <div className="chord-line mb-1">
      {line.tokens.map((token, i) => (
        <span key={i} className="chord-token">
          {hasChords && (
            <span className="chord-name">
              {token.chord || " "}
            </span>
          )}
          <span className="lyric-text">{token.lyric || "\u00A0"}</span>
        </span>
      ))}
    </div>
  )
}

export function SongViewer({ content, fontSize = 16, className }: SongViewerProps) {
  const parsed = useMemo(() => parseChordPro(content), [content])

  if (!content.trim()) {
    return (
      <div className={cn("text-slate-500 italic text-sm", className)}>
        No content yet.
      </div>
    )
  }

  return (
    <div
      className={cn("font-mono leading-relaxed", className)}
      style={{ fontSize: `${fontSize}px` }}
    >
      {parsed.lines.map((line, idx) => {
        if (line.type === "empty") {
          return <div key={idx} className="h-3" />
        }
        if (line.type === "section") {
          return (
            <div key={idx} className="section-label">
              {line.label}
            </div>
          )
        }
        if (line.type === "lyric-only") {
          return (
            <div key={idx} className="lyric-text mb-0.5 text-slate-200">
              {line.text}
            </div>
          )
        }
        if (line.type === "chord-lyric") {
          return <ChordLyricLine key={idx} line={line} />
        }
        return null
      })}
    </div>
  )
}
