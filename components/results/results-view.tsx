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
        <div className="rounded-2xl border border-[#132A40]/15 bg-white p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#3C5A72]">
            Your constant spending line
          </p>
          <h2
            id="results-heading"
            className="mt-2 font-[family-name:var(--font-plex-mono)] text-4xl font-semibold tracking-tight text-[#132A40] sm:text-5xl"
          >
            {formatCurrency(result.sustainableAnnualSpending)}
            <span className="ml-2 font-[family-name:var(--font-figtree)] text-lg font-normal text-[#3C5A72]">
              / year (today&apos;s dollars)
            </span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[#3C5A72]">
            Each year&apos;s source mix is chosen to minimize marginal tax cost
            given that year&apos;s brackets, RMDs, and cliff proximity.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#132A40]/15 bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[#3C5A72]">
              Lifetime after-tax spending
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-plex-mono)] text-2xl font-semibold tracking-tight text-[#132A40]">
              {formatCurrency(result.totalLifetimeTaxSpending)}
            </dd>
          </div>
          <div className="rounded-xl border border-[#132A40]/15 bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[#3C5A72]">
              Plan years covered
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-plex-mono)] text-2xl font-semibold tracking-tight text-[#132A40]">
              {planYears}
            </dd>
          </div>
          <div className="rounded-xl border border-[#132A40]/15 bg-white/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[#3C5A72]">
              Total taxes &amp; penalties
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-plex-mono)] text-2xl font-semibold tracking-tight text-[#132A40]">
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
            className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#132A40]"
          >
            Balances over time
          </h3>
          <p className="mt-1 text-sm text-[#3C5A72]">
            Ending account balances by age after each year&apos;s withdrawals and growth.
          </p>
        </div>
        <div className="rounded-xl border border-[#132A40]/15 bg-white/60 p-4">
          <BalanceChart years={result.years} />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="mix-heading">
        <div>
          <h3
            id="mix-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#132A40]"
          >
            Withdrawal mix
          </h3>
          <p className="mt-1 text-sm text-[#3C5A72]">
            How much came from traditional, Roth, and brokerage accounts each year.
          </p>
        </div>
        <div className="rounded-xl border border-[#132A40]/15 bg-white/60 p-4">
          <WithdrawalMixChart years={result.years} />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="yearly-heading">
        <div>
          <h3
            id="yearly-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#132A40]"
          >
            Year-by-year plan
          </h3>
          <p className="mt-1 text-sm text-[#3C5A72]">
            Scan the trajectory, then expand any 5-year block for withdrawals,
            taxes, and ending balances.
          </p>
        </div>
        <YearlyPlan years={result.years} />
      </section>
    </div>
  )
}
