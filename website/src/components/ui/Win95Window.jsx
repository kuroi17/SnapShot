import { cn } from "../../utils/cn"

export function Win95Window({
  title = "Untitled",
  icon,
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "win95-bevel-outset inline-flex flex-col min-w-[240px] animate-[win95-window-open_0.2s_ease-out]",
        className
      )}
      {...props}
    >
      <div className="win95-titlebar flex items-center gap-1 px-1 py-0.5 text-[11px] select-none">
        {icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
        <span className="flex-1 truncate tracking-normal">{title}</span>
        <div className="flex items-center gap-[2px]">
          <button className="win95-titlebar-btn" aria-label="Minimize">_</button>
          <button className="win95-titlebar-btn" aria-label="Maximize">口</button>
          <button className="win95-titlebar-btn" aria-label="Close">&#10005;</button>
        </div>
      </div>
      <div className="p-3 text-sm text-black">
        {children}
      </div>
    </div>
  )
}
