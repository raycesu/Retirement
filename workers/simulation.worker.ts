import { findSustainableSpending } from "@/lib/engine/sustainable-spending"
import type { PlanInputs, SimulationResult } from "@/lib/engine/types"

export type WorkerRequest = {
  type: "run"
  inputs: PlanInputs
}

export type WorkerResponse =
  | { type: "success"; result: SimulationResult }
  | { type: "error"; message: string }

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const data = event.data
  if (!data || data.type !== "run") {
    return
  }

  try {
    const result = findSustainableSpending(data.inputs)
    const response: WorkerResponse = { type: "success", result }
    self.postMessage(response)
  } catch (error) {
    const response: WorkerResponse = {
      type: "error",
      message:
        error instanceof Error ? error.message : "Simulation failed unexpectedly",
    }
    self.postMessage(response)
  }
}

export {}
