import { cn } from "../../utils/cn"

const variants = {
  default: "bg-accent-blue/15 text-accent-blue border border-accent-blue/25",
  success: "bg-accent-green/15 text-accent-green border border-accent-green/25",
  cyan: "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20",
  win95: "win95-bevel-inset bg-win95-bg text-black",
  outline: "bg-transparent text-text-muted border border-win95-shadow/30",
}

export function Badge({ variant = "default", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
