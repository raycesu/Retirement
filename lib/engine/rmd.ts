import type { TaxYearData } from "@/lib/engine/types"

/**
 * SECURE 2.0 RMD start ages:
 * - Born 1951–1959: RMD begins at 73
 * - Born 1960 or later: RMD begins at 75
 * - Born 1950 or earlier: already covered by prior rules (72) — treat as 72 for completeness
 */
export const getRmdStartAge = (birthYear: number): number => {
  if (birthYear <= 1950) {
    return 72
  }
  if (birthYear <= 1959) {
    return 73
  }
  return 75
}

export const isRmdApplicable = (age: number, birthYear: number): boolean => {
  return age >= getRmdStartAge(birthYear)
}

export const getRmdDivisor = (age: number, taxData: TaxYearData): number => {
  const clampedAge = Math.min(120, Math.max(72, Math.floor(age)))
  return taxData.rmdDivisors[clampedAge] ?? taxData.rmdDivisors[120]
}

/**
 * RMD for a calendar year is based on prior Dec 31 traditional account balance.
 * We approximate using the start-of-year (pre-withdrawal) balance.
 */
export const computeRmd = (
  traditionalBalance: number,
  age: number,
  birthYear: number,
  taxData: TaxYearData
): number => {
  if (traditionalBalance <= 0) {
    return 0
  }

  if (!isRmdApplicable(age, birthYear)) {
    return 0
  }

  const divisor = getRmdDivisor(age, taxData)
  if (divisor <= 0) {
    return 0
  }

  return traditionalBalance / divisor
}
