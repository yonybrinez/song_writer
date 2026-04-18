"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toaster"
import { updateProfileSchema } from "@/lib/validations"
import { User, Mail, Lock, Trash2, AlertTriangle } from "lucide-react"

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required"),
})
type DeleteInput = z.infer<typeof deleteSchema>
type UpdateInput = z.infer<typeof updateProfileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [showDeleteZone, setShowDeleteZone] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  })

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
    reset: resetDelete,
  } = useForm<DeleteInput>({ resolver: zodResolver(deleteSchema) })

  const currentEmail = session?.user?.email ?? ""
  const watchedEmail = watch("email")
  const emailChanging = watchedEmail !== currentEmail

  async function onSave(data: UpdateInput) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      toast(json.error || "Failed to update profile", "error")
      return
    }
    await updateSession({ name: json.user.name, email: json.user.email })
    toast("Profile updated", "success")
    router.refresh()
  }

  async function onDelete(data: DeleteInput) {
    setDeleting(true)
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        toast(json.error || "Failed to delete account", "error")
        return
      }
      toast("Account deleted", "success")
      await signOut({ callbackUrl: "/login" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-100">Profile & Account</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your name, email, and account settings.</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <User className="h-3.5 w-3.5" />
            Display information
          </div>

          <Input
            {...register("name")}
            id="name"
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            error={errors.name?.message}
          />

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              <Mail className="h-3.5 w-3.5" />
              Login email
            </div>

            <Input
              {...register("email")}
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
            />

            {emailChanging && (
              <div className="mt-3">
                <Input
                  {...register("currentPassword")}
                  id="currentPassword"
                  type="password"
                  label="Current password (required to change email)"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.currentPassword?.message}
                />
              </div>
            )}
          </div>
        </div>

        <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-full">
          Save changes
        </Button>
      </form>

      {/* Danger zone */}
      <div className="mt-10">
        <div className="rounded-xl border border-red-500/20 bg-slate-900 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
            <AlertTriangle className="h-3.5 w-3.5" />
            Danger zone
          </div>

          {!showDeleteZone ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">Delete your account</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your songs will be transferred to a platform editor. This cannot be undone.
                </p>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowDeleteZone(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDeleteSubmit(onDelete)} className="space-y-4">
              <p className="text-sm text-slate-300">
                Enter your password to confirm. Your songs will be transferred to the platform
                editor account — this action is <strong>permanent</strong>.
              </p>
              <Input
                {...registerDelete("password")}
                id="deletePassword"
                type="password"
                label="Confirm with your password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={deleteErrors.password?.message}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowDeleteZone(false); resetDelete() }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" loading={deleting}>
                  <Lock className="h-3.5 w-3.5" />
                  Permanently delete my account
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
