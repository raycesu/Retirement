import {
  computeAcaSubsidy,
  computeEarlyWithdrawalPenalty,
  computeFederalTax,
  computeIrmaaAnnualSurcharge,
  computeMagi,
  computeStateTax,
  marginalCapitalGainsRate,
  marginalOrdinaryRate,
} from "@/lib/engine/taxes"
import type {
  Accounts,
  FilingStatus,
  PersonProfile,
  TaxYearData,
  Withdrawals,
} from "@/lib/engine/types"

export type YearIncomeContext = {
  age: number
  filingStatus: FilingStatus
  person: PersonProfile
  taxData: TaxYearData
  fixedOrdinaryIncome: number
  dividends: number
  rmdRequired: number
  magiTwoYearsPrior: number
  targetAfterTaxSpending: number
}

export type OptimizedYear = {
  withdrawals: Withdrawals
  accountsAfter: Accounts
  ordinaryIncome: number
  capitalGains: number
  federalTax: number
  stateTax: number
  earlyWithdrawalPenalty: number
  magi: number
  irmaaSurcharge: number
  irmaaBracket: number
  acaSubsidy: number
  acaCliffBreached: boolean
  afterTaxCash: number
  totalTaxesAndPenalties: number
}

type SourceKey =
  | "rothContributions"
  | "brokerageBasis"
  | "brokerageGains"
  | "traditional401k"
  | "rothEarnings"

const MIN_INCREMENT = 250

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

const emptyWithdrawals = (): Withdrawals => ({
  traditional401k: 0,
  rothContributions: 0,
  rothEarnings: 0,
  brokerageBasis: 0,
  brokerageGains: 0,
})

const syncWorkingFromWithdrawals = (
  starting: Accounts,
  withdrawals: Withdrawals
): Accounts => {
  const working = cloneAccounts(starting)
  working.traditional401k = Math.max(
    0,
    starting.traditional401k - withdrawals.traditional401k
  )
  working.roth.contributions = Math.max(
    0,
    starting.roth.contributions - withdrawals.rothContributions
  )
  working.roth.earnings = Math.max(
    0,
    starting.roth.earnings - withdrawals.rothEarnings
  )
  working.brokerage.balance = Math.max(
    0,
    starting.brokerage.balance -
      withdrawals.brokerageBasis -
      withdrawals.brokerageGains
  )
  working.brokerage.basis = Math.max(
    0,
    starting.brokerage.basis - withdrawals.brokerageBasis
  )
  if (working.brokerage.basis > working.brokerage.balance) {
    working.brokerage.basis = working.brokerage.balance
  }
  return working
}

const availableOf = (accounts: Accounts, source: SourceKey): number => {
  switch (source) {
    case "traditional401k":
      return Math.max(0, accounts.traditional401k)
    case "rothContributions":
      return Math.max(0, accounts.roth.contributions)
    case "rothEarnings":
      return Math.max(0, accounts.roth.earnings)
    case "brokerageBasis":
      return Math.max(
        0,
        Math.min(
          accounts.brokerage.basis,
          accounts.brokerage.balance
        )
      )
    case "brokerageGains":
      return Math.max(0, accounts.brokerage.balance - accounts.brokerage.basis)
    default:
      return 0
  }
}

const addWithdrawal = (
  withdrawals: Withdrawals,
  source: SourceKey,
  amount: number
): void => {
  if (amount <= 0) {
    return
  }

  switch (source) {
    case "traditional401k":
      withdrawals.traditional401k += amount
      break
    case "rothContributions":
      withdrawals.rothContributions += amount
      break
    case "rothEarnings":
      withdrawals.rothEarnings += amount
      break
    case "brokerageBasis":
      withdrawals.brokerageBasis += amount
      break
    case "brokerageGains":
      withdrawals.brokerageGains += amount
      break
    default:
      break
  }
}

export const evaluateCashPosition = (
  startingAccounts: Accounts,
  withdrawals: Withdrawals,
  ctx: YearIncomeContext
): OptimizedYear => {
  const traditional = withdrawals.traditional401k
  const rothEarnings = withdrawals.rothEarnings
  const brokerageGains = withdrawals.brokerageGains
  const brokerageBasis = withdrawals.brokerageBasis
  const rothContributions = withdrawals.rothContributions

  const rothEarningsTaxable =
    ctx.age < 59.5 || !ctx.person.rothFiveYearMet ? rothEarnings : 0

  const ordinaryIncome =
    ctx.fixedOrdinaryIncome +
    ctx.dividends +
    traditional +
    rothEarningsTaxable

  const capitalGains = brokerageGains

  const federal = computeFederalTax({
    ordinaryIncome,
    capitalGains,
    filingStatus: ctx.filingStatus,
    taxData: ctx.taxData,
  })

  const stateTax = computeStateTax(
    ordinaryIncome,
    capitalGains,
    ctx.person.stateTaxRate
  )

  const earlyWithdrawalPenalty = computeEarlyWithdrawalPenalty({
    traditionalWithdrawal: traditional,
    rothEarningsWithdrawal: rothEarnings,
    age: ctx.age,
    ruleOf55Applies: ctx.person.ruleOf55Applies,
    rothFiveYearMet: ctx.person.rothFiveYearMet,
    penaltyRate: ctx.taxData.earlyWithdrawalPenaltyRate,
  })

  const magi = computeMagi(ordinaryIncome, capitalGains)
  const irmaa = computeIrmaaAnnualSurcharge(
    ctx.magiTwoYearsPrior,
    ctx.filingStatus,
    ctx.taxData,
    ctx.age
  )

  const aca = computeAcaSubsidy({
    magi,
    householdSize: ctx.person.householdSizeForACA,
    benchmarkPremium: ctx.person.estimatedBenchmarkPremiumAnnual,
    taxData: ctx.taxData,
    useHardAcaCliff: ctx.person.useHardAcaCliff,
    age: ctx.age,
    onACAUntilMedicare: ctx.person.onACAUntilMedicare,
  })

  const grossWithdrawals =
    traditional +
    rothContributions +
    rothEarnings +
    brokerageBasis +
    brokerageGains

  const totalTaxesAndPenalties =
    federal.federalTax + stateTax + earlyWithdrawalPenalty + irmaa.surcharge

  // Cash available for spending from withdrawals + taxable fixed income proxy
  // Caller adjusts for nontaxable Social Security.
  const afterTaxCash =
    grossWithdrawals +
    ctx.fixedOrdinaryIncome +
    ctx.dividends +
    aca.subsidy -
    totalTaxesAndPenalties

  return {
    withdrawals: { ...withdrawals },
    accountsAfter: syncWorkingFromWithdrawals(startingAccounts, withdrawals),
    ordinaryIncome,
    capitalGains,
    federalTax: federal.federalTax,
    stateTax,
    earlyWithdrawalPenalty,
    magi,
    irmaaSurcharge: irmaa.surcharge,
    irmaaBracket: irmaa.bracketIndex,
    acaSubsidy: aca.subsidy,
    acaCliffBreached: aca.cliffBreached,
    afterTaxCash,
    totalTaxesAndPenalties,
  }
}

const estimateMarginalCost = (
  source: SourceKey,
  amount: number,
  current: OptimizedYear,
  ctx: YearIncomeContext
): number => {
  if (amount <= 0) {
    return Number.POSITIVE_INFINITY
  }

  const filing = ctx.filingStatus
  const ordinaryTaxable = Math.max(
    0,
    current.ordinaryIncome - ctx.taxData.standardDeduction[filing]
  )

  switch (source) {
    case "rothContributions":
    case "brokerageBasis":
      return 0
    case "brokerageGains": {
      const cgRate = marginalCapitalGainsRate(
        ordinaryTaxable,
        current.capitalGains,
        ctx.taxData.capitalGainsBrackets[filing]
      )
      let cost = cgRate + ctx.person.stateTaxRate

      if (
        ctx.person.onACAUntilMedicare &&
        ctx.age < 65 &&
        ctx.person.useHardAcaCliff &&
        ctx.person.estimatedBenchmarkPremiumAnnual > 0
      ) {
        const withIncrement = computeAcaSubsidy({
          magi: current.magi + amount,
          householdSize: ctx.person.householdSizeForACA,
          benchmarkPremium: ctx.person.estimatedBenchmarkPremiumAnnual,
          taxData: ctx.taxData,
          useHardAcaCliff: true,
          age: ctx.age,
          onACAUntilMedicare: true,
        })
        if (!current.acaCliffBreached && withIncrement.cliffBreached) {
          cost +=
            ctx.person.estimatedBenchmarkPremiumAnnual / Math.max(amount, 1)
        }
      }
      return cost
    }
    case "traditional401k": {
      const ordinaryRate = marginalOrdinaryRate(
        ordinaryTaxable,
        ctx.taxData.ordinaryBrackets[filing]
      )
      let cost = ordinaryRate + ctx.person.stateTaxRate
      if (ctx.age < 59.5 && !ctx.person.ruleOf55Applies) {
        cost += ctx.taxData.earlyWithdrawalPenaltyRate
      }

      if (
        ctx.person.onACAUntilMedicare &&
        ctx.age < 65 &&
        ctx.person.useHardAcaCliff &&
        ctx.person.estimatedBenchmarkPremiumAnnual > 0
      ) {
        const withIncrement = computeAcaSubsidy({
          magi: current.magi + amount,
          householdSize: ctx.person.householdSizeForACA,
          benchmarkPremium: ctx.person.estimatedBenchmarkPremiumAnnual,
          taxData: ctx.taxData,
          useHardAcaCliff: true,
          age: ctx.age,
          onACAUntilMedicare: true,
        })
        if (!current.acaCliffBreached && withIncrement.cliffBreached) {
          cost +=
            ctx.person.estimatedBenchmarkPremiumAnnual / Math.max(amount, 1)
        }
      }

      if (ctx.age + 2 >= 65) {
        const tiers = ctx.taxData.irmaaTiers[filing]
        for (let i = 0; i < tiers.length; i += 1) {
          const tier = tiers[i]
          if (current.magi <= tier.magiUpTo && current.magi + amount > tier.magiUpTo) {
            const nextTier = tiers[Math.min(i + 1, tiers.length - 1)]
            const jump =
              (nextTier.partBMonthly + nextTier.partDMonthly -
                (tier.partBMonthly + tier.partDMonthly)) *
              12
            cost += (Math.max(0, jump) / Math.max(amount, 1)) * 0.5
            break
          }
        }
      }

      return cost
    }
    case "rothEarnings": {
      const isTaxable = ctx.age < 59.5 || !ctx.person.rothFiveYearMet
      if (!isTaxable) {
        return 0
      }
      const ordinaryRate = marginalOrdinaryRate(
        ordinaryTaxable,
        ctx.taxData.ordinaryBrackets[filing]
      )
      let cost = ordinaryRate + ctx.person.stateTaxRate
      if (ctx.age < 59.5 || !ctx.person.rothFiveYearMet) {
        cost += ctx.taxData.earlyWithdrawalPenaltyRate
      }
      return cost
    }
    default:
      return Number.POSITIVE_INFINITY
  }
}

/**
 * Waterfilling allocator: force RMD from traditional, then greedily pick
 * the lowest marginal-cost source in small increments until the spending
 * target is met (or accounts are exhausted).
 */
export const optimizeYearWithdrawals = (
  startingAccounts: Accounts,
  ctx: YearIncomeContext
): OptimizedYear => {
  const withdrawals = emptyWithdrawals()

  const rmd = Math.min(
    ctx.rmdRequired,
    Math.max(0, startingAccounts.traditional401k)
  )
  addWithdrawal(withdrawals, "traditional401k", rmd)

  let current = evaluateCashPosition(startingAccounts, withdrawals, ctx)
  let working = syncWorkingFromWithdrawals(startingAccounts, withdrawals)

  const sources: SourceKey[] = [
    "rothContributions",
    "brokerageBasis",
    "brokerageGains",
    "traditional401k",
    "rothEarnings",
  ]

  let guard = 0
  const maxIterations = 200_000

  while (
    current.afterTaxCash + 1 < ctx.targetAfterTaxSpending &&
    guard < maxIterations
  ) {
    guard += 1

    let bestSource: SourceKey | null = null
    let bestCost = Number.POSITIVE_INFINITY
    let bestAmount = 0

    for (const source of sources) {
      const available = availableOf(working, source)
      if (available <= 0) {
        continue
      }
      const remainingNeed = Math.max(
        0,
        ctx.targetAfterTaxSpending - current.afterTaxCash
      )
      const adaptive = Math.max(MIN_INCREMENT, Math.min(remainingNeed, remainingNeed / 8))
      const amount = Math.min(adaptive, available)
      const cost = estimateMarginalCost(source, amount, current, ctx)
      if (cost < bestCost - 1e-9) {
        bestCost = cost
        bestSource = source
        bestAmount = amount
      }
    }

    if (!bestSource || bestAmount <= 0) {
      break
    }

    addWithdrawal(withdrawals, bestSource, bestAmount)
    working = syncWorkingFromWithdrawals(startingAccounts, withdrawals)
    current = evaluateCashPosition(startingAccounts, withdrawals, ctx)
  }

  return current
}
