import { cn } from "../../utils/cn"

export function Tooltip({ label, shortcut, className, children, ...props }) {
  return (
    <div className={cn("group relative inline-flex", className)} {...props}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 whitespace-nowrap">
        <div className="win95-bevel-outset px-2 py-1 text-[11px] font-sans text-black shadow-lg">
          <span className="flex items-center gap-1.5">
            {label && <span>{label}</span>}
            {shortcut && (
              <kbd className="win95-bevel-inset px-1 py-[1px] text-[10px] font-mono bg-win95-bg text-black leading-none">
                {shortcut}
              </kbd>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
