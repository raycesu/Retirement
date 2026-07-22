import type { TaxYearData } from "@/lib/engine/types"
import { taxData2026 } from "@/lib/tax-data/2026-federal"

const taxYearRegistry: Record<number, TaxYearData> = {
  2026: taxData2026,
}

export const getTaxYearData = (year: number): TaxYearData => {
  const exact = taxYearRegistry[year]
  if (exact) {
    return exact
  }

  // Fall back to nearest available year (currently only 2026)
  const availableYears = Object.keys(taxYearRegistry)
    .map(Number)
    .sort((a, b) => a - b)

  const fallbackYear =
    availableYears.find((candidate) => candidate >= year) ??
    availableYears[availableYears.length - 1]

  return taxYearRegistry[fallbackYear]
}

export { taxData2026 }
