"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportResultsToPdf } from "@/lib/export-results-pdf"
import type { SimulationResult } from "@/lib/engine/types"
import type { PlanFormValues } from "@/lib/schema"

type ExportPdfButtonProps = {
  result: SimulationResult
  formValues: PlanFormValues
}

export const ExportPdfButton = ({
  result,
  formValues,
}: ExportPdfButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    setError(null)
    setIsExporting(true)

    try {
      exportResultsToPdf({ result, formValues })
    } catch {
      setError("Could not export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleExport}
        disabled={isExporting}
        aria-label="Export simulation results as PDF"
        className="border-border/80 bg-card/80 text-[#122820] hover:bg-muted/60"
      >
        <Download data-icon="inline-start" aria-hidden="true" />
        {isExporting ? "Exporting…" : "Export PDF"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
