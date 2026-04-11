export interface ChordToken {
  chord: string
  lyric: string
}

export interface LyricOnlyLine {
  type: "lyric-only"
  text: string
}

export interface ChordLyricLine {
  type: "chord-lyric"
  tokens: ChordToken[]
}

export interface SectionLine {
  type: "section"
  label: string
}

export interface EmptyLine {
  type: "empty"
}

export type ParsedLine = ChordLyricLine | LyricOnlyLine | SectionLine | EmptyLine

export interface ParsedSong {
  lines: ParsedLine[]
}

const SECTION_PATTERNS = [
  /^#\s*(.+)$/,
  /^\{(?:start_of_verse|sov):\s*(.+)\}$/i,
  /^\{(?:start_of_chorus|soc):\s*(.+)\}$/i,
  /^\{(?:start_of_bridge|sob):\s*(.+)\}$/i,
  /^\{(?:start_of_tab|sot):\s*(.+)\}$/i,
  /^\{comment:\s*(.+)\}$/i,
]

function parseLine(line: string): ParsedLine {
  const trimmed = line.trim()

  if (trimmed === "") return { type: "empty" }

  for (const pattern of SECTION_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return { type: "section", label: match[1].trim() }
  }

  if (!trimmed.includes("[")) {
    return { type: "lyric-only", text: trimmed }
  }

  const tokens: ChordToken[] = []
  const regex = /\[([^\]]+)\]([^\[]*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  // handle text before the first chord
  const firstBracket = trimmed.indexOf("[")
  if (firstBracket > 0) {
    tokens.push({ chord: "", lyric: trimmed.slice(0, firstBracket) })
  }

  while ((match = regex.exec(trimmed)) !== null) {
    lastIndex = regex.lastIndex
    tokens.push({
      chord: match[1].trim(),
      lyric: match[2],
    })
  }

  if (tokens.length === 0) {
    return { type: "lyric-only", text: trimmed }
  }

  return { type: "chord-lyric", tokens }
}

export function parseChordPro(content: string): ParsedSong {
  const lines = content.split("\n").map(parseLine)
  return { lines }
}
