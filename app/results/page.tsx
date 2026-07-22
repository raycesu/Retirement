"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ResultsView } from "@/components/results/results-view"
import { useSimulatorStore } from "@/lib/store"

export default function ResultsPage() {
  const result = useSimulatorStore((state) => state.result)
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
    <main className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#d7ebe4_0%,transparent_40%),linear-gradient(180deg,#f5f8fb_0%,#eef3f7_100%)]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-8 sm:px-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl font-semibold tracking-tight text-[#16352c]"
              aria-label="Deccum home"
              tabIndex={0}
            >
              Deccum
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-[#122820] sm:text-4xl">
              Simulation results
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Your sustainable spending level and the year-by-year withdrawal
              sequence Deccum chose for this plan.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center rounded-lg border border-border/80 bg-card/80 px-4 py-2 text-sm font-medium text-[#122820] transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Edit plan inputs"
            tabIndex={0}
          >
            Edit plan
          </Link>
        </header>

        {!hasHydrated ? (
          <div
            className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            Loading results…
          </div>
        ) : result ? (
          <ResultsView result={result} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
            <p className="text-muted-foreground">
              No simulation results yet. Run a plan to see sustainable spending
              and the year-by-year withdrawal sequence.
            </p>
            <Link
              href="/plan"
              className="mt-6 inline-flex items-center rounded-lg bg-[#16352c] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#122820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
