import {
  computeAcaSubsidy,
  computeEarlyWithdrawalPenalty,
  computeFederalTax,
  computeIrmaaAnnualSurcharge,
  taxOnBrackets,
  taxOnStackedCapitalGains,
} from "@/lib/engine/taxes"
import { taxData2026 } from "@/lib/tax-data"

describe("taxes", () => {
  it("computes ordinary tax across brackets", () => {
    // First $12,400 @ 10% = 1,240; next up to 20,000 at 12%
    const tax = taxOnBrackets(20_000, taxData2026.ordinaryBrackets.single)
    const expected = 12_400 * 0.1 + (20_000 - 12_400) * 0.12
    expect(tax).toBeCloseTo(expected, 5)
  })

  it("stacks capital gains on top of ordinary income", () => {
    // Ordinary taxable 40k fills through 0% CG bracket (up to 49,450)
    // So first 9,450 of gains at 0%, rest at 15%
    const gainsTax = taxOnStackedCapitalGains(
      40_000,
      20_000,
      taxData2026.capitalGainsBrackets.single
    )
    const zeroRoom = 49_450 - 40_000
    const expected = zeroRoom * 0 + (20_000 - zeroRoom) * 0.15
    expect(gainsTax).toBeCloseTo(expected, 5)
  })

  it("applies standard deduction in federal tax", () => {
    const result = computeFederalTax({
      ordinaryIncome: taxData2026.standardDeduction.single,
      capitalGains: 0,
      filingStatus: "single",
      taxData: taxData2026,
    })
    expect(result.ordinaryTaxableIncome).toBe(0)
    expect(result.federalTax).toBe(0)
  })

  it("applies early withdrawal penalty under 59.5 without Rule of 55", () => {
    const penalty = computeEarlyWithdrawalPenalty({
      traditionalWithdrawal: 10_000,
      rothEarningsWithdrawal: 0,
      age: 52,
      ruleOf55Applies: false,
      rothFiveYearMet: true,
      penaltyRate: 0.1,
    })
    expect(penalty).toBe(1_000)
  })

  it("skips traditional penalty when Rule of 55 applies", () => {
    const penalty = computeEarlyWithdrawalPenalty({
      traditionalWithdrawal: 10_000,
      rothEarningsWithdrawal: 0,
      age: 52,
      ruleOf55Applies: true,
      rothFiveYearMet: true,
      penaltyRate: 0.1,
    })
    expect(penalty).toBe(0)
  })

  it("applies IRMAA with 2-year MAGI lookback only at Medicare ages", () => {
    const under65 = computeIrmaaAnnualSurcharge(
      150_000,
      "single",
      taxData2026,
      64
    )
    expect(under65.surcharge).toBe(0)

    const onMedicare = computeIrmaaAnnualSurcharge(
      150_000,
      "single",
      taxData2026,
      65
    )
    expect(onMedicare.bracketIndex).toBeGreaterThan(0)
    expect(onMedicare.surcharge).toBeGreaterThan(0)
  })

  it("flags hard ACA cliff above 400% FPL", () => {
    const fpl = taxData2026.federalPovertyLevel[1]
    const result = computeAcaSubsidy({
      magi: fpl * 4.1,
      householdSize: 1,
      benchmarkPremium: 8_000,
      taxData: taxData2026,
      useHardAcaCliff: true,
      age: 55,
      onACAUntilMedicare: true,
    })
    expect(result.cliffBreached).toBe(true)
    expect(result.subsidy).toBe(0)
  })
})
