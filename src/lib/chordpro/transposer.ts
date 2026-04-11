const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

// Map flat to sharp index for lookup
const FLAT_TO_IDX: Record<string, number> = {
  Db: 1, Eb: 3, Gb: 6, Ab: 8, Bb: 10,
}

function noteToIndex(note: string): number {
  const sharpIdx = SHARPS.indexOf(note)
  if (sharpIdx !== -1) return sharpIdx
  const flatIdx = FLAT_TO_IDX[note]
  if (flatIdx !== undefined) return flatIdx
  return -1
}

function transposeNote(note: string, semitones: number): string {
  const idx = noteToIndex(note)
  if (idx === -1) return note

  const newIdx = ((idx + semitones) % 12 + 12) % 12
  // Prefer flats if original was flat, otherwise sharps
  const preferFlats = FLATS.includes(note) && !SHARPS.includes(note)
  return preferFlats ? FLATS[newIdx] : SHARPS[newIdx]
}

// Matches: root(A-G) + optional accidental(#/b) + optional quality + optional extension + optional /bass
const CHORD_REGEX = /^([A-G])(#|b)?((?:m(?!aj))?(?:maj|dim|aug|sus)?)((?:\d+|sus\d+|add\d+|M\d+)*)(?:\/([A-G][#b]?))?$/

function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord

  const match = chord.match(CHORD_REGEX)
  if (!match) return chord

  const [, root, accidental, quality, extension, bassNote] = match
  const fullRoot = root + (accidental ?? "")
  const newRoot = transposeNote(fullRoot, semitones)
  const newBass = bassNote ? transposeNote(bassNote, semitones) : null

  return [newRoot, quality, extension, newBass ? `/${newBass}` : ""].join("")
}

export function transposeChordPro(content: string, semitones: number): string {
  if (semitones === 0) return content
  return content.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`)
}

export function transposeKey(key: string, semitones: number): string {
  return transposeChord(key, semitones)
}

export function getKeyFromSemitones(originalKey: string, semitones: number): string {
  return transposeKey(originalKey, semitones)
}
