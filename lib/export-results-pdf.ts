import { jsPDF } from "jspdf"
import { autoTable } from "jspdf-autotable"
import type { SimulationResult } from "@/lib/engine/types"
import { formatCurrency, formatPercent } from "@/lib/format"
import {
  collapseCliffWarnings,
  formatCollapsedCliffMessage,
} from "@/lib/results/cliff-warnings"
import {
  getEndingTotal,
  getRothEndingTotal,
  getWithdrawalSourceLabel,
  getYearlyPlanSummary,
} from "@/lib/results/yearly-plan"
import type { PlanFormValues } from "@/lib/schema"

type ExportResultsPdfOptions = {
  result: SimulationResult
  formValues: PlanFormValues
}

const BRAND = {
  ink: [18, 40, 32] as [number, number, number],
  forest: [22, 53, 44] as [number, number, number],
  muted: [90, 104, 98] as [number, number, number],
  line: [210, 218, 214] as [number, number, number],
  soft: [232, 243, 239] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  amber: [120, 72, 12] as [number, number, number],
  amberBg: [255, 247, 230] as [number, number, number],
}

const PAGE_MARGIN = 16
const CONTENT_WIDTH = 178

const formatFilingStatus = (status: PlanFormValues["filingStatus"]) =>
  status === "mfj" ? "Married filing jointly" : "Single"

const formatYesNo = (value: boolean) => (value ? "Yes" : "No")

const formatExportDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)

const ensureSpace = (doc: jsPDF, y: number, needed: number) => {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed <= pageHeight - PAGE_MARGIN) {
    return y
  }

  doc.addPage()
  return PAGE_MARGIN + 4
}

const drawSectionTitle = (doc: jsPDF, title: string, y: number) => {
  const nextY = ensureSpace(doc, y, 14)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...BRAND.ink)
  doc.text(title, PAGE_MARGIN, nextY)
  doc.setDrawColor(...BRAND.line)
  doc.setLineWidth(0.4)
  doc.line(PAGE_MARGIN, nextY + 2.5, PAGE_MARGIN + CONTENT_WIDTH, nextY + 2.5)
  return nextY + 8
}

const drawKeyValueGrid = (
  doc: jsPDF,
  rows: Array<[string, string]>,
  startY: number,
  columns = 2
) => {
  const colWidth = CONTENT_WIDTH / columns
  const rowHeight = 11
  let y = startY

  for (let index = 0; index < rows.length; index += columns) {
    y = ensureSpace(doc, y, rowHeight)
    const rowSlice = rows.slice(index, index + columns)

    rowSlice.forEach((row, column) => {
      const x = PAGE_MARGIN + column * colWidth

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...BRAND.muted)
      doc.text(row[0], x, y)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(...BRAND.ink)
      doc.text(row[1], x, y + 4.5)
    })

    y += rowHeight
  }

  return y
}

export const exportResultsToPdf = ({
  result,
  formValues,
}: ExportResultsPdfOptions) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const exportedAt = new Date()
  const planYears = result.years.length
  const totalTaxesAndPenalties = result.years.reduce(
    (sum, year) => sum + year.totalTaxesAndPenalties,
    0
  )
  const planSummary = getYearlyPlanSummary(result.years)
  const firstYear = result.years[0]
  const lastYear = result.years[result.years.length - 1]

  doc.setFillColor(...BRAND.forest)
  doc.rect(0, 0, 210, 28, "F")

  doc.setTextColor(...BRAND.white)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("Deccum", PAGE_MARGIN, 12)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Retirement withdrawal simulation report", PAGE_MARGIN, 19)

  doc.setFontSize(8)
  doc.text(formatExportDate(exportedAt), 210 - PAGE_MARGIN, 12, {
    align: "right",
  })

  let y = 38

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...BRAND.muted)
  doc.text("MAX SUSTAINABLE SPENDING", PAGE_MARGIN, y)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(...BRAND.ink)
  doc.text(
    `${formatCurrency(result.sustainableAnnualSpending)} / year`,
    PAGE_MARGIN,
    y + 9
  )

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...BRAND.muted)
  doc.text("In today's dollars", PAGE_MARGIN, y + 15)

  y += 24

  doc.setFillColor(...BRAND.soft)
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 24, 2, 2, "F")

  const summaryCards: Array<[string, string]> = [
    ["Lifetime after-tax spending", formatCurrency(result.totalLifetimeTaxSpending)],
    ["Plan years covered", String(planYears)],
    ["Total taxes & penalties", formatCurrency(totalTaxesAndPenalties)],
  ]

  summaryCards.forEach((card, index) => {
    const x = PAGE_MARGIN + 6 + index * (CONTENT_WIDTH / 3)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(...BRAND.muted)
    doc.text(card[0], x, y + 8)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...BRAND.ink)
    doc.text(card[1], x, y + 16)
  })

  y += 34

  y = drawSectionTitle(doc, "Plan snapshot", y)

  const planRows: Array<[string, string]> = [
    ["Current age", String(formValues.currentAge)],
    ["Plan end age", String(formValues.planEndAge)],
    ["Filing status", formatFilingStatus(formValues.filingStatus)],
    ["Tax year", String(formValues.taxYear)],
    ["Birth year", String(formValues.birthYear)],
    [
      "Ages covered",
      firstYear && lastYear
        ? `${firstYear.age}–${lastYear.age}`
        : "—",
    ],
  ]

  if (planSummary) {
    planRows.push(
      ["Peak balance", formatCurrency(planSummary.peakBalance)],
      [
        "Depletion",
        planSummary.isDepleted && planSummary.depletionAge !== null
          ? `Age ${planSummary.depletionAge}`
          : "Not depleted",
      ]
    )
  }

  y = drawKeyValueGrid(doc, planRows, y, 3)
  y += 2

  y = drawSectionTitle(doc, "Starting balances", y)
  y = drawKeyValueGrid(
    doc,
    [
      ["Traditional 401(k)", formatCurrency(formValues.traditional401k)],
      [
        "Roth total",
        formatCurrency(formValues.rothContributions + formValues.rothEarnings),
      ],
      ["Roth contributions", formatCurrency(formValues.rothContributions)],
      ["Roth earnings", formatCurrency(formValues.rothEarnings)],
      ["Brokerage balance", formatCurrency(formValues.brokerageBalance)],
      ["Brokerage cost basis", formatCurrency(formValues.brokerageBasis)],
    ],
    y,
    3
  )
  y += 2

  y = drawSectionTitle(doc, "Income & assumptions", y)
  y = drawKeyValueGrid(
    doc,
    [
      ["Pension (annual)", formatCurrency(formValues.pensionAnnual)],
      [
        "Social Security (annual)",
        formatCurrency(formValues.socialSecurityAnnual),
      ],
      [
        "Social Security start age",
        String(formValues.socialSecurityStartAge),
      ],
      ["Inflation", formatPercent(formValues.inflationRatePercent / 100)],
      [
        "Traditional return",
        formatPercent(formValues.returnTraditionalPercent / 100),
      ],
      ["Roth return", formatPercent(formValues.returnRothPercent / 100)],
      [
        "Brokerage return",
        formatPercent(formValues.returnBrokeragePercent / 100),
      ],
      [
        "Dividend yield",
        formatPercent(formValues.dividendYieldPercent / 100),
      ],
      ["State tax rate", formatPercent(formValues.stateTaxRatePercent / 100)],
      ["Rule of 55", formatYesNo(formValues.ruleOf55Applies)],
      ["Roth 5-year met", formatYesNo(formValues.rothFiveYearMet)],
      ["ACA until Medicare", formatYesNo(formValues.onACAUntilMedicare)],
    ],
    y,
    3
  )
  y += 2

  const collapsedWarnings = collapseCliffWarnings(result.cliffWarnings)
  y = drawSectionTitle(doc, "Cliff warnings", y)

  if (collapsedWarnings.length === 0) {
    y = ensureSpace(doc, y, 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...BRAND.muted)
    doc.text(
      "No ACA cliff breaches or IRMAA surcharges detected in this plan.",
      PAGE_MARGIN,
      y
    )
    y += 10
  } else {
    collapsedWarnings.forEach((warning) => {
      const kindLabel = warning.kind === "aca" ? "ACA cliff" : "IRMAA"
      const message = formatCollapsedCliffMessage(
        warning.startAge,
        warning.endAge,
        warning.messageBody
      )
      const lines = doc.splitTextToSize(
        `${kindLabel} — ${message}`,
        CONTENT_WIDTH - 8
      ) as string[]
      const boxHeight = 6 + lines.length * 4.2

      y = ensureSpace(doc, y, boxHeight + 2)
      doc.setFillColor(...BRAND.amberBg)
      doc.roundedRect(PAGE_MARGIN, y - 3.5, CONTENT_WIDTH, boxHeight, 1.5, 1.5, "F")
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(...BRAND.amber)
      doc.text(lines, PAGE_MARGIN + 4, y + 1)
      y += boxHeight + 2
    })
    y += 2
  }

  y = drawSectionTitle(doc, "Year-by-year plan", y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(...BRAND.muted)
  y = ensureSpace(doc, y, 6)
  doc.text(
    "Withdrawals, taxes, and ending balances for each year in the simulation.",
    PAGE_MARGIN,
    y
  )
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [
      [
        "Age",
        "Year",
        "Source",
        "Spending",
        "Trad.",
        "Roth",
        "Brokerage",
        "Taxes",
        "Ending total",
      ],
    ],
    body: result.years.map((year) => {
      const rothWithdrawal =
        year.withdrawals.rothContributions + year.withdrawals.rothEarnings
      const brokerageWithdrawal =
        year.withdrawals.brokerageBasis + year.withdrawals.brokerageGains

      return [
        String(year.age),
        String(year.calendarYear),
        getWithdrawalSourceLabel(year),
        formatCurrency(year.afterTaxSpending),
        formatCurrency(year.withdrawals.traditional401k),
        formatCurrency(rothWithdrawal),
        formatCurrency(brokerageWithdrawal),
        formatCurrency(year.totalTaxesAndPenalties),
        formatCurrency(getEndingTotal(year)),
      ]
    }),
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 1.6,
      textColor: BRAND.ink,
      lineColor: BRAND.line,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: BRAND.forest,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [246, 249, 247],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 14 },
      2: { cellWidth: 24 },
      3: { halign: "right", cellWidth: 20 },
      4: { halign: "right", cellWidth: 20 },
      5: { halign: "right", cellWidth: 20 },
      6: { halign: "right", cellWidth: 20 },
      7: { halign: "right", cellWidth: 20 },
      8: { halign: "right", cellWidth: 28 },
    },
  })

  const tableEndY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? y

  let endingY = tableEndY + 10
  endingY = drawSectionTitle(doc, "Ending balances by account (final year)", endingY)

  if (lastYear) {
    endingY = drawKeyValueGrid(
      doc,
      [
        [
          "Traditional 401(k)",
          formatCurrency(lastYear.endingBalances.traditional401k),
        ],
        ["Roth total", formatCurrency(getRothEndingTotal(lastYear))],
        [
          "Brokerage",
          formatCurrency(lastYear.endingBalances.brokerage.balance),
        ],
        ["Total", formatCurrency(getEndingTotal(lastYear))],
      ],
      endingY,
      2
    )
  }

  endingY = ensureSpace(doc, endingY + 4, 12)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...BRAND.muted)
  const disclaimer = doc.splitTextToSize(
    "This report summarizes Deccum's modeled withdrawal sequence based on the inputs and assumptions you provided. It is not tax, legal, or investment advice.",
    CONTENT_WIDTH
  ) as string[]
  doc.text(disclaimer, PAGE_MARGIN, endingY)

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(...BRAND.muted)
    doc.text(
      "Deccum simulation export · For planning purposes only",
      PAGE_MARGIN,
      pageHeight - 8
    )
    doc.text(`Page ${page} of ${totalPages}`, 210 - PAGE_MARGIN, pageHeight - 8, {
      align: "right",
    })
  }

  const ageLabel =
    firstYear && lastYear ? `${firstYear.age}-${lastYear.age}` : "plan"
  const filename = `deccum-simulation-${ageLabel}-${exportedAt
    .toISOString()
    .slice(0, 10)}.pdf`

  doc.save(filename)
}
