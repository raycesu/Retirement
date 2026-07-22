"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExportPdfButton } from "@/components/results/export-pdf-button"
import { ResultsView } from "@/components/results/results-view"
import { useSimulatorStore } from "@/lib/store"

export default function ResultsPage() {
  const result = useSimulatorStore((state) => state.result)
  const formValues = useSimulatorStore((state) => state.formValues)
  const [hasHydrated, setHasHydrated] = useState(() =>
    useSimulatorStore.persist.hasHydrated()
  )

  useEffect(() => {
    setHasHydrated(useSimulatorStore.persist.hasHydrated())
    return useSimulatorStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
  }, [])

  return (
    <main className="relative min-h-screen bg-[#EEF2F5]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(19,42,64,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(19,42,64,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-8 sm:px-10">
        <header className="motion-safe:animate-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/"
              className="rounded-sm font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-[#132A40] outline-none focus-visible:ring-3 focus-visible:ring-[#132A40]/40"
              aria-label="Waterline home"
              tabIndex={0}
            >
              Waterline
            </Link>
            <h1 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-[#132A40] sm:text-4xl">
              Simulation results
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#3C5A72] sm:text-base">
              Your sustainable spending level and the year-by-year withdrawal
              sequence Waterline chose for this plan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasHydrated && result ? (
              <ExportPdfButton result={result} formValues={formValues} />
            ) : null}
            <Link
              href="/plan"
              className="inline-flex h-9 items-center rounded-lg border border-[#132A40]/20 bg-white/80 px-4 text-sm font-medium text-[#132A40] transition-colors hover:bg-[#132A40]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132A40]/40"
              aria-label="Edit plan inputs"
              tabIndex={0}
            >
              Edit plan
            </Link>
          </div>
        </header>

        {!hasHydrated ? (
          <div
            className="rounded-2xl border border-[#132A40]/15 bg-white/70 p-8 text-center text-[#3C5A72]"
            role="status"
            aria-live="polite"
          >
            Loading results…
          </div>
        ) : result ? (
          <ResultsView result={result} />
        ) : (
          <div className="rounded-2xl border border-dashed border-[#132A40]/20 bg-[#132A40]/5 p-10 text-center">
            <p className="text-[#3C5A72]">
              No simulation results yet. Run a plan to see sustainable spending
              and the year-by-year withdrawal sequence.
            </p>
            <Link
              href="/plan"
              className="mt-6 inline-flex items-center rounded-lg bg-[#132A40] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1c3c58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132A40]/40"
              aria-label="Go to withdrawal planner"
              tabIndex={0}
            >
              Open planner
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
