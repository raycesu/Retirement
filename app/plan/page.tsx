import Link from "next/link"
import { InfoTooltip } from "@/components/info-tooltip"
import { PlanForm } from "@/components/plan-form/plan-form"

export default function PlanPage() {
  return (
    <main className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#d7ebe4_0%,transparent_40%),linear-gradient(180deg,#f5f8fb_0%,#eef3f7_100%)]"
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-8 sm:px-10">
        <header className="mb-8">
          <Link
            href="/"
            className="font-heading text-2xl font-semibold tracking-tight text-[#16352c]"
            aria-label="Deccum home"
            tabIndex={0}
          >
            Deccum
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#122820] sm:text-4xl">
              Withdrawal planner
            </h1>
            <InfoTooltip label="About the withdrawal planner">
              <p>
                Enter balances and assumptions. Deccum finds the highest
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
