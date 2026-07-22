"use client"

import { AlertTriangle } from "lucide-react"
import type { CliffWarning } from "@/lib/engine/types"

type CliffWarningsProps = {
  warnings: CliffWarning[]
}

type CollapsedWarning = {
  kind: CliffWarning["kind"]
  startAge: number
  endAge: number
  calendarYear: number
  messageBody: string
}

const getMessageBody = (message: string) =>
  message.replace(/^Age \d+:\s*/, "")

const formatCollapsedMessage = (
  startAge: number,
  endAge: number,
  messageBody: string
) => {
  if (startAge === endAge) {
    return `Age ${startAge}: ${messageBody}`
  }

  return `Age ${startAge}-${endAge}: ${messageBody}`
}

const collapseCliffWarnings = (warnings: CliffWarning[]): CollapsedWarning[] => {
  const unique = warnings.filter(
    (warning, index, list) =>
      list.findIndex(
        (item) =>
          item.age === warning.age &&
          item.kind === warning.kind &&
          item.message === warning.message
      ) === index
  )

  const sorted = [...unique].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind.localeCompare(right.kind)
    }

    return left.age - right.age
  })

  return sorted.reduce<CollapsedWarning[]>((groups, warning) => {
    const messageBody = getMessageBody(warning.message)
    const previous = groups[groups.length - 1]

    if (
      previous &&
      previous.kind === warning.kind &&
      previous.endAge + 1 === warning.age &&
      previous.messageBody === messageBody
    ) {
      previous.endAge = warning.age
      return groups
    }

    groups.push({
      kind: warning.kind,
      startAge: warning.age,
      endAge: warning.age,
      calendarYear: warning.calendarYear,
      messageBody,
    })

    return groups
  }, [])
}

export const CliffWarnings = ({ warnings }: CliffWarningsProps) => {
  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        No ACA cliff breaches or IRMAA surcharges detected in this plan.
      </div>
    )
  }

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
              {formatCollapsedMessage(
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
