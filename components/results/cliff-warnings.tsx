"use client"

import { AlertTriangle } from "lucide-react"
import type { CliffWarning } from "@/lib/engine/types"

type CliffWarningsProps = {
  warnings: CliffWarning[]
}

export const CliffWarnings = ({ warnings }: CliffWarningsProps) => {
  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        No ACA cliff breaches or IRMAA surcharges detected in this plan.
      </div>
    )
  }

  const unique = warnings.filter(
    (warning, index, list) =>
      list.findIndex(
        (item) =>
          item.age === warning.age &&
          item.kind === warning.kind &&
          item.message === warning.message
      ) === index
  )

  return (
    <ul className="space-y-2" aria-label="Cliff and surcharge warnings">
      {unique.map((warning) => (
        <li
          key={`${warning.kind}-${warning.age}-${warning.calendarYear}`}
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
            <span className="mt-1 block text-foreground/90">{warning.message}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
