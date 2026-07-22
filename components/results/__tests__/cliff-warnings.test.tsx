import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CliffWarnings } from "@/components/results/cliff-warnings"

const openWarningsTooltip = async () => {
  const user = userEvent.setup()
  await user.hover(screen.getByRole("button", { name: /show cliff warnings/i }))
}

describe("CliffWarnings", () => {
  it("shows an empty state when there are no warnings", () => {
    render(<CliffWarnings warnings={[]} />)
    expect(
      screen.getByText(/No ACA cliff breaches or IRMAA surcharges/i)
    ).toBeInTheDocument()
  })

  it("renders a title with tooltip trigger instead of inline warnings", () => {
    render(
      <CliffWarnings
        warnings={[
          {
            age: 58,
            calendarYear: 2032,
            kind: "aca",
            message: "Age 58: MAGI crossed the ACA subsidy cliff.",
          },
        ]}
      />
    )

    expect(screen.getByText("Cliff warnings")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /show cliff warnings/i })
    ).toBeInTheDocument()
    expect(screen.queryByText("ACA cliff")).not.toBeInTheDocument()
  })

  it("renders ACA and IRMAA warnings in the tooltip", async () => {
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

    await openWarningsTooltip()

    expect(screen.getByText("ACA cliff")).toBeInTheDocument()
    expect(screen.getByText("IRMAA")).toBeInTheDocument()
    expect(
      screen.getByText(/MAGI crossed the ACA subsidy cliff/i)
    ).toBeInTheDocument()
  })

  it("collapses consecutive same-tier IRMAA warnings into one age range", async () => {
    render(
      <CliffWarnings
        warnings={[
          {
            age: 84,
            calendarYear: 2050,
            kind: "irmaa",
            message:
              "Age 84: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 85,
            calendarYear: 2051,
            kind: "irmaa",
            message:
              "Age 85: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 86,
            calendarYear: 2052,
            kind: "irmaa",
            message:
              "Age 86: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 87,
            calendarYear: 2053,
            kind: "irmaa",
            message:
              "Age 87: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 88,
            calendarYear: 2054,
            kind: "irmaa",
            message:
              "Age 88: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
        ]}
      />
    )

    await openWarningsTooltip()

    expect(
      screen.getByText(
        /Age 84-88: IRMAA surcharge applies \(tier 1\) based on MAGI from two years prior\./i
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/Age 84:/i)).not.toBeInTheDocument()
    expect(screen.getAllByText("IRMAA")).toHaveLength(1)
  })

  it("keeps different IRMAA tiers as separate warnings", async () => {
    render(
      <CliffWarnings
        warnings={[
          {
            age: 84,
            calendarYear: 2050,
            kind: "irmaa",
            message:
              "Age 84: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 85,
            calendarYear: 2051,
            kind: "irmaa",
            message:
              "Age 85: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 86,
            calendarYear: 2052,
            kind: "irmaa",
            message:
              "Age 86: IRMAA surcharge applies (tier 2) based on MAGI from two years prior.",
          },
          {
            age: 87,
            calendarYear: 2053,
            kind: "irmaa",
            message:
              "Age 87: IRMAA surcharge applies (tier 2) based on MAGI from two years prior.",
          },
        ]}
      />
    )

    await openWarningsTooltip()

    expect(
      screen.getByText(
        /Age 84-85: IRMAA surcharge applies \(tier 1\) based on MAGI from two years prior\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Age 86-87: IRMAA surcharge applies \(tier 2\) based on MAGI from two years prior\./i
      )
    ).toBeInTheDocument()
    expect(screen.getAllByText("IRMAA")).toHaveLength(2)
  })

  it("does not collapse IRMAA warnings when ages are not contiguous", async () => {
    render(
      <CliffWarnings
        warnings={[
          {
            age: 84,
            calendarYear: 2050,
            kind: "irmaa",
            message:
              "Age 84: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
          {
            age: 86,
            calendarYear: 2052,
            kind: "irmaa",
            message:
              "Age 86: IRMAA surcharge applies (tier 1) based on MAGI from two years prior.",
          },
        ]}
      />
    )

    await openWarningsTooltip()

    expect(
      screen.getByText(
        /Age 84: IRMAA surcharge applies \(tier 1\) based on MAGI from two years prior\./i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Age 86: IRMAA surcharge applies \(tier 1\) based on MAGI from two years prior\./i
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/Age 84-86:/i)).not.toBeInTheDocument()
    expect(screen.getAllByText("IRMAA")).toHaveLength(2)
  })
})
