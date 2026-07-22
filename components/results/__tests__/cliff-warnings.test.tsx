import { render, screen } from "@testing-library/react"
import { CliffWarnings } from "@/components/results/cliff-warnings"

describe("CliffWarnings", () => {
  it("shows an empty state when there are no warnings", () => {
    render(<CliffWarnings warnings={[]} />)
    expect(
      screen.getByText(/No ACA cliff breaches or IRMAA surcharges/i)
    ).toBeInTheDocument()
  })

  it("renders ACA and IRMAA warnings", () => {
    render(
      <CliffWarnings
        warnings={[
          {
            age: 58,
            calendarYear: 2032,
            kind: "aca",
            message: "Age 58: MAGI crossed the ACA subsidy cliff.",
          },
          {
            age: 65,
            calendarYear: 2039,
            kind: "irmaa",
            message: "Age 65: IRMAA surcharge applies.",
          },
        ]}
      />
    )

    expect(screen.getByText("ACA cliff")).toBeInTheDocument()
    expect(screen.getByText("IRMAA")).toBeInTheDocument()
    expect(
      screen.getByText(/MAGI crossed the ACA subsidy cliff/i)
    ).toBeInTheDocument()
  })
})
