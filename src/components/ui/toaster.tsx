"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2)
  currentToasts = [...currentToasts, { id, message, type }]
  toastListeners.forEach((l) => l(currentToasts))
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    toastListeners.forEach((l) => l(currentToasts))
  }, 4000)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all fade-in",
            t.type === "success" && "bg-emerald-600 text-white",
            t.type === "error" && "bg-red-600 text-white",
            t.type === "info" && "bg-indigo-600 text-white"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
