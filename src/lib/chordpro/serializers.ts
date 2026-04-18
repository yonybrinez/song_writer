import { type ParsedSong, type ChordLyricLine, parseChordPro } from "./parser"

function buildChordRow(tokens: ChordLyricLine["tokens"]): string {
  let chordRow = ""
  let lyricRow = ""

  for (const token of tokens) {
    const lyric = token.lyric
    const chord = token.chord

    if (!chord) {
      chordRow += " ".repeat(lyric.length)
      lyricRow += lyric
      continue
    }

    const segmentWidth = Math.max(chord.length + 1, lyric.length)
    chordRow += chord.padEnd(segmentWidth)
    lyricRow += lyric.padEnd(segmentWidth)
  }

  return chordRow.trimEnd() + "\n" + lyricRow.trimEnd()
}

export function toMarkdown(content: string, title: string, artist?: string, key?: string): string {
  const song = parseChordPro(content)
  const lines: string[] = []

  lines.push(`# ${title}`)
  if (artist) lines.push(`**Artist:** ${artist}`)
  if (key) lines.push(`**Key:** ${key}`)
  lines.push("")

  for (const line of song.lines) {
    if (line.type === "empty") {
      lines.push("")
    } else if (line.type === "section") {
      lines.push(`## ${line.label}`)
      lines.push("")
    } else if (line.type === "lyric-only") {
      lines.push(line.text)
    } else if (line.type === "chord-lyric") {
      lines.push("```")
      lines.push(buildChordRow(line.tokens))
      lines.push("```")
    }
  }

  return lines.join("\n")
}

export function toHtml(
  content: string,
  title: string,
  artist?: string,
  key?: string
): string {
  const song = parseChordPro(content)
  const bodyLines: string[] = []

  for (const line of song.lines) {
    if (line.type === "empty") {
      bodyLines.push('<div class="empty-line"></div>')
    } else if (line.type === "section") {
      bodyLines.push(`<div class="section-label">${escapeHtml(line.label)}</div>`)
    } else if (line.type === "lyric-only") {
      bodyLines.push(`<div class="lyric-only">${escapeHtml(line.text)}</div>`)
    } else if (line.type === "chord-lyric") {
      const spans = line.tokens.map((t) => {
        const chord = t.chord
          ? `<span class="chord">${escapeHtml(t.chord)}</span>`
          : `<span class="chord-empty"></span>`
        const lyric = `<span class="lyric">${escapeHtml(t.lyric) || "&nbsp;"}</span>`
        return `<span class="token">${chord}${lyric}</span>`
      })
      bodyLines.push(`<div class="chord-line">${spans.join("")}</div>`)
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #ffffff;
    color: #1e293b;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 16px;
    line-height: 1.6;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
  }
  h1 { font-size: 2rem; color: #0f172a; margin-bottom: 0.25rem; font-family: sans-serif; }
  .meta { color: #64748b; font-family: sans-serif; margin-bottom: 2rem; }
  .section-label {
    color: #64748b;
    font-style: italic;
    font-size: 0.9em;
    margin: 1.5rem 0 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: sans-serif;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.25rem;
  }
  .chord-line { display: flex; flex-wrap: wrap; margin-bottom: 0.125rem; }
  .token { display: inline-flex; flex-direction: column; }
  .chord { color: #4f46e5; font-weight: 700; font-size: 0.85em; min-height: 1.2em; white-space: pre; }
  .chord-empty { min-height: 1.2em; }
  .lyric { color: #1e293b; white-space: pre; }
  .lyric-only { color: #1e293b; margin-bottom: 0.125rem; }
  .empty-line { height: 1rem; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">${artist ? escapeHtml(artist) : ""}${key ? ` &bull; Key: ${escapeHtml(key)}` : ""}</div>
${bodyLines.join("\n")}
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
