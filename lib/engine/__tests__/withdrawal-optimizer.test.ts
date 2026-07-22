import { optimizeYearWithdrawals } from "@/lib/engine/withdrawal-optimizer"
import type { Accounts, PersonProfile } from "@/lib/engine/types"
import { taxData2026 } from "@/lib/tax-data"

const basePerson: PersonProfile = {
  currentAge: 60,
  birthYear: 1966,
  filingStatus: "single",
  planEndAge: 95,
  ruleOf55Applies: false,
  rothFiveYearMet: true,
  stateTaxRate: 0,
  householdSizeForACA: 1,
  estimatedBenchmarkPremiumAnnual: 0,
  onACAUntilMedicare: false,
  useHardAcaCliff: true,
}

describe("withdrawal-optimizer", () => {
  it("prefers Roth contributions and brokerage basis before taxable sources", () => {
    const accounts: Accounts = {
      traditional401k: 100_000,
      roth: { contributions: 20_000, earnings: 10_000 },
      brokerage: { basis: 15_000, balance: 25_000 },
    }

    const result = optimizeYearWithdrawals(accounts, {
      age: 60,
      filingStatus: "single",
      person: basePerson,
      taxData: taxData2026,
      fixedOrdinaryIncome: 0,
      dividends: 0,
      rmdRequired: 0,
      magiTwoYearsPrior: 0,
      targetAfterTaxSpending: 30_000,
    })

    expect(result.withdrawals.rothContributions).toBeGreaterThan(0)
    expect(result.withdrawals.brokerageBasis).toBeGreaterThan(0)
    // Tax-free Roth contributions should be preferred first
    expect(result.withdrawals.rothContributions).toBe(20_000)
    // Traditional should not be needed while cheaper tax-free cash remains available
    expect(result.withdrawals.traditional401k).toBe(0)
    expect(result.afterTaxCash).toBeGreaterThanOrEqual(30_000)
  })

  it("forces at least the RMD from traditional accounts", () => {
    const accounts: Accounts = {
      traditional401k: 246_000,
      roth: { contributions: 50_000, earnings: 0 },
      brokerage: { basis: 50_000, balance: 50_000 },
    }

    const result = optimizeYearWithdrawals(accounts, {
      age: 75,
      filingStatus: "single",
      person: { ...basePerson, currentAge: 75, birthYear: 1951 },
      taxData: taxData2026,
      fixedOrdinaryIncome: 0,
      dividends: 0,
      rmdRequired: 10_000,
      magiTwoYearsPrior: 0,
      targetAfterTaxSpending: 5_000,
    })

    expect(result.withdrawals.traditional401k).toBeGreaterThanOrEqual(10_000)
  })
})
