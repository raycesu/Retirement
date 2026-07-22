"use client"

import { useState, type KeyboardEvent } from "react"
import { ChevronRight } from "lucide-react"
import type { YearResult } from "@/lib/engine/types"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import {
  buildYearlyPlanBlocks,
  getEndingTotal,
  getWithdrawalSourceLabel,
  getYearlyPlanSummary,
  type YearlyPlanBlock,
} from "@/lib/results/yearly-plan"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type YearlyPlanProps = {
  years: YearResult[]
}

const BlockDetailTable = ({ years }: { years: YearResult[] }) => {
  return (
    <div className="overflow-x-auto border-t border-border/60 px-3 pb-3 pt-1 sm:px-4">
      <Table aria-label="Year details for this age range">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
              Age
            </TableHead>
            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
              Source
            </TableHead>
            <TableHead className="h-9 text-right text-xs font-medium text-muted-foreground">
              Spending
            </TableHead>
            <TableHead className="h-9 text-right text-xs font-medium text-muted-foreground">
              Tax
            </TableHead>
            <TableHead className="h-9 text-right text-xs font-medium text-muted-foreground">
              Ending
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((year) => (
            <TableRow key={`${year.age}-${year.calendarYear}`}>
              <TableCell className="py-2.5 font-medium text-[#122820]">
                {year.age}
              </TableCell>
              <TableCell className="py-2.5 text-[#122820]">
                {getWithdrawalSourceLabel(year)}
              </TableCell>
              <TableCell className="py-2.5 text-right font-medium text-[#122820]">
                {formatCurrency(year.afterTaxSpending)}
              </TableCell>
              <TableCell className="py-2.5 text-right font-medium text-[#122820]">
                {formatCurrency(year.federalTax)}
              </TableCell>
              <TableCell className="py-2.5 text-right font-semibold text-[#122820]">
                {formatCurrency(getEndingTotal(year))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

type PlanBlockProps = {
  block: YearlyPlanBlock
  isOpen: boolean
  onToggle: () => void
}

const PlanBlock = ({ block, isOpen, onToggle }: PlanBlockProps) => {
  const panelId = `yearly-plan-block-${block.id}`
  const labelId = `${panelId}-label`

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onToggle()
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70">
      <button
        type="button"
        id={labelId}
        className="flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Ages ${block.startAge} to ${block.endAge}${
          block.flag ? `, ${block.flag.label}` : ""
        }, ends ${formatCompactCurrency(block.endingTotal)}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-90"
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className="font-heading text-sm font-semibold text-[#122820] sm:text-base"
            >
              Ages {block.startAge}–{block.endAge}
            </span>
            {block.flag ? (
              <span className="inline-flex max-w-full rounded-full bg-[#c45c26]/15 px-2.5 py-0.5 text-xs font-medium text-[#9a4318]">
                {block.flag.label}
              </span>
            ) : null}
          </span>
        </span>
        <span className="shrink-0 text-sm text-muted-foreground">
          ends {formatCompactCurrency(block.endingTotal)}
        </span>
      </button>
      {isOpen ? (
        <div id={panelId} role="region" aria-labelledby={labelId}>
          <BlockDetailTable years={block.years} />
        </div>
      ) : null}
    </div>
  )
}

export const YearlyPlan = ({ years }: YearlyPlanProps) => {
  const [openBlockIds, setOpenBlockIds] = useState<Set<string>>(() => new Set())

  if (years.length === 0) {
    return null
  }

  const summary = getYearlyPlanSummary(years)
  const blocks = buildYearlyPlanBlocks(years)

  if (!summary) {
    return null
  }

  const handleToggleBlock = (blockId: string) => {
    setOpenBlockIds((current) => {
      const next = new Set(current)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 text-xs font-medium text-muted-foreground">
        <span>Age {summary.firstAge}</span>
        <span>Age {summary.lastAge}</span>
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <PlanBlock
            key={block.id}
            block={block}
            isOpen={openBlockIds.has(block.id)}
            onToggle={() => handleToggleBlock(block.id)}
          />
        ))}
      </div>
    </div>
  )
}
