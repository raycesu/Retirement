import Link from "next/link"
import { InfoTooltip } from "@/components/info-tooltip"
import { PlanForm } from "@/components/plan-form/plan-form"

export default function PlanPage() {
  return (
    <main className="relative min-h-screen bg-[#EEF2F5]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(19,42,64,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(19,42,64,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-8 sm:px-10">
        <header className="motion-safe:animate-fade-up mb-8">
          <Link
            href="/"
            className="rounded-sm font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-[#132A40] outline-none focus-visible:ring-3 focus-visible:ring-[#132A40]/40"
            aria-label="Waterline home"
            tabIndex={0}
          >
            Waterline
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-[#132A40] sm:text-4xl">
              Withdrawal planner
            </h1>
            <InfoTooltip label="About the withdrawal planner">
              <p>
                Enter balances and assumptions. Waterline finds the highest
                constant real spending your accounts can sustain, then chooses a
                tax-aware withdrawal order each year.
              </p>
              <p className="text-xs leading-relaxed">
                Educational planning tool only — not tax, legal, or financial
                advice. Tax constants are approximate and must be reviewed
                annually.
              </p>
            </InfoTooltip>
          </div>
        </header>

        <PlanForm />
      </div>
    </main>
  )
}
