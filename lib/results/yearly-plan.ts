import type { YearResult } from "@/lib/engine/types"

const DEPLETED_THRESHOLD = 1

export type YearlyPlanFlagKind = "rothDepleted" | "rmdsBegin" | "moneyDepleted"

export type YearlyPlanFlag = {
  kind: YearlyPlanFlagKind
  age: number
  label: string
}

export type YearlyPlanBlock = {
  id: string
  startAge: number
  endAge: number
  years: YearResult[]
  endingTotal: number
  flag: YearlyPlanFlag | null
}

export type YearlyPlanSummary = {
  planYears: number
  peakBalance: number
  firstAge: number
  lastAge: number
  depletionAge: number | null
  isDepleted: boolean
}

export const getRothEndingTotal = (year: YearResult): number => {
  return year.endingBalances.roth.contributions + year.endingBalances.roth.earnings
}

export const getEndingTotal = (year: YearResult): number => {
  return (
    year.endingBalances.traditional401k +
    getRothEndingTotal(year) +
    year.endingBalances.brokerage.balance
  )
}

export const getWithdrawalSourceLabel = (year: YearResult): string => {
  const sources: string[] = []

  if (year.withdrawals.traditional401k > 0) {
    sources.push("Traditional")
  }

  if (
    year.withdrawals.rothContributions + year.withdrawals.rothEarnings > 0
  ) {
    sources.push("Roth")
  }

  if (year.withdrawals.brokerageBasis + year.withdrawals.brokerageGains > 0) {
    sources.push("Brokerage")
  }

  if (sources.length === 0) {
    return "—"
  }

  return sources.join("+")
}

export const groupYearsIntoBlocks = (
  years: YearResult[],
  blockSize = 5
): YearlyPlanBlock[] => {
  if (years.length === 0 || blockSize < 1) {
    return []
  }

  const blocks: YearlyPlanBlock[] = []

  for (let index = 0; index < years.length; index += blockSize) {
    const blockYears = years.slice(index, index + blockSize)
    const firstYear = blockYears[0]
    const lastYear = blockYears[blockYears.length - 1]

    if (!firstYear || !lastYear) {
      continue
    }

    blocks.push({
      id: `${firstYear.age}-${lastYear.age}`,
      startAge: firstYear.age,
      endAge: lastYear.age,
      years: blockYears,
      endingTotal: getEndingTotal(lastYear),
      flag: null,
    })
  }

  return blocks
}

const detectMilestoneFlags = (years: YearResult[]): YearlyPlanFlag[] => {
  const flags: YearlyPlanFlag[] = []
  let previousRothTotal: number | null = null
  let previousEndingTotal: number | null = null
  let hasSeenPositiveRmd = false
  let hasSeenRothDepleted = false
  let hasSeenMoneyDepleted = false

  for (const year of years) {
    const rothTotal = getRothEndingTotal(year)
    const endingTotal = getEndingTotal(year)

    if (
      !hasSeenRothDepleted &&
      previousRothTotal !== null &&
      previousRothTotal >= DEPLETED_THRESHOLD &&
      rothTotal < DEPLETED_THRESHOLD
    ) {
      flags.push({
        kind: "rothDepleted",
        age: year.age,
        label: "Roth balance runs low here",
      })
      hasSeenRothDepleted = true
    }

    if (!hasSeenPositiveRmd && year.rmdRequired > 0) {
      flags.push({
        kind: "rmdsBegin",
        age: year.age,
        label: "RMDs begin",
      })
      hasSeenPositiveRmd = true
    }

    if (
      !hasSeenMoneyDepleted &&
      previousEndingTotal !== null &&
      previousEndingTotal >= DEPLETED_THRESHOLD &&
      endingTotal < DEPLETED_THRESHOLD
    ) {
      flags.push({
        kind: "moneyDepleted",
        age: year.age,
        label: `Plan depletes at age ${year.age}`,
      })
      hasSeenMoneyDepleted = true
    }

    previousRothTotal = rothTotal
    previousEndingTotal = endingTotal
  }

  return flags
}

export const attachBlockFlags = (
  blocks: YearlyPlanBlock[],
  years: YearResult[]
): YearlyPlanBlock[] => {
  const flags = detectMilestoneFlags(years)

  return blocks.map((block) => {
    const matchingFlag = flags.find(
      (flag) => flag.age >= block.startAge && flag.age <= block.endAge
    )

    return {
      ...block,
      flag: matchingFlag ?? null,
    }
  })
}

export const buildYearlyPlanBlocks = (
  years: YearResult[],
  blockSize = 5
): YearlyPlanBlock[] => {
  return attachBlockFlags(groupYearsIntoBlocks(years, blockSize), years)
}

export const getYearlyPlanSummary = (years: YearResult[]): YearlyPlanSummary | null => {
  if (years.length === 0) {
    return null
  }

  const firstYear = years[0]
  const lastYear = years[years.length - 1]

  if (!firstYear || !lastYear) {
    return null
  }

  let peakBalance = 0
  let depletionAge: number | null = null
  let previousEndingTotal: number | null = null

  for (const year of years) {
    const endingTotal = getEndingTotal(year)
    peakBalance = Math.max(peakBalance, endingTotal)

    if (
      depletionAge === null &&
      previousEndingTotal !== null &&
      previousEndingTotal >= DEPLETED_THRESHOLD &&
      endingTotal < DEPLETED_THRESHOLD
    ) {
      depletionAge = year.age
    }

    previousEndingTotal = endingTotal
  }

  const lastEndingTotal = getEndingTotal(lastYear)
  const isDepleted =
    depletionAge !== null || lastEndingTotal < DEPLETED_THRESHOLD

  return {
    planYears: years.length,
    peakBalance,
    firstAge: firstYear.age,
    lastAge: lastYear.age,
    depletionAge: isDepleted ? (depletionAge ?? lastYear.age) : null,
    isDepleted,
  }
}
