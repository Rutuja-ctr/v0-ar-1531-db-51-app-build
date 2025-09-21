"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  VolumeXIcon,
  Volume2Icon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  AlertTriangleIcon,
  InfoIcon,
  ZapIcon,
  ThumbsUpIcon,
  ClockIcon,
} from "lucide-react"
import { ChemistryLabScene } from "@/components/chemistry-lab-scene"
import { VoiceNarrator } from "@/components/voice-narrator"
import { ObservationTable } from "@/components/observation-table"
import { ColorChangeDetector } from "@/components/color-change-detector"
import Link from "next/link"

interface VirtualLabInterfaceProps {
  experiment: {
    id: string
    title: string
    description: string
    equipment: string[]
    steps: Array<{
      id: number
      title: string
      instruction: string
      equipment: string
      action: string
    }>
  }
}

interface FeedbackMessage {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  timestamp: number
  duration?: number
}

interface StepValidation {
  isValid: boolean
  requiredEquipment: string[]
  completedActions: string[]
  errors: string[]
  warnings: string[]
}

export function VirtualLabInterface({ experiment }: VirtualLabInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [observations, setObservations] = useState<Array<{ step: number; observation: string; value?: string }>>([])
  const [testSolutionColor, setTestSolutionColor] = useState("transparent")
  const [standardSolutionColor, setStandardSolutionColor] = useState("transparent")
  const [chemicalAdded, setChemicalAdded] = useState<string[]>([])
  const [isInstructionsPanelOpen, setIsInstructionsPanelOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)

  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([])
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isValid: false,
    requiredEquipment: [],
    completedActions: [],
    errors: [],
    warnings: [],
  })
  const [isStepInProgress, setIsStepInProgress] = useState(false)
  const [stepTimer, setStepTimer] = useState(0)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [colorAnalysisResult, setColorAnalysisResult] = useState<any>(null)
  const [showColorDetector, setShowColorDetector] = useState(false)

  const progress = (completedSteps.length / experiment.steps.length) * 100

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStepInProgress) {
      interval = setInterval(() => {
        setStepTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStepInProgress])

  useEffect(() => {
    validateCurrentStep()
  }, [currentStep, completedSteps, chemicalAdded])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setFeedbackMessages((prev) => prev.filter((msg) => Date.now() - msg.timestamp < (msg.duration || 5000)))
    }, 1000)
    return () => clearInterval(cleanup)
  }, [])

  const validateCurrentStep = () => {
    const step = experiment.steps[currentStep]
    if (!step) return

    const validation: StepValidation = {
      isValid: false,
      requiredEquipment: [step.equipment],
      completedActions: [],
      errors: [],
      warnings: [],
    }

    // Check if previous steps are completed
    if (currentStep > 0 && !completedSteps.includes(experiment.steps[currentStep - 1].id)) {
      validation.errors.push("Complete previous step first")
    }

    // Check equipment availability
    if (!experiment.equipment.includes(step.equipment)) {
      validation.errors.push(`Required equipment not available: ${step.equipment}`)
    }

    // Check chemical requirements
    if (step.action === "add" && step.equipment === "agno3-beaker" && !chemicalAdded.includes("AgNO3")) {
      validation.warnings.push("AgNO3 solution ready to be added")
    }

    validation.isValid = validation.errors.length === 0
    setStepValidation(validation)
  }

  const addFeedbackMessage = (type: FeedbackMessage["type"], message: string, duration = 5000) => {
    const newMessage: FeedbackMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      duration,
    }
    setFeedbackMessages((prev) => [...prev, newMessage])
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY

    if (diff > 50 && !isInstructionsPanelOpen) {
      setIsInstructionsPanelOpen(true)
    } else if (diff < -50 && isInstructionsPanelOpen) {
      setIsInstructionsPanelOpen(false)
    }
  }

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
      setIsStepInProgress(false)
      setShowSuccessAnimation(true)

      addFeedbackMessage("success", `Step ${stepId} completed successfully!`, 3000)

      const step = experiment.steps.find((s) => s.id === stepId)
      if (step) {
        const newObservation = {
          step: stepId,
          observation: getObservationForStep(step),
          value: getValueForStep(step),
        }
        setObservations([...observations, newObservation])
      }

      // Reset timer and hide animation
      setStepTimer(0)
      setTimeout(() => setShowSuccessAnimation(false), 2000)
    }
  }

  const handleStepStart = () => {
    if (!stepValidation.isValid) {
      addFeedbackMessage("error", "Cannot start step: " + stepValidation.errors.join(", "))
      return
    }

    setIsStepInProgress(true)
    setStepTimer(0)
    addFeedbackMessage("info", `Starting: ${experiment.steps[currentStep]?.title}`)
  }

  const handleEquipmentInteraction = (equipment: string) => {
    const currentStepData = experiment.steps[currentStep]

    if (currentStepData?.equipment !== equipment) {
      addFeedbackMessage("warning", `Wrong equipment! Use ${currentStepData?.equipment} for this step.`)
      return
    }

    if (!isStepInProgress) {
      addFeedbackMessage("info", "Click 'Start Step' to begin this procedure.")
      return
    }

    addFeedbackMessage("success", `Using ${equipment} correctly!`)
  }

  const getObservationForStep = (step: any) => {
    const observations: { [key: string]: string } = {
      "Prepare Test Solution": "5ml sample solution prepared in test tube",
      "Prepare Standard Solution": "Standard chloride solution (200 ppm) prepared",
      "Add Silver Nitrate": "AgNO3 solution added dropwise to both solutions",
      "Mix Solutions": "Solutions mixed thoroughly by gentle swirling",
      "Compare Turbidity": "Visual comparison of turbidity levels completed",
    }
    return observations[step.title] || "Step completed successfully"
  }

  const getValueForStep = (step: any) => {
    const values: { [key: string]: string } = {
      "Prepare Test Solution": "Volume: 5.0ml",
      "Prepare Standard Solution": "Concentration: 200 ppm Cl⁻",
      "Add Silver Nitrate": "AgNO3 added: 1.0ml",
      "Compare Turbidity": "Result: Pass/Fail based on visual comparison",
    }
    return values[step.title]
  }

  const nextStep = () => {
    if (currentStep < experiment.steps.length - 1) {
      if (isStepInProgress) {
        addFeedbackMessage("warning", "Complete current step before proceeding.")
        return
      }
      setCurrentStep(currentStep + 1)
      addFeedbackMessage("info", `Moved to step ${currentStep + 2}`)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      if (isStepInProgress) {
        addFeedbackMessage("warning", "Complete current step before going back.")
        return
      }
      setCurrentStep(currentStep - 1)
      addFeedbackMessage("info", `Moved to step ${currentStep}`)
    }
  }

  const resetExperiment = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setObservations([])
    setIsPlaying(false)
    setTestSolutionColor("transparent")
    setStandardSolutionColor("transparent")
    setChemicalAdded([])
    setIsStepInProgress(false)
    setStepTimer(0)
    setFeedbackMessages([])
    setColorAnalysisResult(null)
    setShowColorDetector(false)
    addFeedbackMessage("info", "Experiment reset successfully")
  }

  const getFeedbackIcon = (type: FeedbackMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-4 h-4" />
      case "error":
        return <AlertTriangleIcon className="w-4 h-4" />
      case "warning":
        return <AlertCircleIcon className="w-4 h-4" />
      case "info":
        return <InfoIcon className="w-4 h-4" />
    }
  }

  const getFeedbackColor = (type: FeedbackMessage["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/50 text-green-300"
      case "error":
        return "bg-red-500/20 border-red-500/50 text-red-300"
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
      case "info":
        return "bg-blue-500/20 border-blue-500/50 text-blue-300"
    }
  }

  const handleColorAnalysisComplete = (result: any) => {
    setColorAnalysisResult(result)
    addFeedbackMessage(
      result.comparison.result === "PASS" ? "success" : "warning",
      `Analysis complete: ${result.comparison.result} - ${result.comparison.confidence.toFixed(0)}% confidence`,
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {feedbackMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right-5 ${getFeedbackColor(msg.type)}`}
          >
            <div className="flex items-center gap-2">
              {getFeedbackIcon(msg.type)}
              <span className="text-sm font-medium">{msg.message}</span>
            </div>
          </div>
        ))}
      </div>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-8 animate-in zoom-in-50">
            <ThumbsUpIcon className="w-16 h-16 text-green-400 animate-bounce" />
          </div>
        </div>
      )}

      <header className="glass-card border-0 border-b border-glass-border">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href={`/experiment/${experiment.id}`}>
                <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm sm:text-lg text-white truncate">{experiment.title}</h1>
                <p className="text-xs text-gray-300 hidden lg:block truncate">{experiment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-1"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              >
                {isSidePanelOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
              </Button>
              <div className="flex items-center gap-1">
                {stepValidation.isValid ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                )}
                {isStepInProgress && (
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <ClockIcon className="w-3 h-3" />
                    {Math.floor(stepTimer / 60)}:{(stepTimer % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1}/{experiment.steps.length}
              </Badge>
              <Progress value={progress} className="w-16 sm:w-20 md:w-32" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div
          className="flex-1 relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ChemistryLabScene
            experiment={experiment}
            currentStep={currentStep}
            onStepComplete={handleStepComplete}
            completedSteps={completedSteps}
            testSolutionColor={testSolutionColor}
            standardSolutionColor={standardSolutionColor}
            onChemicalAdd={(chemical) => {
              setChemicalAdded([...chemicalAdded, chemical])
              if (chemical === "AgNO3") {
                setTestSolutionColor("rgba(255, 255, 255, 0.3)")
                setStandardSolutionColor("rgba(255, 255, 255, 0.6)")
                addFeedbackMessage("success", "AgNO3 added successfully - observe color changes!")
              }
            }}
          />

          <div className="absolute top-2 right-2 lg:hidden">
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white/10 backdrop-blur-sm p-2 w-10 h-10"
              >
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetExperiment}
                className="bg-white/10 backdrop-blur-sm p-2 w-10 h-10"
              >
                <RotateCcwIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="bg-white/10 backdrop-blur-sm p-2 w-10 h-10"
              >
                {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 lg:hidden transition-transform duration-300 ${
              isInstructionsPanelOpen ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
            }`}
          >
            <Card className="glass-card rounded-t-xl rounded-b-none">
              <CardContent className="p-3">
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => setIsInstructionsPanelOpen(!isInstructionsPanelOpen)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gray-400 rounded-full mx-auto" />
                    <span className="text-sm font-medium text-white">
                      Step {currentStep + 1}: {experiment.steps[currentStep]?.title}
                    </span>
                    {isStepInProgress && <ZapIcon className="w-4 h-4 text-blue-400 animate-pulse" />}
                    {completedSteps.includes(experiment.steps[currentStep]?.id) && (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {isInstructionsPanelOpen ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {isInstructionsPanelOpen && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isStepInProgress && !completedSteps.includes(experiment.steps[currentStep]?.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStepStart}
                            disabled={!stepValidation.isValid}
                            className="bg-green-500/20 border-green-500/50 text-green-300 text-xs px-2"
                          >
                            Start Step
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="bg-white/10 p-2"
                        >
                          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetExperiment} className="bg-white/10 p-2">
                          <RotateCcwIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                          className="bg-white/10 p-2"
                        >
                          {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevStep}
                          disabled={currentStep === 0 || isStepInProgress}
                          className="text-xs bg-transparent px-2"
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextStep}
                          disabled={currentStep === experiment.steps.length - 1 || isStepInProgress}
                          className="text-xs bg-transparent px-2"
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full lab-gradient flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {currentStep + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-2 text-sm">
                            {experiment.steps[currentStep]?.title}
                          </h3>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {experiment.steps[currentStep]?.instruction}
                          </p>

                          {stepValidation.errors.length > 0 && (
                            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-300">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertTriangleIcon className="w-3 h-3" />
                                <span className="font-medium">Issues:</span>
                              </div>
                              {stepValidation.errors.map((error, i) => (
                                <div key={i}>• {error}</div>
                              ))}
                            </div>
                          )}

                          {stepValidation.warnings.length > 0 && (
                            <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertCircleIcon className="w-3 h-3" />
                                <span className="font-medium">Notes:</span>
                              </div>
                              {stepValidation.warnings.map((warning, i) => (
                                <div key={i}>• {warning}</div>
                              ))}
                            </div>
                          )}

                          {completedSteps.includes(experiment.steps[currentStep]?.id) && (
                            <div className="flex items-center gap-2 mt-2 text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span className="text-xs">Step completed!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="absolute bottom-2 left-2 right-2 lg:bottom-6 lg:left-6 lg:right-6 hidden lg:block">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white/10 p-2"
                    >
                      {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetExperiment} className="bg-white/10 p-2">
                      <RotateCcwIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-white/10 p-2"
                    >
                      {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      disabled={currentStep === 0 || isStepInProgress}
                      className="text-sm bg-transparent"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextStep}
                      disabled={currentStep === experiment.steps.length - 1 || isStepInProgress}
                      className="text-sm bg-transparent"
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full lab-gradient flex items-center justify-center text-white font-bold text-sm">
                      {currentStep + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2 text-base">
                        {experiment.steps[currentStep]?.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {experiment.steps[currentStep]?.instruction}
                      </p>
                      {completedSteps.includes(experiment.steps[currentStep]?.id) && (
                        <div className="flex items-center gap-2 mt-2 text-green-400">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span className="text-sm">Step completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`
          ${isSidePanelOpen ? "fixed inset-0 z-50 lg:relative lg:inset-auto" : "hidden lg:block"}
          w-full lg:w-80 bg-background/95 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-border
          ${isSidePanelOpen ? "lg:relative" : ""}
        `}
        >
          {isSidePanelOpen && (
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setIsSidePanelOpen(false)} />
          )}

          <div
            className={`
            ${isSidePanelOpen ? "absolute right-0 top-0 bottom-0 w-80 lg:relative lg:w-full" : ""}
            bg-background/95 backdrop-blur-sm overflow-y-auto h-full
          `}
          >
            <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
              {isSidePanelOpen && (
                <div className="flex justify-between items-center lg:hidden">
                  <h2 className="text-lg font-semibold text-white">Lab Data</h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsSidePanelOpen(false)} className="p-1">
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
              )}

              <VoiceNarrator currentStep={experiment.steps[currentStep]} isPlaying={isPlaying && !isMuted} />

              <ObservationTable observations={observations} />

              <ColorChangeDetector
                testSolutionColor={testSolutionColor}
                standardSolutionColor={standardSolutionColor}
                onAnalysisComplete={handleColorAnalysisComplete}
                isVisible={showColorDetector}
              />

              {completedSteps.length >= 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Solution Comparison
                      {colorAnalysisResult && (
                        <Badge
                          className={`text-xs ${
                            colorAnalysisResult.comparison.result === "PASS"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {colorAnalysisResult.comparison.result}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20 mx-auto border-2 border-gray-300 rounded-lg bg-gradient-to-b from-transparent to-gray-100 relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                            style={{
                              height: "80%",
                              backgroundColor: testSolutionColor,
                              backdropFilter: "blur(1px)",
                            }}
                          />
                          {colorAnalysisResult && (
                            <div className="absolute top-1 left-1 right-1">
                              <div className="text-xs text-gray-600 bg-white/80 rounded px-1">
                                {colorAnalysisResult.testAnalysis.turbidity.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs mt-2 text-gray-300">Test Solution</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-16 sm:w-16 sm:h-20 mx-auto border-2 border-gray-300 rounded-lg bg-gradient-to-b from-transparent to-gray-100 relative overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                            style={{
                              height: "80%",
                              backgroundColor: standardSolutionColor,
                              backdropFilter: "blur(1px)",
                            }}
                          />
                          {colorAnalysisResult && (
                            <div className="absolute top-1 left-1 right-1">
                              <div className="text-xs text-gray-600 bg-white/80 rounded px-1">
                                {colorAnalysisResult.standardAnalysis.turbidity.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs mt-2 text-gray-300">Standard Solution</p>
                      </div>
                    </div>
                    {completedSteps.length >= 5 && (
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-sm font-medium text-white">
                          {colorAnalysisResult
                            ? colorAnalysisResult.comparison.result
                            : testSolutionColor === standardSolutionColor
                              ? "PASS"
                              : testSolutionColor < standardSolutionColor
                                ? "PASS"
                                : "FAIL"}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {colorAnalysisResult
                            ? `Turbidity difference: ${colorAnalysisResult.comparison.turbidityDifference.toFixed(1)}% (${colorAnalysisResult.comparison.confidence.toFixed(0)}% confidence)`
                            : `Chloride content is ${testSolutionColor < standardSolutionColor ? "within" : "above"} acceptable limits`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Safety Reminder</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Handle AgNO3 with care. Avoid skin contact and ensure proper ventilation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
