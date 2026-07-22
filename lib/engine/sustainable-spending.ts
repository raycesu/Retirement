import {
  cloneAccounts,
  simulatePlan,
  summarizeSimulation,
  totalBalance,
} from "@/lib/engine/simulate"
import type { PlanInputs, SimulationResult } from "@/lib/engine/types"

const canSustain = (inputs: PlanInputs, spending: number): boolean => {
  if (spending < 0) {
    return true
  }

  const { years, endedSolvent } = simulatePlan(inputs, {
    targetAfterTaxSpending: spending,
    inflateSpending: true,
  })

  if (years.length === 0) {
    return false
  }

  const lastAge = Math.floor(inputs.person.planEndAge)
  const reachedEnd = years[years.length - 1]?.age >= lastAge
  if (!reachedEnd) {
    return false
  }

  // Every year should roughly meet the inflation-adjusted target
  const startAge = Math.floor(inputs.person.currentAge)
  for (const year of years) {
    const yearIndex = year.age - startAge
    const target =
      spending * Math.pow(1 + inputs.assumptions.inflationRate, yearIndex)
    if (year.afterTaxSpending + 250 < target) {
      return false
    }
  }

  return endedSolvent
}

/**
 * Binary search for the maximum constant real after-tax spending
 * sustainable through planEndAge.
 */
export const findSustainableSpending = (
  inputs: PlanInputs
): SimulationResult => {
  const startingWealth = totalBalance(cloneAccounts(inputs.accounts))
  const fixedFloor =
    inputs.fixedIncome.pensionAnnual +
    (inputs.person.currentAge >= inputs.fixedIncome.socialSecurityStartAge
      ? inputs.fixedIncome.socialSecurityAnnual
      : 0)

  let low = 0
  let high = Math.max(startingWealth * 0.12 + fixedFloor, fixedFloor + 1_000, 10_000)

  // Expand upper bound until unsustainable
  while (canSustain(inputs, high) && high < startingWealth + fixedFloor * 40) {
    high *= 1.6
  }

  // If even tiny spending fails (no assets / short horizon edge), return zero plan
  if (!canSustain(inputs, 0)) {
    const empty = simulatePlan(inputs, {
      targetAfterTaxSpending: 0,
      inflateSpending: true,
    })
    return summarizeSimulation(inputs, 0, empty.years, empty.cliffWarnings)
  }

  for (let i = 0; i < 28; i += 1) {
    const mid = (low + high) / 2
    if (canSustain(inputs, mid)) {
      low = mid
    } else {
      high = mid
    }
  }

  const sustainableAnnualSpending = Math.floor(low)
  const finalRun = simulatePlan(inputs, {
    targetAfterTaxSpending: sustainableAnnualSpending,
    inflateSpending: true,
  })

  return summarizeSimulation(
    inputs,
    sustainableAnnualSpending,
    finalRun.years,
    finalRun.cliffWarnings
  )
}
