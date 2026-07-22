import type { PlanInputs, SimulationResult } from "@/lib/engine/types"
import type { WorkerRequest, WorkerResponse } from "@/workers/simulation.worker"

export const runSimulationInWorker = (
  inputs: PlanInputs
): Promise<SimulationResult> => {
  return new Promise((resolve, reject) => {
    if (typeof Worker === "undefined") {
      reject(new Error("Web Workers are not available in this environment"))
      return
    }

    const worker = new Worker(
      new URL("../workers/simulation.worker.ts", import.meta.url)
    )

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      worker.removeEventListener("message", handleMessage)
      worker.terminate()
      const data = event.data
      if (data.type === "success") {
        resolve(data.result)
        return
      }
      reject(new Error(data.message))
    }

    const handleError = (event: ErrorEvent) => {
      worker.removeEventListener("error", handleError)
      worker.terminate()
      reject(new Error(event.message || "Worker failed"))
    }

    worker.addEventListener("message", handleMessage)
    worker.addEventListener("error", handleError)

    const request: WorkerRequest = { type: "run", inputs }
    worker.postMessage(request)
  })
}
