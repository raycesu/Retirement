import { z } from "zod"

const nonNeg = z.number().min(0)

export const planFormSchema = z
  .object({
    traditional401k: nonNeg,
    rothContributions: nonNeg,
    rothEarnings: nonNeg,
    brokerageBalance: nonNeg,
    brokerageBasis: nonNeg,
    pensionAnnual: nonNeg,
    socialSecurityAnnual: nonNeg,
    socialSecurityStartAge: z.number().min(60).max(70),
    currentAge: z.number().min(18).max(100),
    birthYear: z.number().min(1920).max(2010),
    filingStatus: z.enum(["single", "mfj"]),
    planEndAge: z.number().min(50).max(110),
    ruleOf55Applies: z.boolean(),
    rothFiveYearMet: z.boolean(),
    stateTaxRatePercent: z.number().min(0).max(15),
    householdSizeForACA: z.number().min(1).max(12),
    estimatedBenchmarkPremiumAnnual: nonNeg,
    onACAUntilMedicare: z.boolean(),
    useHardAcaCliff: z.boolean(),
    inflationRatePercent: z.number().min(0).max(10),
    returnTraditionalPercent: z.number().min(-20).max(20),
    returnRothPercent: z.number().min(-20).max(20),
    returnBrokeragePercent: z.number().min(-20).max(20),
    dividendYieldPercent: z.number().min(0).max(10),
    taxYear: z.number().min(2024).max(2035),
  })
  .superRefine((values, ctx) => {
    if (values.brokerageBasis > values.brokerageBalance) {
      ctx.addIssue({
        code: "custom",
        path: ["brokerageBasis"],
        message: "Cost basis cannot exceed brokerage balance",
      })
    }
    if (values.planEndAge <= values.currentAge) {
      ctx.addIssue({
        code: "custom",
        path: ["planEndAge"],
        message: "Plan end age must be greater than current age",
      })
    }
  })

export type PlanFormValues = z.infer<typeof planFormSchema>

export const defaultPlanFormValues: PlanFormValues = {
  traditional401k: 450_000,
  rothContributions: 80_000,
  rothEarnings: 40_000,
  brokerageBalance: 200_000,
  brokerageBasis: 140_000,
  pensionAnnual: 12_000,
  socialSecurityAnnual: 24_000,
  socialSecurityStartAge: 67,
  currentAge: 52,
  birthYear: 1974,
  filingStatus: "single",
  planEndAge: 95,
  ruleOf55Applies: true,
  rothFiveYearMet: true,
  stateTaxRatePercent: 5,
  householdSizeForACA: 1,
  estimatedBenchmarkPremiumAnnual: 7_200,
  onACAUntilMedicare: true,
  useHardAcaCliff: true,
  inflationRatePercent: 2.5,
  returnTraditionalPercent: 5,
  returnRothPercent: 5,
  returnBrokeragePercent: 6,
  dividendYieldPercent: 1.5,
  taxYear: 2026,
}
