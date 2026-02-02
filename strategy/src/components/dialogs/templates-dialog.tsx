"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { LayoutTemplate, X } from "lucide-react"
import { PredefinedStrategyTemplate } from "../../types"

interface TemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  predefinedStrategies: PredefinedStrategyTemplate[]
  onSelectTemplate: (template: PredefinedStrategyTemplate) => void
}

export function TemplatesDialog({
  open,
  onOpenChange,
  predefinedStrategies,
  onSelectTemplate,
}: TemplatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Strategy Templates
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Select a predefined strategy template to get started quickly.
        </p>
        {predefinedStrategies.length === 0 ? (
          <div className="py-12 text-center">
            <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No templates available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for predefined strategy templates.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {predefinedStrategies.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <h4 className="font-medium text-foreground">{template.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <div className="flex gap-2 mt-2">
                  {template.strategy.rules.slice(0, 3).map((rule: any, index: number) => (
                    <span key={index} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {rule.name}
                    </span>
                  ))}
                  {template.strategy.rules.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      +{template.strategy.rules.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}