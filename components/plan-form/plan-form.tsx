"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { mapFormToPlanInputs } from "@/lib/plan-mapper"
import { runSimulationInWorker } from "@/lib/run-simulation"
import {
  defaultPlanFormValues,
  planFormSchema,
  type PlanFormValues,
} from "@/lib/schema"
import { useSimulatorStore } from "@/lib/store"
import { findSustainableSpending } from "@/lib/engine/sustainable-spending"

type FieldProps = {
  id: keyof PlanFormValues
  label: string
  register: ReturnType<typeof useForm<PlanFormValues>>["register"]
  error?: string
  step?: string
}

const NumberField = ({ id, label, register, error, step = "1" }: FieldProps) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        aria-label={label}
        aria-invalid={Boolean(error)}
        className="font-[family-name:var(--font-plex-mono)]"
        {...register(id, { valueAsNumber: true })}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export const PlanForm = () => {
  const router = useRouter()
  const formValues = useSimulatorStore((state) => state.formValues)
  const isRunning = useSimulatorStore((state) => state.isRunning)
  const error = useSimulatorStore((state) => state.error)
  const setFormValues = useSimulatorStore((state) => state.setFormValues)
  const setResult = useSimulatorStore((state) => state.setResult)
  const setIsRunning = useSimulatorStore((state) => state.setIsRunning)
  const setError = useSimulatorStore((state) => state.setError)
  const resetForm = useSimulatorStore((state) => state.resetForm)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: formValues ?? defaultPlanFormValues,
    values: formValues,
  })

  const filingStatus = watch("filingStatus")
  const ruleOf55Applies = watch("ruleOf55Applies")
  const rothFiveYearMet = watch("rothFiveYearMet")
  const onACAUntilMedicare = watch("onACAUntilMedicare")
  const useHardAcaCliff = watch("useHardAcaCliff")

  const handleRun = handleSubmit(async (values) => {
    setFormValues(values)
    setIsRunning(true)
    setError(null)

    const inputs = mapFormToPlanInputs(values)

    try {
      let result
      try {
        result = await runSimulationInWorker(inputs)
      } catch {
        // Fallback for environments where the worker cannot load
        result = findSustainableSpending(inputs)
      }
      setResult(result)
      router.push("/results")
    } catch (runError) {
      setResult(null)
      setError(
        runError instanceof Error
          ? runError.message
          : "Simulation failed unexpectedly"
      )
    } finally {
      setIsRunning(false)
    }
  })

  return (
    <form
      onSubmit={handleRun}
      className="space-y-8 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur"
      aria-label="Retirement plan inputs"
    >
      <section className="space-y-4" aria-labelledby="accounts-heading">
        <div>
          <h2
            id="accounts-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#132A40]"
          >
            Account balances
          </h2>
          <p className="text-sm text-[#3C5A72]">
            Enter current balances. Roth and brokerage track basis separately for tax rules.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="traditional401k"
            label="Traditional 401(k) / IRA"
            register={register}
            error={errors.traditional401k?.message}
          />
          <NumberField
            id="rothContributions"
            label="Roth contributions (basis)"
            register={register}
            error={errors.rothContributions?.message}
          />
          <NumberField
            id="rothEarnings"
            label="Roth earnings"
            register={register}
            error={errors.rothEarnings?.message}
          />
          <NumberField
            id="brokerageBalance"
            label="Brokerage balance"
            register={register}
            error={errors.brokerageBalance?.message}
          />
          <NumberField
            id="brokerageBasis"
            label="Brokerage cost basis"
            register={register}
            error={errors.brokerageBasis?.message}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="person-heading">
        <div>
          <h2
            id="person-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#132A40]"
          >
            Person & filing
          </h2>
          <p className="text-sm text-[#3C5A72]">
            Age, filing status, and penalty / healthcare toggles that change the drawdown path.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="currentAge"
            label="Current age"
            register={register}
            error={errors.currentAge?.message}
          />
          <NumberField
            id="birthYear"
            label="Birth year"
            register={register}
            error={errors.birthYear?.message}
          />
          <NumberField
            id="planEndAge"
            label="Plan end age"
            register={register}
            error={errors.planEndAge?.message}
          />
          <div className="space-y-1.5">
            <Label htmlFor="filingStatus">Filing status</Label>
            <Select
              value={filingStatus}
              onValueChange={(value) =>
                setValue("filingStatus", value as PlanFormValues["filingStatus"])
              }
            >
              <SelectTrigger id="filingStatus" aria-label="Filing status">
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="mfj">Married filing jointly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <NumberField
            id="stateTaxRatePercent"
            label="State tax rate (%)"
            register={register}
            error={errors.stateTaxRatePercent?.message}
            step="0.1"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
            <Checkbox
              checked={ruleOf55Applies}
              onCheckedChange={(checked) =>
                setValue("ruleOf55Applies", Boolean(checked))
              }
              aria-label="Rule of 55 applies"
            />
            <span className="text-sm">
              <span className="font-medium">Rule of 55 applies</span>
              <span className="mt-0.5 block text-muted-foreground">
                Separated from the employer plan in/after the year you turned 55.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
            <Checkbox
              checked={rothFiveYearMet}
              onCheckedChange={(checked) =>
                setValue("rothFiveYearMet", Boolean(checked))
              }
              aria-label="Roth five-year rule met"
            />
            <span className="text-sm">
              <span className="font-medium">Roth 5-year rule met</span>
              <span className="mt-0.5 block text-muted-foreground">
                First Roth contribution was at least five tax years ago.
              </span>
            </span>
          </label>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="income-heading">
        <div>
          <h2
            id="income-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#132A40]"
          >
            Fixed income
          </h2>
          <p className="text-sm text-[#3C5A72]">
            Pension and Social Security reduce how much you need to withdraw.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="pensionAnnual"
            label="Pension (annual)"
            register={register}
            error={errors.pensionAnnual?.message}
          />
          <NumberField
            id="socialSecurityAnnual"
            label="Social Security (annual)"
            register={register}
            error={errors.socialSecurityAnnual?.message}
          />
          <NumberField
            id="socialSecurityStartAge"
            label="Social Security start age"
            register={register}
            error={errors.socialSecurityStartAge?.message}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="aca-heading">
        <div>
          <h2
            id="aca-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#B3813C]"
          >
            ACA & Medicare cliffs
          </h2>
          <p className="text-sm text-[#3C5A72]">
            Simplified MAGI thresholds using your estimated benchmark premium.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="householdSizeForACA"
            label="Household size"
            register={register}
            error={errors.householdSizeForACA?.message}
          />
          <NumberField
            id="estimatedBenchmarkPremiumAnnual"
            label="Benchmark Silver premium (annual)"
            register={register}
            error={errors.estimatedBenchmarkPremiumAnnual?.message}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
            <Checkbox
              checked={onACAUntilMedicare}
              onCheckedChange={(checked) =>
                setValue("onACAUntilMedicare", Boolean(checked))
              }
              aria-label="On ACA until Medicare"
            />
            <span className="text-sm">
              <span className="font-medium">On ACA until Medicare (65)</span>
              <span className="mt-0.5 block text-muted-foreground">
                Optimize MAGI around subsidy eligibility before age 65.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
            <Checkbox
              checked={useHardAcaCliff}
              onCheckedChange={(checked) =>
                setValue("useHardAcaCliff", Boolean(checked))
              }
              aria-label="Use hard ACA cliff at 400 percent FPL"
            />
            <span className="text-sm">
              <span className="font-medium">Hard 400% FPL cliff</span>
              <span className="mt-0.5 block text-muted-foreground">
                Treat subsidy as $0 above 400% of the federal poverty level.
              </span>
            </span>
          </label>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="assumptions-heading">
        <div>
          <h2
            id="assumptions-heading"
            className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#132A40]"
          >
            Assumptions
          </h2>
          <p className="text-sm text-[#3C5A72]">
            Deterministic returns and inflation used for the multi-decade projection.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="inflationRatePercent"
            label="Inflation (%)"
            register={register}
            error={errors.inflationRatePercent?.message}
            step="0.1"
          />
          <NumberField
            id="returnTraditionalPercent"
            label="Traditional return (%)"
            register={register}
            error={errors.returnTraditionalPercent?.message}
            step="0.1"
          />
          <NumberField
            id="returnRothPercent"
            label="Roth return (%)"
            register={register}
            error={errors.returnRothPercent?.message}
            step="0.1"
          />
          <NumberField
            id="returnBrokeragePercent"
            label="Brokerage return (%)"
            register={register}
            error={errors.returnBrokeragePercent?.message}
            step="0.1"
          />
          <NumberField
            id="dividendYieldPercent"
            label="Brokerage dividend yield (%)"
            register={register}
            error={errors.dividendYieldPercent?.message}
            step="0.1"
          />
          <NumberField
            id="taxYear"
            label="Tax year constants"
            register={register}
            error={errors.taxYear?.message}
          />
        </div>
      </section>

      {error ? (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="submit"
          disabled={isRunning}
          aria-label="Run withdrawal simulation"
          className="min-w-44"
        >
          {isRunning ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Optimizing…
            </>
          ) : (
            "Run simulation"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          aria-label="Reset form to defaults"
        >
          Reset defaults
        </Button>
      </div>
    </form>
  )
}
