"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
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

const createNoopStorage = () => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
})

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
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? createNoopStorage() : localStorage
      ),
      partialize: (state) => ({
        formValues: state.formValues,
        result: state.result,
      }),
    }
  )
)
