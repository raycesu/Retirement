import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,#9fd0c4_0%,transparent_45%),radial-gradient(ellipse_at_80%_0%,#b7c7e8_0%,transparent_40%),linear-gradient(160deg,#eef6f3_0%,#f4f7fb_45%,#e8eef5_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(28,43,36,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,43,36,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <p className="font-heading text-2xl font-semibold tracking-tight text-[#16352c] sm:text-3xl">
            Deccum
          </p>
          <Link
            href="/plan"
            className="text-sm font-medium text-[#16352c] underline-offset-4 hover:underline"
            tabIndex={0}
            aria-label="Open the retirement plan simulator"
          >
            Open planner
          </Link>
        </header>

        <section className="relative flex flex-1 flex-col justify-center gap-8 py-16 sm:py-20">
          <div className="animate-fade-up max-w-3xl">
            <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-[#122820] sm:text-6xl md:text-7xl">
              Deccum
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#314841] sm:text-xl">
              Retirement spending tool for people with scattered savings —
              sequenced across every account, re-optimized each year.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#16352c] px-6 text-base hover:bg-[#1f4b3a]"
              >
                <Link href="/plan" aria-label="Start building your withdrawal plan">
                  Build your withdrawal plan
                </Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-10%] top-[8%] hidden h-[420px] w-[420px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#7eb7a8_0deg,#c5d4f0_120deg,#dfe9e4_240deg,#7eb7a8_360deg)] opacity-70 blur-3xl motion-safe:animate-drift lg:block"
          />
        </section>

        <section className="grid gap-8 border-t border-[#16352c]/15 pt-10 md:grid-cols-[1.2fr_1fr]">
          <p className="animate-fade-up-delayed max-w-2xl text-base leading-relaxed text-[#314841]">
            A 52-year-old leaves a corporate job with savings spread across a
            401(k), a Roth, a brokerage account, and an old pension. Pulling from
            the wrong one first triggers early withdrawal penalties, spikes
            taxable income, and pushes annual earnings past the threshold for
            affordable healthcare coverage. Financial advisors charge thousands
            for a custom drawdown plan. Everyone else guesses.
          </p>
          <p className="animate-fade-up-late text-base leading-relaxed text-[#314841]">
            Deccum maps a year-by-year withdrawal sequence across every account,
            accounting for RMDs, the 59½ penalty, ACA subsidy cliffs, IRMAA
            brackets, and stacked capital-gains rates — then re-optimizes as
            balances and tax brackets shift.
          </p>
        </section>
      </div>
    </main>
  )
}
