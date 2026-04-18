import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const referenceLinkSchema = z.object({
  url: z.string().url("Invalid URL").max(2000),
  label: z.string().max(100).optional(),
  type: z.enum(["youtube", "spotify", "soundcloud", "drive", "other"]).default("other"),
})

export const songSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  artist: z.string().max(200).optional(),
  key: z.string().max(10).optional(),
  tempo: z.number().int().min(20).max(300).optional().nullable(),
  timeSignature: z.string().max(10).optional(),
  content: z.string().default(""),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false),
  allowEdits: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  referenceLinks: z.array(referenceLinkSchema).default([]),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").default("#6366f1"),
})

export const transposeSchema = z.object({
  semitones: z.number().int().min(-12).max(12),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SongInput = z.infer<typeof songSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
