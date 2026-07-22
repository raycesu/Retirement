import { exportResultsToPdf } from "@/lib/export-results-pdf"
import { defaultPlanFormValues } from "@/lib/schema"
import type { SimulationResult, YearResult } from "@/lib/engine/types"

const saveMock = jest.fn()

jest.mock("jspdf", () => {
  class MockJsPDF {
    internal = {
      pageSize: {
        getHeight: () => 297,
      },
    }

    setFillColor = jest.fn()
    rect = jest.fn()
    roundedRect = jest.fn()
    setTextColor = jest.fn()
    setFont = jest.fn()
    setFontSize = jest.fn()
    text = jest.fn()
    setDrawColor = jest.fn()
    setLineWidth = jest.fn()
    line = jest.fn()
    addPage = jest.fn()
    splitTextToSize = jest.fn((value: string) => [value])
    getNumberOfPages = jest.fn(() => 1)
    setPage = jest.fn()
    save = saveMock
  }

  return { jsPDF: MockJsPDF }
})

jest.mock("jspdf-autotable", () => ({
  autoTable: jest.fn((doc: { lastAutoTable?: { finalY: number } }) => {
    doc.lastAutoTable = { finalY: 120 }
  }),
}))

const createYear = (age: number): YearResult => ({
  age,
  calendarYear: 2026 + (age - 52),
  withdrawals: {
    traditional401k: 20_000,
    rothContributions: 0,
    rothEarnings: 5_000,
    brokerageBasis: 2_000,
    brokerageGains: 1_000,
  },
  rmdRequired: 0,
  earlyWithdrawalPenalty: 0,
  ordinaryTaxableIncome: 25_000,
  capitalGainsTaxableIncome: 1_000,
  federalTax: 3_000,
  stateTax: 1_000,
  magi: 40_000,
  irmaaSurcharge: 0,
  acaSubsidy: 0,
  acaCliffBreached: false,
  irmaaBracket: 0,
  fixedIncomeGross: 12_000,
  dividends: 500,
  afterTaxSpending: 40_000,
  endingBalances: {
    traditional401k: 400_000 - (age - 52) * 10_000,
    roth: {
      contributions: 80_000,
      earnings: 40_000,
    },
    brokerage: {
      basis: 100_000,
      balance: 150_000,
    },
  },
  totalTaxesAndPenalties: 4_000,
})

const sampleResult: SimulationResult = {
  sustainableAnnualSpending: 42_000,
  totalLifetimeTaxSpending: 1_200_000,
  cliffWarnings: [
    {
      age: 58,
      calendarYear: 2032,
      kind: "aca",
      message: "Age 58: MAGI crossed the ACA subsidy cliff.",
    },
  ],
  years: [createYear(52), createYear(53), createYear(54)],
}

describe("exportResultsToPdf", () => {
  beforeEach(() => {
    saveMock.mockClear()
  })

  it("generates and downloads a PDF file", () => {
    exportResultsToPdf({
      result: sampleResult,
      formValues: defaultPlanFormValues,
    })

    expect(saveMock).toHaveBeenCalledTimes(1)
    expect(saveMock.mock.calls[0]?.[0]).toMatch(
      /^deccum-simulation-52-54-\d{4}-\d{2}-\d{2}\.pdf$/
    )
  })
})
