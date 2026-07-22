import type { PlanFormValues } from "@/lib/schema"
import type { PlanInputs } from "@/lib/engine/types"

export const mapFormToPlanInputs = (values: PlanFormValues): PlanInputs => {
  return {
    accounts: {
      traditional401k: values.traditional401k,
      roth: {
        contributions: values.rothContributions,
        earnings: values.rothEarnings,
      },
      brokerage: {
        balance: values.brokerageBalance,
        basis: values.brokerageBasis,
      },
    },
    fixedIncome: {
      pensionAnnual: values.pensionAnnual,
      socialSecurityAnnual: values.socialSecurityAnnual,
      socialSecurityStartAge: values.socialSecurityStartAge,
    },
    person: {
      currentAge: values.currentAge,
      birthYear: values.birthYear,
      filingStatus: values.filingStatus,
      planEndAge: values.planEndAge,
      ruleOf55Applies: values.ruleOf55Applies,
      rothFiveYearMet: values.rothFiveYearMet,
      stateTaxRate: values.stateTaxRatePercent / 100,
      householdSizeForACA: values.householdSizeForACA,
      estimatedBenchmarkPremiumAnnual: values.estimatedBenchmarkPremiumAnnual,
      onACAUntilMedicare: values.onACAUntilMedicare,
      useHardAcaCliff: values.useHardAcaCliff,
    },
    assumptions: {
      inflationRate: values.inflationRatePercent / 100,
      returns: {
        traditional401k: values.returnTraditionalPercent / 100,
        roth: values.returnRothPercent / 100,
        brokerage: values.returnBrokeragePercent / 100,
      },
      dividendYieldOnBrokerage: values.dividendYieldPercent / 100,
      taxYear: values.taxYear,
    },
  }
}
