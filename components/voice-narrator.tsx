"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2Icon, VolumeXIcon, PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react"

interface VoiceNarratorProps {
  currentStep:
    | {
        id: number
        title: string
        instruction: string
        equipment: string
        action: string
      }
    | undefined
  isPlaying: boolean
}

export function VoiceNarrator({ currentStep, isPlaying }: VoiceNarratorProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)

      // Prefer English voices, then any available voice
      const preferredVoice =
        voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Female")) ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        voices[0]

      setSelectedVoice(preferredVoice)
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  // Generate narration text based on step
  const generateNarrationText = (step: typeof currentStep) => {
    if (!step) return ""

    const safetyReminders: { [key: string]: string } = {
      "Setup Equipment": "Remember to wear safety goggles and handle all equipment carefully.",
      "Prepare Sample": "Use proper pipetting technique and never pipette by mouth.",
      "Add Indicator": "Add only a few drops of indicator to avoid affecting the results.",
      "Begin Titration": "Add the titrant slowly, especially near the endpoint.",
    }

    const detailedInstructions: { [key: string]: string } = {
      "Setup Equipment":
        "First, we'll set up our titration equipment. Make sure the burette is clean and properly clamped. Fill it with the standard sodium hydroxide solution and record the initial reading.",
      "Prepare Sample":
        "Now we'll prepare our sample. Use a pipette to carefully transfer exactly 25 milliliters of the unknown hydrochloric acid solution into a clean conical flask.",
      "Add Indicator":
        "Next, we'll add our pH indicator. Add 2 to 3 drops of phenolphthalein indicator to the acid solution. The solution should remain colorless at this point.",
      "Begin Titration":
        "Now we can begin the titration. Slowly open the burette tap to add sodium hydroxide drop by drop while swirling the flask. Watch carefully for the color change that indicates the endpoint.",
    }

    const instruction = detailedInstructions[step.title] || step.instruction
    const safety = safetyReminders[step.title] || ""

    return `Step ${step.id}: ${step.title}. ${instruction} ${safety}`
  }

  // Handle speech synthesis
  const speak = (text: string) => {
    if (!selectedVoice) return

    // Stop any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = speechRate
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  // Auto-play when step changes and isPlaying is true
  useEffect(() => {
    if (isPlaying && currentStep && !isSpeaking) {
      const text = generateNarrationText(currentStep)
      speak(text)
    } else if (!isPlaying && isSpeaking) {
      speechSynthesis.cancel()
    }
  }, [currentStep, isPlaying])

  const handlePlayPause = () => {
    if (isSpeaking && !isPaused) {
      speechSynthesis.pause()
      setIsPaused(true)
    } else if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
    } else if (currentStep) {
      const text = generateNarrationText(currentStep)
      speak(text)
    }
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  const handleReplay = () => {
    if (currentStep) {
      const text = generateNarrationText(currentStep)
      speak(text)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Volume2Icon className="w-4 h-4" />
          AI Voice Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isSpeaking ? "default" : "secondary"} className="text-xs">
              {isSpeaking ? (isPaused ? "Paused" : "Speaking") : "Ready"}
            </Badge>
            {isSpeaking && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-lab-primary animate-pulse rounded-full" />
                <div className="w-1 h-2 bg-lab-primary animate-pulse rounded-full" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 h-4 bg-lab-primary animate-pulse rounded-full" style={{ animationDelay: "0.2s" }} />
              </div>
            )}
          </div>
        </div>

        {/* Current Step Preview */}
        {currentStep && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Current Instruction:</p>
            <p className="text-sm leading-relaxed">{currentStep.instruction}</p>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            disabled={!currentStep}
            className="flex-1 bg-transparent"
          >
            {isSpeaking && !isPaused ? <PauseIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            {isSpeaking && !isPaused ? "Pause" : "Play"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleStop} disabled={!isSpeaking}>
            <VolumeXIcon className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleReplay} disabled={!currentStep}>
            <RotateCcwIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Settings */}
        <div className="space-y-3 pt-2 border-t">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Speech Rate</label>
            <div className="flex items-center gap-2">
              <span className="text-xs">Slow</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number.parseFloat(e.target.value))}
                className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs">Fast</span>
            </div>
          </div>

          {availableVoices.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Voice</label>
              <select
                value={selectedVoice?.name || ""}
                onChange={(e) => {
                  const voice = availableVoices.find((v) => v.name === e.target.value)
                  setSelectedVoice(voice || null)
                }}
                className="w-full text-xs bg-background border border-border rounded px-2 py-1"
              >
                {availableVoices
                  .filter((voice) => voice.lang.startsWith("en"))
                  .map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* AI Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-800">AI-Enhanced Guidance</p>
              <p className="text-xs text-blue-700 mt-1">
                Voice instructions include safety reminders and detailed explanations for each step.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
