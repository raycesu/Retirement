import { computeRmd } from "@/lib/engine/rmd"
import { optimizeYearWithdrawals } from "@/lib/engine/withdrawal-optimizer"
import type {
  Accounts,
  CliffWarning,
  PlanInputs,
  SimulationResult,
  YearResult,
} from "@/lib/engine/types"
import { getTaxYearData } from "@/lib/tax-data"

const cloneAccounts = (accounts: Accounts): Accounts => ({
  traditional401k: accounts.traditional401k,
  roth: {
    contributions: accounts.roth.contributions,
    earnings: accounts.roth.earnings,
  },
  brokerage: {
    basis: accounts.brokerage.basis,
    balance: accounts.brokerage.balance,
  },
})

const totalBalance = (accounts: Accounts): number => {
  return (
    accounts.traditional401k +
    accounts.roth.contributions +
    accounts.roth.earnings +
    accounts.brokerage.balance
  )
}

const growAccounts = (
  accounts: Accounts,
  returns: PlanInputs["assumptions"]["returns"]
): Accounts => {
  const grown = cloneAccounts(accounts)
  grown.traditional401k *= 1 + returns.traditional401k

  const rothTotal = grown.roth.contributions + grown.roth.earnings
  const grownRoth = rothTotal * (1 + returns.roth)
  // Attribute growth to earnings
  grown.roth.earnings = Math.max(0, grownRoth - grown.roth.contributions)

  const brokerageBefore = grown.brokerage.balance
  grown.brokerage.balance *= 1 + returns.brokerage
  // Basis unchanged by market growth
  if (grown.brokerage.balance < grown.brokerage.basis) {
    grown.brokerage.basis = grown.brokerage.balance
  }
  void brokerageBefore
  return grown
}

const taxableSocialSecurity = (
  socialSecurity: number,
  otherOrdinary: number,
  filingStatus: PlanInputs["person"]["filingStatus"]
): number => {
  // Simplified SS taxation: provisional income thresholds
  if (socialSecurity <= 0) {
    return 0
  }
  const provisional = otherOrdinary + 0.5 * socialSecurity
  const base = filingStatus === "mfj" ? 32_000 : 25_000
  const top = filingStatus === "mfj" ? 44_000 : 34_000

  if (provisional <= base) {
    return 0
  }
  if (provisional <= top) {
    return Math.min(0.5 * socialSecurity, 0.5 * (provisional - base))
  }
  return Math.min(
    0.85 * socialSecurity,
    0.85 * (provisional - top) + Math.min(0.5 * socialSecurity, 0.5 * (top - base))
  )
}

export type SimulateOptions = {
  targetAfterTaxSpending: number
  inflateSpending: boolean
}

/**
 * Run a full year-by-year plan for a given constant (real) spending target.
 * When inflateSpending is true, nominal spending grows with inflation each year.
 */
export const simulatePlan = (
  inputs: PlanInputs,
  options: SimulateOptions
): { years: YearResult[]; cliffWarnings: CliffWarning[]; endedSolvent: boolean } => {
  const taxData = getTaxYearData(inputs.assumptions.taxYear)
  let accounts = cloneAccounts(inputs.accounts)
  const years: YearResult[] = []
  const cliffWarnings: CliffWarning[] = []
  const magiHistory: number[] = []

  const startAge = Math.floor(inputs.person.currentAge)
  const endAge = Math.floor(inputs.person.planEndAge)
  let failed = false

  for (let age = startAge; age <= endAge; age += 1) {
    const yearIndex = age - startAge
    const calendarYear = inputs.assumptions.taxYear + yearIndex
    const inflationFactor = options.inflateSpending
      ? Math.pow(1 + inputs.assumptions.inflationRate, yearIndex)
      : 1
    const targetSpending = options.targetAfterTaxSpending * inflationFactor

    const pension = inputs.fixedIncome.pensionAnnual * inflationFactor
    const ssGross =
      age >= inputs.fixedIncome.socialSecurityStartAge
        ? inputs.fixedIncome.socialSecurityAnnual * inflationFactor
        : 0

    const dividends =
      accounts.brokerage.balance * inputs.assumptions.dividendYieldOnBrokerage

    const ssTaxable = taxableSocialSecurity(
      ssGross,
      pension + dividends,
      inputs.person.filingStatus
    )
    const fixedOrdinaryIncome = pension + ssTaxable

    const rmdRequired = computeRmd(
      accounts.traditional401k,
      age,
      inputs.person.birthYear,
      taxData
    )

    const magiTwoYearsPrior =
      magiHistory.length >= 2
        ? magiHistory[magiHistory.length - 2]
        : magiHistory[0] ?? 0

    const optimized = optimizeYearWithdrawals(accounts, {
      age,
      filingStatus: inputs.person.filingStatus,
      person: inputs.person,
      taxData,
      fixedOrdinaryIncome,
      dividends,
      rmdRequired,
      magiTwoYearsPrior,
      targetAfterTaxSpending: targetSpending,
    })

    // optimized.afterTaxCash counted taxable SS; add nontaxable SS to spending power
    const fixedIncomeGross = pension + ssGross
    const ssNontaxable = ssGross - ssTaxable
    const adjustedSpending = optimized.afterTaxCash + ssNontaxable

    if (
      adjustedSpending + 50 < targetSpending &&
      totalBalance(optimized.accountsAfter) < 1
    ) {
      failed = true
    }

    magiHistory.push(optimized.magi)

    if (optimized.acaCliffBreached) {
      cliffWarnings.push({
        age,
        calendarYear,
        kind: "aca",
        message: `Age ${age}: MAGI crossed the ACA subsidy cliff — estimated marketplace premium assistance dropped.`,
      })
    }

    if (age >= 65 && optimized.irmaaBracket > 0) {
      cliffWarnings.push({
        age,
        calendarYear,
        kind: "irmaa",
        message: `Age ${age}: IRMAA surcharge applies (tier ${optimized.irmaaBracket}) based on MAGI from two years prior.`,
      })
    }

    const yearResult: YearResult = {
      age,
      calendarYear,
      withdrawals: optimized.withdrawals,
      rmdRequired,
      earlyWithdrawalPenalty: optimized.earlyWithdrawalPenalty,
      ordinaryTaxableIncome: Math.max(
        0,
        optimized.ordinaryIncome -
          taxData.standardDeduction[inputs.person.filingStatus]
      ),
      capitalGainsTaxableIncome: optimized.capitalGains,
      federalTax: optimized.federalTax,
      stateTax: optimized.stateTax,
      magi: optimized.magi,
      irmaaSurcharge: optimized.irmaaSurcharge,
      acaSubsidy: optimized.acaSubsidy,
      acaCliffBreached: optimized.acaCliffBreached,
      irmaaBracket: optimized.irmaaBracket,
      fixedIncomeGross,
      dividends,
      afterTaxSpending: adjustedSpending,
      endingBalances: optimized.accountsAfter,
      totalTaxesAndPenalties: optimized.totalTaxesAndPenalties,
    }

    years.push(yearResult)

    // Grow remaining balances for next year
    accounts = growAccounts(optimized.accountsAfter, inputs.assumptions.returns)

    if (failed && totalBalance(accounts) < 1) {
      // Continue recording remaining years as zero-balance for clarity
      // but stop growing empty accounts
      break
    }
  }

  const last = years[years.length - 1]
  const endedSolvent =
    !failed &&
    years.length > 0 &&
    last.afterTaxSpending + 100 >=
      options.targetAfterTaxSpending *
        (options.inflateSpending
          ? Math.pow(
              1 + inputs.assumptions.inflationRate,
              years.length - 1
            )
          : 1)

  return { years, cliffWarnings, endedSolvent }
}

export const summarizeSimulation = (
  inputs: PlanInputs,
  sustainableAnnualSpending: number,
  years: YearResult[],
  cliffWarnings: CliffWarning[]
): SimulationResult => {
  return {
    sustainableAnnualSpending,
    years,
    totalLifetimeTaxSpending: years.reduce(
      (sum, year) => sum + year.afterTaxSpending,
      0
    ),
    cliffWarnings,
  }
}

export { totalBalance, cloneAccounts }
