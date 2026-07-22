"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SimulationResult } from "@/lib/engine/types"
import {
  defaultPlanFormValues,
  type PlanFormValues,
} from "@/lib/schema"

type SimulatorStore = {
  formValues: PlanFormValues
  result: SimulationResult | null
  isRunning: boolean
  error: string | null
  setFormValues: (values: PlanFormValues) => void
  setResult: (result: SimulationResult | null) => void
  setIsRunning: (isRunning: boolean) => void
  setError: (error: string | null) => void
  resetForm: () => void
}

export const useSimulatorStore = create<SimulatorStore>()(
  persist(
    (set) => ({
      formValues: defaultPlanFormValues,
      result: null,
      isRunning: false,
      error: null,
      setFormValues: (values) => set({ formValues: values }),
      setResult: (result) => set({ result }),
      setIsRunning: (isRunning) => set({ isRunning }),
      setError: (error) => set({ error }),
      resetForm: () =>
        set({
          formValues: defaultPlanFormValues,
          result: null,
          error: null,
        }),
    }),
    {
      name: "deccum-simulator",
      partialize: (state) => ({
        formValues: state.formValues,
        result: state.result,
      }),
    }
  )
)
