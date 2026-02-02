"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Sparkles, Loader2, X } from "lucide-react"

interface AIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAIModel: string
  setSelectedAIModel: (model: string) => void
  supportedAIModels: string[]
  aiPrompt: string
  setAiPrompt: (prompt: string) => void
  aiIsLoading: boolean
  aiError: string | null
  setAiError: (error: string | null) => void
  aiGeneratedJson: string
  setAiGeneratedJson: (json: string) => void
  onGenerateStrategy: () => Promise<void>
  onUseStrategy: () => void
}

export function AIDialog({
  open,
  onOpenChange,
  selectedAIModel,
  setSelectedAIModel,
  supportedAIModels,
  aiPrompt,
  setAiPrompt,
  aiIsLoading,
  aiError,
  setAiError,
  aiGeneratedJson,
  setAiGeneratedJson,
  onGenerateStrategy,
  onUseStrategy,
}: AIDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
    setAiPrompt("")
    setAiGeneratedJson("")
    setAiError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            onClick={onGenerateStrategy}
            disabled={aiIsLoading || !aiPrompt.trim() || !selectedAIModel}
            className="w-full gap-2"
          >
            {aiIsLoading ? (
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

          {aiError && <p className="text-sm text-destructive">{aiError}</p>}

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
                <Button size="sm" onClick={onUseStrategy}>
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