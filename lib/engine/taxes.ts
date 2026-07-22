import type {
  FilingStatus,
  TaxBracket,
  TaxYearData,
} from "@/lib/engine/types"

export const taxOnBrackets = (
  taxableIncome: number,
  brackets: TaxBracket[]
): number => {
  if (taxableIncome <= 0) {
    return 0
  }

  let tax = 0
  let previousCap = 0

  for (const bracket of brackets) {
    const slice = Math.min(taxableIncome, bracket.upTo) - previousCap
    if (slice <= 0) {
      break
    }
    tax += slice * bracket.rate
    previousCap = bracket.upTo
    if (taxableIncome <= bracket.upTo) {
      break
    }
  }

  return tax
}

export const marginalOrdinaryRate = (
  taxableOrdinaryIncome: number,
  brackets: TaxBracket[]
): number => {
  if (taxableOrdinaryIncome < 0) {
    return brackets[0]?.rate ?? 0
  }

  for (const bracket of brackets) {
    if (taxableOrdinaryIncome < bracket.upTo) {
      return bracket.rate
    }
  }

  return brackets[brackets.length - 1]?.rate ?? 0
}

/**
 * Stacked LTCG: ordinary taxable income fills the bracket stack first,
 * then long-term capital gains / qualified dividends layer on top.
 */
export const taxOnStackedCapitalGains = (
  ordinaryTaxableIncome: number,
  capitalGains: number,
  brackets: TaxBracket[]
): number => {
  if (capitalGains <= 0) {
    return 0
  }

  let remaining = capitalGains
  let cursor = Math.max(0, ordinaryTaxableIncome)
  let tax = 0
  let previousCap = 0

  for (const bracket of brackets) {
    if (remaining <= 0) {
      break
    }

    const roomInBracket = Math.max(0, bracket.upTo - Math.max(cursor, previousCap))
    const taxedHere = Math.min(remaining, roomInBracket)
    tax += taxedHere * bracket.rate
    remaining -= taxedHere
    cursor = Math.max(cursor, previousCap) + taxedHere
    previousCap = bracket.upTo
  }

  return tax
}

export const marginalCapitalGainsRate = (
  ordinaryTaxableIncome: number,
  capitalGainsAlready: number,
  brackets: TaxBracket[]
): number => {
  const position = Math.max(0, ordinaryTaxableIncome) + Math.max(0, capitalGainsAlready)

  for (const bracket of brackets) {
    if (position < bracket.upTo) {
      return bracket.rate
    }
  }

  return brackets[brackets.length - 1]?.rate ?? 0
}

export type FederalTaxBreakdown = {
  ordinaryTaxableIncome: number
  capitalGainsTaxableIncome: number
  ordinaryTax: number
  capitalGainsTax: number
  niit: number
  federalTax: number
}

export const computeFederalTax = (args: {
  ordinaryIncome: number
  capitalGains: number
  filingStatus: FilingStatus
  taxData: TaxYearData
}): FederalTaxBreakdown => {
  const { ordinaryIncome, capitalGains, filingStatus, taxData } = args
  const deduction = taxData.standardDeduction[filingStatus]
  const ordinaryTaxableIncome = Math.max(0, ordinaryIncome - deduction)
  const capitalGainsTaxableIncome = Math.max(0, capitalGains)

  const ordinaryTax = taxOnBrackets(
    ordinaryTaxableIncome,
    taxData.ordinaryBrackets[filingStatus]
  )
  const capitalGainsTax = taxOnStackedCapitalGains(
    ordinaryTaxableIncome,
    capitalGainsTaxableIncome,
    taxData.capitalGainsBrackets[filingStatus]
  )

  const magiProxy = ordinaryIncome + capitalGains
  const niitBase = Math.max(
    0,
    Math.min(capitalGains, magiProxy - taxData.niitThreshold[filingStatus])
  )
  const niit = niitBase * taxData.niitRate

  return {
    ordinaryTaxableIncome,
    capitalGainsTaxableIncome,
    ordinaryTax,
    capitalGainsTax,
    niit,
    federalTax: ordinaryTax + capitalGainsTax + niit,
  }
}

export const computeStateTax = (
  ordinaryIncome: number,
  capitalGains: number,
  stateTaxRate: number
): number => {
  if (stateTaxRate <= 0) {
    return 0
  }
  return Math.max(0, ordinaryIncome + capitalGains) * stateTaxRate
}

export const computeMagi = (
  ordinaryIncome: number,
  capitalGains: number
): number => {
  // Simplified MAGI for ACA/IRMAA planning: AGI proxy (pre-standard-deduction)
  return Math.max(0, ordinaryIncome + capitalGains)
}

export const computeIrmaaAnnualSurcharge = (
  magiTwoYearsPrior: number,
  filingStatus: FilingStatus,
  taxData: TaxYearData,
  age: number
): { surcharge: number; bracketIndex: number } => {
  // IRMAA applies once on Medicare (age 65+)
  if (age < 65) {
    return { surcharge: 0, bracketIndex: 0 }
  }

  const tiers = taxData.irmaaTiers[filingStatus]
  let bracketIndex = 0

  for (let i = 0; i < tiers.length; i += 1) {
    bracketIndex = i
    if (magiTwoYearsPrior <= tiers[i].magiUpTo) {
      break
    }
  }

  const tier = tiers[bracketIndex]
  const monthly = tier.partBMonthly + tier.partDMonthly
  return { surcharge: monthly * 12, bracketIndex }
}

export const getFpl = (
  householdSize: number,
  taxData: TaxYearData
): number => {
  const size = Math.max(1, Math.min(8, Math.floor(householdSize)))
  if (householdSize > 8) {
    const extra = householdSize - 8
    const increment = taxData.federalPovertyLevel[2] - taxData.federalPovertyLevel[1]
    return taxData.federalPovertyLevel[8] + extra * increment
  }
  return taxData.federalPovertyLevel[size]
}

/**
 * Simplified ACA premium tax credit.
 * - If useHardAcaCliff: subsidy drops to $0 above 400% FPL
 * - Else (enhanced): soft contribution caps continue above 400% FPL
 */
export const computeAcaSubsidy = (args: {
  magi: number
  householdSize: number
  benchmarkPremium: number
  taxData: TaxYearData
  useHardAcaCliff: boolean
  age: number
  onACAUntilMedicare: boolean
}): { subsidy: number; cliffBreached: boolean; fplPercent: number } => {
  const {
    magi,
    householdSize,
    benchmarkPremium,
    taxData,
    useHardAcaCliff,
    age,
    onACAUntilMedicare,
  } = args

  if (!onACAUntilMedicare || age >= 65 || benchmarkPremium <= 0) {
    return { subsidy: 0, cliffBreached: false, fplPercent: 0 }
  }

  const fpl = getFpl(householdSize, taxData)
  const fplPercent = fpl > 0 ? (magi / fpl) * 100 : 0

  if (fplPercent < 100) {
    // Below 100% FPL typically Medicaid territory; no marketplace PTC modeled
    return { subsidy: 0, cliffBreached: false, fplPercent }
  }

  if (useHardAcaCliff && fplPercent > 400) {
    return { subsidy: 0, cliffBreached: true, fplPercent }
  }

  const requiredContributionRate = getAcaRequiredContributionRate(
    fplPercent,
    useHardAcaCliff
  )
  const requiredContribution = magi * requiredContributionRate
  const subsidy = Math.max(0, benchmarkPremium - requiredContribution)

  // Soft "cliff" warning when crossing 400% even under enhanced subsidies
  // (user may still care about the threshold if law reverts)
  const cliffBreached = fplPercent > 400 && useHardAcaCliff

  return { subsidy, cliffBreached, fplPercent }
}

const getAcaRequiredContributionRate = (
  fplPercent: number,
  useHardAcaCliff: boolean
): number => {
  // Piecewise-linear approximation of ACA premium contribution percentages
  if (fplPercent <= 150) {
    return 0
  }
  if (fplPercent <= 200) {
    return lerp(0, 0.02, (fplPercent - 150) / 50)
  }
  if (fplPercent <= 250) {
    return lerp(0.02, 0.04, (fplPercent - 200) / 50)
  }
  if (fplPercent <= 300) {
    return lerp(0.04, 0.06, (fplPercent - 250) / 50)
  }
  if (fplPercent <= 400) {
    return lerp(0.06, 0.085, (fplPercent - 300) / 100)
  }

  if (useHardAcaCliff) {
    return 1 // effectively no subsidy
  }

  // Enhanced subsidies: continue ~8.5% cap above 400% FPL
  return 0.085
}

const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}

export const computeEarlyWithdrawalPenalty = (args: {
  traditionalWithdrawal: number
  rothEarningsWithdrawal: number
  age: number
  ruleOf55Applies: boolean
  rothFiveYearMet: boolean
  penaltyRate: number
}): number => {
  const {
    traditionalWithdrawal,
    rothEarningsWithdrawal,
    age,
    ruleOf55Applies,
    rothFiveYearMet,
    penaltyRate,
  } = args

  const under5912 = age < 59.5
  let penalized = 0

  if (under5912 && !ruleOf55Applies) {
    penalized += Math.max(0, traditionalWithdrawal)
  }

  // Roth earnings: penalty if under 59.5 OR 5-year rule not met (simplified)
  if (rothEarningsWithdrawal > 0 && (under5912 || !rothFiveYearMet)) {
    penalized += rothEarningsWithdrawal
  }

  return penalized * penaltyRate
}
