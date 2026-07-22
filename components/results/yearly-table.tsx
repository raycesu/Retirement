"use client"

import type { YearResult } from "@/lib/engine/types"
import { formatCurrency } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type YearlyTableProps = {
  years: YearResult[]
}

export const YearlyTable = ({ years }: YearlyTableProps) => {
  if (years.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <Table aria-label="Year-by-year withdrawal plan">
        <TableHeader>
          <TableRow>
            <TableHead>Age</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Traditional</TableHead>
            <TableHead className="text-right">Roth</TableHead>
            <TableHead className="text-right">Brokerage</TableHead>
            <TableHead className="text-right">RMD</TableHead>
            <TableHead className="text-right">Federal tax</TableHead>
            <TableHead className="text-right">Spending</TableHead>
            <TableHead className="text-right">Ending total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((year) => {
            const roth =
              year.withdrawals.rothContributions + year.withdrawals.rothEarnings
            const brokerage =
              year.withdrawals.brokerageBasis + year.withdrawals.brokerageGains
            const ending =
              year.endingBalances.traditional401k +
              year.endingBalances.roth.contributions +
              year.endingBalances.roth.earnings +
              year.endingBalances.brokerage.balance

            return (
              <TableRow key={`${year.age}-${year.calendarYear}`}>
                <TableCell>{year.age}</TableCell>
                <TableCell>{year.calendarYear}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(year.withdrawals.traditional401k)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(roth)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(brokerage)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(year.rmdRequired)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(year.federalTax)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(year.afterTaxSpending)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(ending)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
