export type FilingStatus = "single" | "mfj"

export type Accounts = {
  traditional401k: number
  roth: {
    contributions: number
    earnings: number
  }
  brokerage: {
    basis: number
    balance: number
  }
}

export type FixedIncome = {
  pensionAnnual: number
  socialSecurityAnnual: number
  socialSecurityStartAge: number
}

export type PersonProfile = {
  currentAge: number
  birthYear: number
  filingStatus: FilingStatus
  planEndAge: number
  ruleOf55Applies: boolean
  rothFiveYearMet: boolean
  stateTaxRate: number
  householdSizeForACA: number
  estimatedBenchmarkPremiumAnnual: number
  onACAUntilMedicare: boolean
  useHardAcaCliff: boolean
}

export type Assumptions = {
  inflationRate: number
  returns: {
    traditional401k: number
    roth: number
    brokerage: number
  }
  dividendYieldOnBrokerage: number
  taxYear: number
}

export type PlanInputs = {
  accounts: Accounts
  fixedIncome: FixedIncome
  person: PersonProfile
  assumptions: Assumptions
}

export type Withdrawals = {
  traditional401k: number
  rothContributions: number
  rothEarnings: number
  brokerageBasis: number
  brokerageGains: number
}

export type YearResult = {
  age: number
  calendarYear: number
  withdrawals: Withdrawals
  rmdRequired: number
  earlyWithdrawalPenalty: number
  ordinaryTaxableIncome: number
  capitalGainsTaxableIncome: number
  federalTax: number
  stateTax: number
  magi: number
  irmaaSurcharge: number
  acaSubsidy: number
  acaCliffBreached: boolean
  irmaaBracket: number
  fixedIncomeGross: number
  dividends: number
  afterTaxSpending: number
  endingBalances: Accounts
  totalTaxesAndPenalties: number
}

export type SimulationResult = {
  sustainableAnnualSpending: number
  years: YearResult[]
  totalLifetimeTaxSpending: number
  cliffWarnings: CliffWarning[]
}

export type CliffWarning = {
  age: number
  calendarYear: number
  kind: "aca" | "irmaa"
  message: string
}

export type TaxBracket = {
  upTo: number
  rate: number
}

export type IrmaaTier = {
  magiUpTo: number
  partBMonthly: number
  partDMonthly: number
}

export type TaxYearData = {
  year: number
  ordinaryBrackets: Record<FilingStatus, TaxBracket[]>
  standardDeduction: Record<FilingStatus, number>
  capitalGainsBrackets: Record<FilingStatus, TaxBracket[]>
  irmaaTiers: Record<FilingStatus, IrmaaTier[]>
  federalPovertyLevel: number[]
  rmdDivisors: Record<number, number>
  earlyWithdrawalPenaltyRate: number
  niitThreshold: Record<FilingStatus, number>
  niitRate: number
}
