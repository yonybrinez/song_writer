"use client"

import { useState, useEffect, useRef } from "react"
import { X, Hash } from "lucide-react"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setAllTags((d.tags || []).map((t: { name: string }) => t.name)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }
    const filtered = allTags.filter(
      (t) => t.toLowerCase().includes(input.toLowerCase()) && !value.includes(t)
    )
    setSuggestions(filtered.slice(0, 5))
  }, [input, allTags, value])

  function addTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
    if (e.key === "Escape") setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">Tags</label>
      <div
        className="relative flex min-h-[2.5rem] flex-wrap items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600/20 border border-indigo-500/40 px-2 py-0.5 text-xs text-indigo-300"
          >
            <Hash className="h-2.5 w-2.5" />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="text-indigo-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[6rem] bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
        />

        {suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Hash className="h-3 w-3 text-slate-500" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600">Press Enter or comma to add a tag</p>
    </div>
  )
}
