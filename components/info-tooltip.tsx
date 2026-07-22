"use client"

import { useId, useState, type KeyboardEvent, type ReactNode } from "react"
import { Info } from "lucide-react"

type InfoTooltipProps = {
  label: string
  children: ReactNode
}

export const InfoTooltip = ({ label, children }: InfoTooltipProps) => {
  const tooltipId = useId()
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const handleOpenTooltip = () => {
    setIsTooltipOpen(true)
  }

  const handleCloseTooltip = () => {
    setIsTooltipOpen(false)
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setIsTooltipOpen(false)
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleOpenTooltip}
      onMouseLeave={handleCloseTooltip}
    >
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded-full text-[#3C5A72] transition-colors hover:bg-[#132A40]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132A40]/40"
        aria-label={label}
        aria-describedby={isTooltipOpen ? tooltipId : undefined}
        aria-expanded={isTooltipOpen}
        onFocus={handleOpenTooltip}
        onBlur={handleCloseTooltip}
        onKeyDown={handleTriggerKeyDown}
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
      {isTooltipOpen ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] space-y-2 rounded-xl border border-[#132A40]/15 bg-white p-3 text-sm text-[#3C5A72] shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
