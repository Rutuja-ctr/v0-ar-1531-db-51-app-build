"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardListIcon, PlusIcon, DownloadIcon, EyeIcon } from "lucide-react"

interface Observation {
  step: number
  observation: string
  value?: string
  timestamp?: Date
  userNotes?: string
}

interface ObservationTableProps {
  observations: Observation[]
}

export function ObservationTable({ observations }: ObservationTableProps) {
  const [userNotes, setUserNotes] = useState<{ [key: number]: string }>({})
  const [customObservation, setCustomObservation] = useState("")
  const [customValue, setCustomValue] = useState("")

  const handleAddNote = (stepId: number, note: string) => {
    setUserNotes((prev) => ({
      ...prev,
      [stepId]: note,
    }))
  }

  const handleAddCustomObservation = () => {
    if (customObservation.trim()) {
      // This would typically update the parent component's observations
      console.log("Adding custom observation:", { observation: customObservation, value: customValue })
      setCustomObservation("")
      setCustomValue("")
    }
  }

  const exportObservations = () => {
    const data = observations.map((obs) => ({
      Step: obs.step,
      Observation: obs.observation,
      Value: obs.value || "N/A",
      "User Notes": userNotes[obs.step] || "None",
      Timestamp: new Date().toISOString(),
    }))

    const csvContent = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lab-observations.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ClipboardListIcon className="w-4 h-4" />
            Observations & Results
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {observations.length} entries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Observations List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {observations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <EyeIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No observations recorded yet</p>
              <p className="text-xs">Complete experiment steps to see results</p>
            </div>
          ) : (
            observations.map((obs, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Step {obs.step}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                </div>

                <div>
                  <p className="text-sm font-medium">{obs.observation}</p>
                  {obs.value && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Value:</strong> {obs.value}
                    </p>
                  )}
                </div>

                {/* User Notes */}
                <div>
                  <Textarea
                    placeholder="Add your notes for this observation..."
                    value={userNotes[obs.step] || ""}
                    onChange={(e) => handleAddNote(obs.step, e.target.value)}
                    className="text-xs min-h-[60px] resize-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Custom Observation */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground">Add Custom Observation</h4>

          <div className="space-y-2">
            <Input
              placeholder="Observation description..."
              value={customObservation}
              onChange={(e) => setCustomObservation(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Measured value (optional)..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCustomObservation}
              disabled={!customObservation.trim()}
              className="w-full bg-transparent"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Observation
            </Button>
          </div>
        </div>

        {/* Analysis Summary */}
        {observations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs font-medium text-green-800 mb-2">Quick Analysis</h4>
            <div className="space-y-1 text-xs text-green-700">
              <p>• Total observations: {observations.length}</p>
              <p>• Experiment progress: {Math.round((observations.length / 4) * 100)}%</p>
              {observations.some((obs) => obs.value) && (
                <p>• Quantitative data collected: {observations.filter((obs) => obs.value).length} measurements</p>
              )}
            </div>
          </div>
        )}

        {/* Export Options */}
        {observations.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportObservations} className="flex-1 bg-transparent">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}

        {/* Lab Report Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-800">Lab Report Tip</p>
              <p className="text-xs text-blue-700 mt-1">
                Use your observations and notes to complete the post-experiment quiz and generate your lab report.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
