"use client"

import { BalanceChart } from "@/components/results/balance-chart"
import { CliffWarnings } from "@/components/results/cliff-warnings"
import { WithdrawalMixChart } from "@/components/results/withdrawal-mix-chart"
import { YearlyPlan } from "@/components/results/yearly-plan"
import type { SimulationResult } from "@/lib/engine/types"
import { formatCurrency } from "@/lib/format"

type ResultsViewProps = {
  result: SimulationResult
}

export const ResultsView = ({ result }: ResultsViewProps) => {
  const planYears = result.years.length
  const totalTaxesAndPenalties = result.years.reduce(
    (sum, year) => sum + year.totalTaxesAndPenalties,
    0
  )

  return (
    <div className="space-y-10" aria-labelledby="results-heading">
      <section className="space-y-6" aria-labelledby="results-heading">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[#e8f3ef] via-white to-[#e6eef8] p-6 sm:p-8">
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
            Each year&apos;s source mix is chosen to minimize marginal tax cost
            given that year&apos;s brackets, RMDs, and cliff proximity.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Lifetime after-tax spending
            </dt>
            <dd className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#122820]">
              {formatCurrency(result.totalLifetimeTaxSpending)}
            </dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Plan years covered
            </dt>
            <dd className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#122820]">
              {planYears}
            </dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Total taxes &amp; penalties
            </dt>
            <dd className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#122820]">
              {formatCurrency(totalTaxesAndPenalties)}
            </dd>
          </div>
        </dl>
      </section>

      {result.cliffWarnings.length > 0 ? (
        <CliffWarnings warnings={result.cliffWarnings} />
      ) : null}

      <section className="space-y-3" aria-labelledby="balances-heading">
        <div>
          <h3
            id="balances-heading"
            className="font-heading text-lg font-semibold text-[#122820]"
          >
            Balances over time
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ending account balances by age after each year&apos;s withdrawals and growth.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <BalanceChart years={result.years} />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="mix-heading">
        <div>
          <h3
            id="mix-heading"
            className="font-heading text-lg font-semibold text-[#122820]"
          >
            Withdrawal mix
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How much came from traditional, Roth, and brokerage accounts each year.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
          <WithdrawalMixChart years={result.years} />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="yearly-heading">
        <div>
          <h3
            id="yearly-heading"
            className="font-heading text-lg font-semibold text-[#122820]"
          >
            Year-by-year plan
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan the trajectory, then expand any 5-year block for withdrawals,
            taxes, and ending balances.
          </p>
        </div>
        <YearlyPlan years={result.years} />
      </section>
    </div>
  )
}
