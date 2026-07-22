/**
 * DIRECTION — see DESIGN.md
 * THESIS: Waterline is a level gauge, not a dashboard — it visualizes one
 * constant spending line held steady across uneven, shifting account terrain.
 * OWN-WORLD: ink navy linework on a pale blueprint ground, one brass accent
 * reserved for regulatory threshold markers. Space Grotesk display, Figtree
 * body, IBM Plex Mono for every figure.
 * FIRST VIEWPORT: a multi-chamber gauge diagram — four account "tanks" filled
 * to different levels, one waterline drawn level across all of them.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

const INK = "#132A40"
const INK_SOFT = "#3C5A72"
const BRASS = "#B3813C"

function GaugeIllustration() {
  const chambers = [
    { x: 30, label: "401(k)", fillTop: 92 },
    { x: 137, label: "Roth", fillTop: 152 },
    { x: 244, label: "Brokerage", fillTop: 204 },
    { x: 351, label: "Pension", fillTop: 122 },
  ]
  const chamberWidth = 95
  const baseline = 280
  const wallTop = 40
  const waterline = 170
  const irmaaLine = 128
  const rmdLine = 216

  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="Diagram of four account chambers — 401(k), Roth, brokerage, and pension — filled to different levels, with one constant waterline held across all of them, and IRMAA and RMD threshold lines marked above and below it."
      className="w-full max-w-xl"
    >
      {/* threshold lines */}
      <line
        x1="14"
        y1={irmaaLine}
        x2="466"
        y2={irmaaLine}
        stroke={BRASS}
        strokeWidth="1"
        strokeDasharray="2 4"
        opacity="0.6"
      />
      <text
        x="466"
        y={irmaaLine - 6}
        textAnchor="end"
        fontFamily="var(--font-plex-mono)"
        fontSize="10"
        letterSpacing="0.02em"
        fill={BRASS}
      >
        IRMAA threshold
      </text>

      <line
        x1="14"
        y1={rmdLine}
        x2="466"
        y2={rmdLine}
        stroke={BRASS}
        strokeWidth="1"
        strokeDasharray="2 4"
        opacity="0.6"
      />
      <text
        x="466"
        y={rmdLine + 14}
        textAnchor="end"
        fontFamily="var(--font-plex-mono)"
        fontSize="10"
        letterSpacing="0.02em"
        fill={BRASS}
      >
        RMD trigger
      </text>

      {/* chambers */}
      {chambers.map((chamber) => (
        <g key={chamber.label}>
          <rect
            x={chamber.x}
            y={wallTop}
            width={chamberWidth}
            height={baseline - wallTop}
            fill="none"
            stroke={INK}
            strokeWidth="1.5"
          />
          <rect
            x={chamber.x}
            y={chamber.fillTop}
            width={chamberWidth}
            height={baseline - chamber.fillTop}
            fill={INK}
            opacity="0.1"
          />
          <circle
            cx={chamber.x + chamberWidth / 2}
            cy={waterline}
            r="3"
            fill={BRASS}
          />
          <text
            x={chamber.x + chamberWidth / 2}
            y={baseline + 20}
            textAnchor="middle"
            fontFamily="var(--font-plex-mono)"
            fontSize="11"
            letterSpacing="0.02em"
            fill={INK_SOFT}
          >
            {chamber.label}
          </text>
        </g>
      ))}

      {/* the constant waterline */}
      <line
        x1="8"
        y1={waterline}
        x2="472"
        y2={waterline}
        stroke={INK}
        strokeWidth="2.5"
        strokeDasharray="9 5"
      />
      <text
        x="8"
        y={waterline - 10}
        fontFamily="var(--font-plex-mono)"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.02em"
        fill={INK}
      >
        constant spending line
      </text>
    </svg>
  )
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF2F5]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(19,42,64,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(19,42,64,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between border-b border-[#132A40]/10 pb-6">
          <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-[#132A40] sm:text-3xl">
            Waterline
          </p>
          <Link
            href="/plan"
            className="rounded-sm text-sm font-medium text-[#132A40] underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-[#132A40]/40"
            tabIndex={0}
            aria-label="Open the retirement plan simulator"
          >
            Open planner
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="motion-safe:animate-fade-up max-w-xl">
            <p className="font-[family-name:var(--font-plex-mono)] text-xs font-medium uppercase tracking-[0.2em] text-[#B3813C]">
              Retirement withdrawal engine
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-4xl font-semibold leading-[1.1] tracking-tight text-[#132A40] sm:text-5xl md:text-6xl">
              Hold one spending line steady, no matter what&apos;s underneath.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#3C5A72] sm:text-xl">
              Waterline re-optimizes withdrawals across every account each
              year — 401(k), Roth, brokerage, pension — so your income
              doesn&apos;t dip when a tax bracket, RMD, or IRMAA cliff moves
              underneath you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#132A40] px-6 text-base hover:bg-[#1c3c58]"
              >
                <Link href="/plan" aria-label="Start building your withdrawal plan">
                  Build your withdrawal plan
                </Link>
              </Button>
            </div>
          </div>

          <div className="motion-safe:animate-fade-up-delayed flex justify-center lg:justify-end">
            <GaugeIllustration />
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#132A40]/10 pt-10 md:grid-cols-[1.2fr_1fr]">
          <p className="motion-safe:animate-fade-up-delayed max-w-2xl text-base leading-relaxed text-[#3C5A72]">
            A 52-year-old leaves a corporate job with savings spread across a
            401(k), a Roth, a brokerage account, and an old pension. Pulling
            from the wrong one first triggers early withdrawal penalties,
            spikes taxable income, and pushes annual earnings past the
            threshold for affordable healthcare coverage. Financial advisors
            charge thousands for a custom drawdown plan. Everyone else
            guesses.
          </p>
          <p className="motion-safe:animate-fade-up-late text-base leading-relaxed text-[#3C5A72]">
            Waterline maps a year-by-year withdrawal sequence across every
            account, accounting for RMDs, the{" "}
            <span className="font-[family-name:var(--font-plex-mono)]">
              59½
            </span>{" "}
            penalty, ACA subsidy cliffs, IRMAA brackets, and stacked
            capital-gains rates — then re-optimizes as balances and tax
            brackets shift.
          </p>
        </section>
      </div>
    </main>
  )
}
