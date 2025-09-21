"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  EyeIcon,
  ScanIcon,
  CompassIcon as CompareIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  BarChart3Icon,
} from "lucide-react"

interface ColorAnalysis {
  rgb: { r: number; g: number; b: number }
  turbidity: number
  opacity: number
  classification: "clear" | "slight" | "moderate" | "heavy"
  score: number
}

interface ColorChangeDetectorProps {
  testSolutionColor: string
  standardSolutionColor: string
  onAnalysisComplete: (result: ComparisonResult) => void
  isVisible: boolean
}

interface ComparisonResult {
  testAnalysis: ColorAnalysis
  standardAnalysis: ColorAnalysis
  comparison: {
    turbidityDifference: number
    result: "PASS" | "FAIL"
    confidence: number
    recommendation: string
  }
  timestamp: string
}

export function ColorChangeDetector({
  testSolutionColor,
  standardSolutionColor,
  onAnalysisComplete,
  isVisible,
}: ColorChangeDetectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentResult, setCurrentResult] = useState<ComparisonResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<ComparisonResult[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    if (hex === "transparent" || !hex) return { r: 0, g: 0, b: 0 }

    // Handle rgba format
    if (hex.startsWith("rgba")) {
      const match = hex.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
      if (match) {
        return {
          r: Number.parseInt(match[1]),
          g: Number.parseInt(match[2]),
          b: Number.parseInt(match[3]),
        }
      }
    }

    // Handle hex format
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 }
  }

  const calculateTurbidity = (rgb: { r: number; g: number; b: number }, opacity: number): number => {
    // Calculate turbidity based on color intensity and opacity
    const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255
    const turbidityFromColor = 1 - brightness
    const turbidityFromOpacity = opacity

    // Combine both factors
    return Math.min(100, (turbidityFromColor * 0.6 + turbidityFromOpacity * 0.4) * 100)
  }

  const classifyTurbidity = (turbidity: number): ColorAnalysis["classification"] => {
    if (turbidity < 10) return "clear"
    if (turbidity < 30) return "slight"
    if (turbidity < 60) return "moderate"
    return "heavy"
  }

  const getOpacityFromColor = (color: string): number => {
    if (color === "transparent") return 0

    // Extract opacity from rgba
    if (color.startsWith("rgba")) {
      const match = color.match(/rgba?$$[^,]+,[^,]+,[^,]+,\s*([\d.]+)$$/)
      if (match) return Number.parseFloat(match[1])
    }

    return 1 // Default opacity for solid colors
  }

  const analyzeColor = (color: string): ColorAnalysis => {
    const rgb = hexToRgb(color)
    const opacity = getOpacityFromColor(color)
    const turbidity = calculateTurbidity(rgb, opacity)
    const classification = classifyTurbidity(turbidity)

    // Calculate a score based on multiple factors
    const score = Math.round(
      turbidity * 0.4 + opacity * 30 * 0.3 + ((255 - (rgb.r + rgb.g + rgb.b) / 3) / 255) * 30 * 0.3,
    )

    return {
      rgb,
      turbidity,
      opacity,
      classification,
      score,
    }
  }

  const performAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis steps with progress
    const steps = [
      { message: "Capturing solution images...", duration: 800 },
      { message: "Analyzing color properties...", duration: 1000 },
      { message: "Measuring turbidity levels...", duration: 1200 },
      { message: "Comparing with standard...", duration: 800 },
      { message: "Generating results...", duration: 600 },
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
      setAnalysisProgress(((i + 1) / steps.length) * 100)
    }

    // Perform actual analysis
    const testAnalysis = analyzeColor(testSolutionColor)
    const standardAnalysis = analyzeColor(standardSolutionColor)

    const turbidityDifference = Math.abs(testAnalysis.turbidity - standardAnalysis.turbidity)
    const result: "PASS" | "FAIL" = turbidityDifference <= 15 ? "PASS" : "FAIL"
    const confidence = Math.max(60, 100 - turbidityDifference * 2)

    let recommendation = ""
    if (result === "PASS") {
      recommendation =
        "Chloride content is within acceptable limits. The test solution shows similar turbidity to the standard."
    } else {
      if (testAnalysis.turbidity > standardAnalysis.turbidity) {
        recommendation =
          "Chloride content exceeds acceptable limits. Consider diluting the sample or investigating the source."
      } else {
        recommendation = "Unusual result: Test solution shows less turbidity than standard. Verify sample preparation."
      }
    }

    const comparisonResult: ComparisonResult = {
      testAnalysis,
      standardAnalysis,
      comparison: {
        turbidityDifference,
        result,
        confidence,
        recommendation,
      },
      timestamp: new Date().toISOString(),
    }

    setCurrentResult(comparisonResult)
    setAnalysisHistory((prev) => [comparisonResult, ...prev.slice(0, 4)]) // Keep last 5 results
    setIsAnalyzing(false)
    setAnalysisProgress(0)

    onAnalysisComplete(comparisonResult)
  }

  const getTurbidityColor = (turbidity: number): string => {
    if (turbidity < 10) return "text-green-500"
    if (turbidity < 30) return "text-yellow-500"
    if (turbidity < 60) return "text-orange-500"
    return "text-red-500"
  }

  const getClassificationBadge = (classification: ColorAnalysis["classification"]) => {
    const variants = {
      clear: "bg-green-500/20 text-green-300 border-green-500/50",
      slight: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      moderate: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      heavy: "bg-red-500/20 text-red-300 border-red-500/50",
    }

    return <Badge className={`${variants[classification]} border text-xs`}>{classification.toUpperCase()}</Badge>
  }

  if (!isVisible) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ScanIcon className="w-4 h-4" />
          Color Change Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Controls */}
        <div className="flex items-center justify-between">
          <Button
            onClick={performAnalysis}
            disabled={isAnalyzing || testSolutionColor === "transparent" || standardSolutionColor === "transparent"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                Analyze Colors
              </>
            )}
          </Button>

          {currentResult && (
            <Badge
              className={`${currentResult.comparison.result === "PASS" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
            >
              {currentResult.comparison.result}
            </Badge>
          )}
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-xs text-gray-400 text-center">
              {analysisProgress < 20 && "Capturing solution images..."}
              {analysisProgress >= 20 && analysisProgress < 40 && "Analyzing color properties..."}
              {analysisProgress >= 40 && analysisProgress < 70 && "Measuring turbidity levels..."}
              {analysisProgress >= 70 && analysisProgress < 90 && "Comparing with standard..."}
              {analysisProgress >= 90 && "Generating results..."}
            </p>
          </div>
        )}

        {/* Current Analysis Results */}
        {currentResult && !isAnalyzing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Test Solution Analysis */}
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Test Solution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Turbidity:</span>
                    <span className={`text-xs font-medium ${getTurbidityColor(currentResult.testAnalysis.turbidity)}`}>
                      {currentResult.testAnalysis.turbidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Classification:</span>
                    {getClassificationBadge(currentResult.testAnalysis.classification)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Score:</span>
                    <span className="text-xs font-medium text-white">{currentResult.testAnalysis.score}/100</span>
                  </div>
                </div>
              </div>

              {/* Standard Solution Analysis */}
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Standard Solution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Turbidity:</span>
                    <span
                      className={`text-xs font-medium ${getTurbidityColor(currentResult.standardAnalysis.turbidity)}`}
                    >
                      {currentResult.standardAnalysis.turbidity.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Classification:</span>
                    {getClassificationBadge(currentResult.standardAnalysis.classification)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Score:</span>
                    <span className="text-xs font-medium text-white">{currentResult.standardAnalysis.score}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CompareIcon className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-medium text-gray-300">Comparison Analysis</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Turbidity Difference:</span>
                  <span className="text-xs font-medium text-white">
                    {currentResult.comparison.turbidityDifference.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Confidence:</span>
                  <span className="text-xs font-medium text-blue-300">
                    {currentResult.comparison.confidence.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Result:</span>
                  <div className="flex items-center gap-1">
                    {currentResult.comparison.result === "PASS" ? (
                      <CheckCircleIcon className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertTriangleIcon className="w-3 h-3 text-red-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        currentResult.comparison.result === "PASS" ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {currentResult.comparison.result}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <h4 className="text-xs font-medium text-blue-300 mb-1">Recommendation</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{currentResult.comparison.recommendation}</p>
            </div>
          </div>
        )}

        {/* Analysis History */}
        {analysisHistory.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3Icon className="w-4 h-4 text-gray-400" />
              <h4 className="text-xs font-medium text-gray-300">Recent Analyses</h4>
            </div>
            <div className="space-y-1">
              {analysisHistory.slice(1, 4).map((result, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                  <span className="text-xs text-gray-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">Δ{result.comparison.turbidityDifference.toFixed(1)}%</span>
                    <Badge
                      className={`text-xs ${
                        result.comparison.result === "PASS"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {result.comparison.result}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden canvas for color analysis */}
        <canvas ref={canvasRef} className="hidden" width={100} height={100} />
      </CardContent>
    </Card>
  )
}
