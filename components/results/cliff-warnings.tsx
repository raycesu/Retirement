"use client"

import { useId, useState, type KeyboardEvent } from "react"
import { AlertTriangle, Info } from "lucide-react"
import type { CliffWarning } from "@/lib/engine/types"
import {
  collapseCliffWarnings,
  formatCollapsedCliffMessage,
} from "@/lib/results/cliff-warnings"

type CliffWarningsProps = {
  warnings: CliffWarning[]
}

const WarningList = ({ warnings }: { warnings: CliffWarning[] }) => {
  const collapsed = collapseCliffWarnings(warnings)

  return (
    <ul className="space-y-2" aria-label="Cliff and surcharge warnings">
      {collapsed.map((warning) => (
        <li
          key={`${warning.kind}-${warning.startAge}-${warning.endAge}-${warning.calendarYear}`}
          className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <span>
            <span className="font-medium uppercase tracking-wide text-amber-900">
              {warning.kind === "aca" ? "ACA cliff" : "IRMAA"}
            </span>
            <span className="mt-1 block text-foreground/90">
              {formatCollapsedCliffMessage(
                warning.startAge,
                warning.endAge,
                warning.messageBody
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export const CliffWarnings = ({ warnings }: CliffWarningsProps) => {
  const tooltipId = useId()
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        No ACA cliff breaches or IRMAA surcharges detected in this plan.
      </div>
    )
  }

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
    <section className="space-y-3" aria-labelledby="warnings-heading">
      <div className="flex items-center gap-2">
        <h3
          id="warnings-heading"
          className="font-heading text-lg font-semibold text-[#122820]"
        >
          Cliff warnings
        </h3>
        <div
          className="relative"
          onMouseEnter={handleOpenTooltip}
          onMouseLeave={handleCloseTooltip}
        >
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-full text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
            aria-label="Show cliff warnings"
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
              className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,24rem)] rounded-xl border border-border/70 bg-white p-3 shadow-lg"
            >
              <WarningList warnings={warnings} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
