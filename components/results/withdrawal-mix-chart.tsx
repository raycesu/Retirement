"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { YearResult } from "@/lib/engine/types"
import { formatCurrency } from "@/lib/format"

type WithdrawalMixChartProps = {
  years: YearResult[]
}

export const WithdrawalMixChart = ({ years }: WithdrawalMixChartProps) => {
  if (years.length === 0) {
    return null
  }

  const data = years.map((year) => ({
    age: year.age,
    traditional: Math.round(year.withdrawals.traditional401k),
    roth: Math.round(
      year.withdrawals.rothContributions + year.withdrawals.rothEarnings
    ),
    brokerage: Math.round(
      year.withdrawals.brokerageBasis + year.withdrawals.brokerageGains
    ),
  }))

  return (
    <div
      className="h-80 w-full"
      role="img"
      aria-label="Withdrawal mix by account over time"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="age" tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value ?? 0))}
            labelFormatter={(age) => `Age ${age}`}
          />
          <Legend />
          <Bar dataKey="traditional" stackId="a" fill="#1f4b3a" name="Traditional" />
          <Bar dataKey="roth" stackId="a" fill="#c45c26" name="Roth" />
          <Bar dataKey="brokerage" stackId="a" fill="#2f6fed" name="Brokerage" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
