"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { YearResult } from "@/lib/engine/types"
import { formatCurrency } from "@/lib/format"

type BalanceChartProps = {
  years: YearResult[]
}

export const BalanceChart = ({ years }: BalanceChartProps) => {
  if (years.length === 0) {
    return null
  }

  const data = years.map((year) => ({
    age: year.age,
    traditional: Math.round(year.endingBalances.traditional401k),
    roth: Math.round(
      year.endingBalances.roth.contributions + year.endingBalances.roth.earnings
    ),
    brokerage: Math.round(year.endingBalances.brokerage.balance),
  }))

  return (
    <div className="h-80 w-full" role="img" aria-label="Account balances over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          <Area
            type="monotone"
            dataKey="traditional"
            stackId="1"
            stroke="#1f4b3a"
            fill="#1f4b3a"
            fillOpacity={0.75}
            name="Traditional"
          />
          <Area
            type="monotone"
            dataKey="roth"
            stackId="1"
            stroke="#c45c26"
            fill="#c45c26"
            fillOpacity={0.75}
            name="Roth"
          />
          <Area
            type="monotone"
            dataKey="brokerage"
            stackId="1"
            stroke="#2f6fed"
            fill="#2f6fed"
            fillOpacity={0.7}
            name="Brokerage"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
