import { computeRmd, getRmdStartAge, isRmdApplicable } from "@/lib/engine/rmd"
import { taxData2026 } from "@/lib/tax-data"

describe("rmd", () => {
  it("returns SECURE 2.0 start ages from birth year", () => {
    expect(getRmdStartAge(1949)).toBe(72)
    expect(getRmdStartAge(1955)).toBe(73)
    expect(getRmdStartAge(1960)).toBe(75)
  })

  it("is not applicable before the start age", () => {
    expect(isRmdApplicable(72, 1960)).toBe(false)
    expect(isRmdApplicable(75, 1960)).toBe(true)
    expect(isRmdApplicable(73, 1955)).toBe(true)
  })

  it("computes RMD using Uniform Lifetime Table divisor", () => {
    // Age 75 divisor is 24.6 → 246_000 / 24.6 = 10_000
    const rmd = computeRmd(246_000, 75, 1950, taxData2026)
    expect(rmd).toBeCloseTo(10_000, 5)
  })

  it("returns zero when traditional balance is empty", () => {
    expect(computeRmd(0, 80, 1945, taxData2026)).toBe(0)
  })
})
