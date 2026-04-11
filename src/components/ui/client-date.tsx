"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"

interface ClientDateProps {
  date: string | Date
  prefix?: string
  className?: string
}

export function ClientDate({ date, prefix, className }: ClientDateProps) {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    setFormatted(formatDate(date))
  }, [date])

  if (!formatted) return null

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}{formatted}
    </span>
  )
}
