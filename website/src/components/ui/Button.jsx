import { cn } from "../../utils/cn"

const variants = {
  win95: "win95-bevel-outset active:win95-bevel-inset px-4 py-1 text-sm font-sans text-black cursor-pointer select-none active:translate-y-px",
  glow: "bg-accent-blue text-white px-5 py-2 text-sm font-sans font-medium rounded-none cursor-pointer select-none hover:bg-accent-cyan hover:text-black transition-all duration-200 active:scale-[0.98]",
  ghost: "bg-transparent text-text-muted px-3 py-1.5 text-sm font-sans cursor-pointer select-none hover:text-text-main hover:bg-dark-card-hover transition-colors duration-150",
}

const sizes = {
  sm: "text-xs px-3 py-1",
  md: "text-sm px-4 py-1.5",
  lg: "text-base px-6 py-2",
}

export function Button({ variant = "win95", size = "md", className, children, ...props }) {
  return (
    <button className={cn(variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
