import { findSustainableSpending } from "@/lib/engine/sustainable-spending"
import type { PlanInputs } from "@/lib/engine/types"

const sampleInputs = (): PlanInputs => ({
  accounts: {
    traditional401k: 300_000,
    roth: { contributions: 50_000, earnings: 25_000 },
    brokerage: { basis: 40_000, balance: 60_000 },
  },
  fixedIncome: {
    pensionAnnual: 0,
    socialSecurityAnnual: 0,
    socialSecurityStartAge: 67,
  },
  person: {
    currentAge: 60,
    birthYear: 1966,
    filingStatus: "single",
    planEndAge: 75,
    ruleOf55Applies: false,
    rothFiveYearMet: true,
    stateTaxRate: 0.05,
    householdSizeForACA: 1,
    estimatedBenchmarkPremiumAnnual: 0,
    onACAUntilMedicare: false,
    useHardAcaCliff: true,
  },
  assumptions: {
    inflationRate: 0.02,
    returns: {
      traditional401k: 0.04,
      roth: 0.04,
      brokerage: 0.04,
    },
    dividendYieldOnBrokerage: 0.01,
    taxYear: 2026,
  },
})

describe("sustainable-spending", () => {
  it("finds a positive sustainable spending level for funded accounts", () => {
    const result = findSustainableSpending(sampleInputs())
    expect(result.sustainableAnnualSpending).toBeGreaterThan(5_000)
    expect(result.years.length).toBeGreaterThan(0)
    expect(result.years[0].age).toBe(60)
  })

  it("returns near-zero spending when accounts are empty", () => {
    const inputs = sampleInputs()
    inputs.accounts = {
      traditional401k: 0,
      roth: { contributions: 0, earnings: 0 },
      brokerage: { basis: 0, balance: 0 },
    }
    const result = findSustainableSpending(inputs)
    expect(result.sustainableAnnualSpending).toBeLessThan(1_000)
  })
})
