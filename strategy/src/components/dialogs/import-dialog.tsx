"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { X } from "lucide-react"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  importJson: string
  setImportJson: (json: string) => void
  importError: string | null
  setImportError: (error: string | null) => void
  onImport: () => void
}

export function ImportDialog({
  open,
  onOpenChange,
  importJson,
  setImportJson,
  importError,
  setImportError,
  onImport,
}: ImportDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
    setImportJson("")
    setImportError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Import Strategy
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
          Paste a valid strategy JSON to import it into the builder.
        </p>
        <Textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='{"strategyId": "...", "strategyName": "...", "symbols": [...], "rules": [...]}'
          className="min-h-[300px] max-h-[450px] font-mono text-sm overflow-y-auto"
        />
        {importError && <p className="mt-2 text-sm text-destructive">{importError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="bg-transparent"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onImport}>
            Import Strategy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}