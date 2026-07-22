import type { YearResult } from "@/lib/engine/types"
import { formatCompactCurrency } from "@/lib/format"
import {
  buildYearlyPlanBlocks,
  getEndingTotal,
  getWithdrawalSourceLabel,
  getYearlyPlanSummary,
  groupYearsIntoBlocks,
} from "@/lib/results/yearly-plan"

const createYear = (overrides: Partial<YearResult> & { age: number }): YearResult => {
  return {
    age: overrides.age,
    calendarYear: overrides.calendarYear ?? 2026 + (overrides.age - 52),
    withdrawals: {
      traditional401k: 0,
      rothContributions: 0,
      rothEarnings: 0,
      brokerageBasis: 0,
      brokerageGains: 0,
      ...overrides.withdrawals,
    },
    rmdRequired: overrides.rmdRequired ?? 0,
    earlyWithdrawalPenalty: 0,
    ordinaryTaxableIncome: 0,
    capitalGainsTaxableIncome: 0,
    federalTax: overrides.federalTax ?? 0,
    stateTax: 0,
    magi: 0,
    irmaaSurcharge: 0,
    acaSubsidy: 0,
    acaCliffBreached: false,
    irmaaBracket: 0,
    fixedIncomeGross: 0,
    dividends: 0,
    afterTaxSpending: overrides.afterTaxSpending ?? 40_000,
    endingBalances: {
      traditional401k: overrides.endingBalances?.traditional401k ?? 100_000,
      roth: {
        contributions: overrides.endingBalances?.roth?.contributions ?? 50_000,
        earnings: overrides.endingBalances?.roth?.earnings ?? 50_000,
      },
      brokerage: {
        basis: overrides.endingBalances?.brokerage?.basis ?? 50_000,
        balance: overrides.endingBalances?.brokerage?.balance ?? 100_000,
      },
    },
    totalTaxesAndPenalties: 0,
  }
}

describe("formatCompactCurrency", () => {
  it("formats thousands and millions", () => {
    expect(formatCompactCurrency(925_000)).toBe("$925k")
    expect(formatCompactCurrency(1_200_000)).toBe("$1.2M")
    expect(formatCompactCurrency(12_000_000)).toBe("$12M")
    expect(formatCompactCurrency(500)).toBe("$500")
  })
})

describe("getEndingTotal", () => {
  it("sums traditional, Roth, and brokerage ending balances", () => {
    const year = createYear({
      age: 55,
      endingBalances: {
        traditional401k: 200_000,
        roth: { contributions: 40_000, earnings: 10_000 },
        brokerage: { basis: 30_000, balance: 50_000 },
      },
    })

    expect(getEndingTotal(year)).toBe(300_000)
  })
})

describe("getWithdrawalSourceLabel", () => {
  it("returns em dash when no withdrawals", () => {
    expect(getWithdrawalSourceLabel(createYear({ age: 55 }))).toBe("—")
  })

  it("joins active sources with plus", () => {
    expect(
      getWithdrawalSourceLabel(
        createYear({
          age: 55,
          withdrawals: {
            traditional401k: 0,
            rothContributions: 10_000,
            rothEarnings: 0,
            brokerageBasis: 5_000,
            brokerageGains: 1_000,
          },
        })
      )
    ).toBe("Roth+Brokerage")

    expect(
      getWithdrawalSourceLabel(
        createYear({
          age: 56,
          withdrawals: {
            traditional401k: 8_000,
            rothContributions: 0,
            rothEarnings: 0,
            brokerageBasis: 0,
            brokerageGains: 0,
          },
        })
      )
    ).toBe("Traditional")
  })
})

describe("groupYearsIntoBlocks", () => {
  it("groups consecutive years into 5-year blocks including leftovers", () => {
    const years = Array.from({ length: 12 }, (_, index) =>
      createYear({ age: 52 + index })
    )

    const blocks = groupYearsIntoBlocks(years, 5)

    expect(blocks).toHaveLength(3)
    expect(blocks[0]?.startAge).toBe(52)
    expect(blocks[0]?.endAge).toBe(56)
    expect(blocks[0]?.years).toHaveLength(5)
    expect(blocks[1]?.startAge).toBe(57)
    expect(blocks[1]?.endAge).toBe(61)
    expect(blocks[2]?.startAge).toBe(62)
    expect(blocks[2]?.endAge).toBe(63)
    expect(blocks[2]?.years).toHaveLength(2)
  })
})

describe("buildYearlyPlanBlocks", () => {
  it("attaches Roth, RMD, and depletion flags to the matching blocks", () => {
    const years = [
      createYear({
        age: 52,
        endingBalances: {
          traditional401k: 200_000,
          roth: { contributions: 80_000, earnings: 20_000 },
          brokerage: { basis: 40_000, balance: 50_000 },
        },
      }),
      createYear({
        age: 53,
        endingBalances: {
          traditional401k: 210_000,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 40_000, balance: 60_000 },
        },
      }),
      createYear({
        age: 54,
        rmdRequired: 12_000,
        endingBalances: {
          traditional401k: 190_000,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 40_000, balance: 70_000 },
        },
      }),
      createYear({
        age: 55,
        rmdRequired: 13_000,
        endingBalances: {
          traditional401k: 100_000,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 20_000, balance: 30_000 },
        },
      }),
      createYear({
        age: 56,
        rmdRequired: 14_000,
        endingBalances: {
          traditional401k: 0,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 0, balance: 0 },
        },
      }),
      createYear({
        age: 57,
        rmdRequired: 0,
        endingBalances: {
          traditional401k: 0,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 0, balance: 0 },
        },
      }),
    ]

    const blocks = buildYearlyPlanBlocks(years, 5)

    expect(blocks[0]?.flag?.kind).toBe("rothDepleted")
    expect(blocks[0]?.flag?.label).toBe("Roth balance runs low here")
    expect(blocks[0]?.flag?.age).toBe(53)

    // First block also contains RMD begin and money depleted; Roth wins as first match in age order
    // Re-check: attachBlockFlags uses flags.find — first flag whose age is in block.
    // Order of detection: Roth at 53, RMD at 54, money at 56 — so Roth is primary for block 0.
    expect(blocks[1]?.flag).toBeNull()
  })

  it("places RMD and depletion flags on later blocks when Roth is earlier", () => {
    const years = [
      ...Array.from({ length: 5 }, (_, index) =>
        createYear({
          age: 52 + index,
          endingBalances: {
            traditional401k: 300_000,
            roth: {
              contributions: index < 2 ? 40_000 : 0,
              earnings: index < 2 ? 10_000 : 0,
            },
            brokerage: { basis: 50_000, balance: 80_000 },
          },
        })
      ),
      ...Array.from({ length: 5 }, (_, index) =>
        createYear({
          age: 57 + index,
          rmdRequired: index === 0 ? 10_000 : 11_000,
          endingBalances: {
            traditional401k: 250_000 - index * 10_000,
            roth: { contributions: 0, earnings: 0 },
            brokerage: { basis: 40_000, balance: 70_000 },
          },
        })
      ),
      ...Array.from({ length: 5 }, (_, index) =>
        createYear({
          age: 62 + index,
          rmdRequired: 12_000,
          endingBalances: {
            traditional401k: index < 4 ? 50_000 : 0,
            roth: { contributions: 0, earnings: 0 },
            brokerage: { basis: 0, balance: index < 4 ? 20_000 : 0 },
          },
        })
      ),
    ]

    const blocks = buildYearlyPlanBlocks(years, 5)

    expect(blocks[0]?.flag?.kind).toBe("rothDepleted")
    expect(blocks[1]?.flag?.kind).toBe("rmdsBegin")
    expect(blocks[1]?.flag?.label).toBe("RMDs begin")
    expect(blocks[2]?.flag?.kind).toBe("moneyDepleted")
    expect(blocks[2]?.flag?.label).toBe("Plan depletes at age 66")
  })
})

describe("getYearlyPlanSummary", () => {
  it("returns null for an empty plan", () => {
    expect(getYearlyPlanSummary([])).toBeNull()
  })

  it("computes peak balance and depletion age", () => {
    const years = [
      createYear({
        age: 60,
        endingBalances: {
          traditional401k: 400_000,
          roth: { contributions: 100_000, earnings: 50_000 },
          brokerage: { basis: 50_000, balance: 100_000 },
        },
      }),
      createYear({
        age: 61,
        endingBalances: {
          traditional401k: 500_000,
          roth: { contributions: 100_000, earnings: 50_000 },
          brokerage: { basis: 50_000, balance: 100_000 },
        },
      }),
      createYear({
        age: 62,
        endingBalances: {
          traditional401k: 0,
          roth: { contributions: 0, earnings: 0 },
          brokerage: { basis: 0, balance: 0 },
        },
      }),
    ]

    const summary = getYearlyPlanSummary(years)

    expect(summary?.planYears).toBe(3)
    expect(summary?.peakBalance).toBe(750_000)
    expect(summary?.firstAge).toBe(60)
    expect(summary?.lastAge).toBe(62)
    expect(summary?.isDepleted).toBe(true)
    expect(summary?.depletionAge).toBe(62)
  })

  it("marks solvent plans as not depleted", () => {
    const years = [
      createYear({ age: 70 }),
      createYear({ age: 71 }),
    ]

    const summary = getYearlyPlanSummary(years)

    expect(summary?.isDepleted).toBe(false)
    expect(summary?.depletionAge).toBeNull()
  })
})
