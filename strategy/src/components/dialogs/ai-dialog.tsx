"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Sparkles, Loader2, X } from "lucide-react"
import { useAIBuilderStore } from "../../stores/ai-builder-store"
import { useMutation } from "@tanstack/react-query"

interface AIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supportedAIModels: string[]
  callAIFunction: (systemPrompt: string, userPrompts: string[], model: string) => Promise<string>
  onUseStrategy: () => void
}

interface GenerateStrategyParams {
  systemPrompt: string
  userPrompt: string
  model: string
}

export function AIDialog({
  open,
  onOpenChange,
  supportedAIModels,
  callAIFunction,
  onUseStrategy,
}: AIDialogProps) {
  const {
    selectedAIModel,
    setSelectedAIModel,
    aiPrompt,
    setAiPrompt,
    aiSystemPrompt,
    aiGeneratedJson,
    setAiGeneratedJson,
    reset,
  } = useAIBuilderStore()

  // Local error state for JSON parse errors
  const [parseError, setParseError] = useState<string | null>(null)

  // React Query mutation for AI strategy generation
  const generateMutation = useMutation({
    mutationFn: async ({ systemPrompt, userPrompt, model }: GenerateStrategyParams) => {
      return await callAIFunction(systemPrompt, [userPrompt], model)
    },
    onSuccess: (result) => {
      setAiGeneratedJson(result)
      setParseError(null)
    },
  })

  const handleClose = () => {
    onOpenChange(false)
    generateMutation.reset()
    setParseError(null)
    setAiGeneratedJson('')
  }

  const handleGenerateStrategy = () => {
    if (!aiPrompt.trim() || !selectedAIModel || !aiSystemPrompt) return
    setParseError(null)
    
    generateMutation.mutate({
      systemPrompt: aiSystemPrompt,
      userPrompt: aiPrompt,
      model: selectedAIModel,
    })
  }

  const handleUseStrategy = () => {
    try {
      onUseStrategy()
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Invalid JSON format. Please check the generated output.")
    }
  }

  const isLoading = generateMutation.isPending
  const error = generateMutation.error || parseError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto" 
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Strategy Builder
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Describe your trading strategy in natural language and let AI generate it for you.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {supportedAIModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Strategy Description</Label>
            <Textarea
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: Create a strategy that opens a long position when RSI crosses above 30 and the price is above the 50-day moving average. Close the position when RSI goes above 70."
              className="min-h-[120px]"
            />
          </div>

          <Button
            size="sm"
            onClick={handleGenerateStrategy}
            disabled={isLoading || !aiPrompt.trim() || !selectedAIModel}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Strategy
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive">
              {typeof error === 'string' ? error : (error instanceof Error ? error.message : "Failed to generate strategy")}
            </p>
          )}

          {aiGeneratedJson && (
            <div className="space-y-2">
              <Label>Generated Strategy JSON</Label>
              <Textarea
                value={aiGeneratedJson}
                onChange={(e) => setAiGeneratedJson(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUseStrategy}>
                  Use Strategy
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}