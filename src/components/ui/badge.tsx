import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
  variant?: "default" | "outline"
}

export function Badge({ children, color, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-700 text-slate-300",
        variant === "outline" && "border border-slate-600 text-slate-400",
        className
      )}
      style={color ? { backgroundColor: color + "33", color, borderColor: color + "66" } : undefined}
    >
      {children}
    </span>
  )
}
