"use client"

import { BalanceChart } from "@/components/results/balance-chart"
import { CliffWarnings } from "@/components/results/cliff-warnings"
import { WithdrawalMixChart } from "@/components/results/withdrawal-mix-chart"
import { YearlyTable } from "@/components/results/yearly-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"
import { useSimulatorStore } from "@/lib/store"

export const ResultsPanel = () => {
  const result = useSimulatorStore((state) => state.result)
  const isRunning = useSimulatorStore((state) => state.isRunning)
  const error = useSimulatorStore((state) => state.error)

  if (isRunning) {
    return (
      <div
        className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Re-optimizing withdrawal order year by year…
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive"
        role="alert"
      >
        {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center text-muted-foreground">
        Run the simulation to see your sustainable spending level and year-by-year
        withdrawal sequence.
      </div>
    )
  }

  return (
    <section className="space-y-6" aria-labelledby="results-heading">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[#e8f3ef] via-white to-[#e6eef8] p-6">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#4d6a60]">
          Max sustainable spending
        </p>
        <h2
          id="results-heading"
          className="mt-2 font-heading text-4xl font-semibold tracking-tight text-[#122820] sm:text-5xl"
        >
          {formatCurrency(result.sustainableAnnualSpending)}
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            / year (today&apos;s dollars)
          </span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Lifetime after-tax spending across the plan:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(result.totalLifetimeTaxSpending)}
          </span>
          . Each year&apos;s source mix is chosen to minimize marginal tax cost
          given that year&apos;s brackets, RMDs, and cliff proximity.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold">Cliff warnings</h3>
        <CliffWarnings warnings={result.cliffWarnings} />
      </div>

      <Tabs defaultValue="balances" className="w-full">
        <TabsList aria-label="Result views">
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="mix">Withdrawal mix</TabsTrigger>
          <TabsTrigger value="table">Yearly table</TabsTrigger>
        </TabsList>
        <TabsContent value="balances" className="rounded-xl border border-border/70 p-4">
          <BalanceChart years={result.years} />
        </TabsContent>
        <TabsContent value="mix" className="rounded-xl border border-border/70 p-4">
          <WithdrawalMixChart years={result.years} />
        </TabsContent>
        <TabsContent value="table" className="space-y-3">
          <YearlyTable years={result.years} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
