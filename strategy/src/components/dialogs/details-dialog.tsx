"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Plus, X } from "lucide-react"
import { tradingPairs, runIntervalOptions } from "../block-types"

export interface StrategyDetailsData {
  strategyName: string
  selectedPairs: string[]
  runIntervalMinutes: number
  maximumExecuteCount: number
  intervalBetweenExecutionsMinutes: number
  maximumOpenPositions: number
}

interface DetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Initial values to populate the dialog when opened */
  initialData: StrategyDetailsData
  /** Callback when user confirms changes */
  onSave: (data: StrategyDetailsData) => void
}

export function DetailsDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: DetailsDialogProps) {
  // Internal state for the dialog form
  const [tempStrategyName, setTempStrategyName] = useState(initialData.strategyName)
  const [tempSelectedPairs, setTempSelectedPairs] = useState<string[]>(initialData.selectedPairs)
  const [tempRunIntervalMinutes, setTempRunIntervalMinutes] = useState(initialData.runIntervalMinutes)
  const [tempMaximumExecuteCount, setTempMaximumExecuteCount] = useState(initialData.maximumExecuteCount)
  const [tempIntervalBetweenExecutionsMinutes, setTempIntervalBetweenExecutionsMinutes] = useState(initialData.intervalBetweenExecutionsMinutes)
  const [tempMaximumOpenPositions, setTempMaximumOpenPositions] = useState(initialData.maximumOpenPositions)
  const [pairPopoverOpen, setPairPopoverOpen] = useState(false)

  // Sync internal state when dialog opens with new initial data
  useEffect(() => {
    if (open) {
      setTempStrategyName(initialData.strategyName)
      setTempSelectedPairs([...initialData.selectedPairs])
      setTempRunIntervalMinutes(initialData.runIntervalMinutes)
      setTempMaximumExecuteCount(initialData.maximumExecuteCount)
      setTempIntervalBetweenExecutionsMinutes(initialData.intervalBetweenExecutionsMinutes)
      setTempMaximumOpenPositions(initialData.maximumOpenPositions)
    }
  }, [open, initialData])

  const handleAddPair = (pair: string) => {
    if (!tempSelectedPairs.includes(pair)) {
      setTempSelectedPairs((prev) => [...prev, pair])
    }
    setPairPopoverOpen(false)
  }

  const handleRemovePair = (pair: string) => {
    setTempSelectedPairs((prev) => prev.filter((p) => p !== pair))
  }

  const handleDone = () => {
    onSave({
      strategyName: tempStrategyName,
      selectedPairs: tempSelectedPairs,
      runIntervalMinutes: tempRunIntervalMinutes,
      maximumExecuteCount: tempMaximumExecuteCount,
      intervalBetweenExecutionsMinutes: tempIntervalBetweenExecutionsMinutes,
      maximumOpenPositions: tempMaximumOpenPositions,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Strategy Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy-name">Strategy Name</Label>
            <Input
              id="strategy-name"
              value={tempStrategyName}
              onChange={(e) => setTempStrategyName(e.target.value)}
              placeholder="Enter strategy name"
            />
          </div>
          <div className="space-y-2">
            <Label>Trading Pairs</Label>
            {tempSelectedPairs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tempSelectedPairs.map((pair) => (
                  <div
                    key={pair}
                    className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-primary/10 text-primary"
                  >
                    <span>{pair}</span>
                    <button
                      onClick={() => handleRemovePair(pair)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Popover open={pairPopoverOpen} onOpenChange={setPairPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Trading Pair
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="flex flex-col gap-1 max-h-60 overflow-auto">
                  {tradingPairs
                    .filter((pair) => !tempSelectedPairs.includes(pair))
                    .map((pair) => (
                      <button
                        key={pair}
                        onClick={() => handleAddPair(pair)}
                        className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        {pair}
                      </button>
                    ))}
                  {tradingPairs.filter((pair) => !tempSelectedPairs.includes(pair)).length === 0 && (
                    <p className="text-sm text-muted-foreground px-3 py-2">All pairs selected</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Execution Options */}
          <div className="border-t pt-4 mt-4">
            <Label className="text-sm font-medium mb-3 block">Execution Options</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="run-interval" className="text-xs text-muted-foreground">Check every</Label>
                <Select
                  value={String(tempRunIntervalMinutes)}
                  onValueChange={(value) => setTempRunIntervalMinutes(Number(value))}
                >
                  <SelectTrigger id="run-interval" className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {runIntervalOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-executions" className="text-xs text-muted-foreground">Maximum Executions</Label>
                <Input
                  id="max-executions"
                  type="number"
                  min={1}
                  value={tempMaximumExecuteCount}
                  onChange={(e) => setTempMaximumExecuteCount(Number(e.target.value) || 1)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interval-between" className="text-xs text-muted-foreground">Wait Between Executions</Label>
                <Select
                  value={String(tempIntervalBetweenExecutionsMinutes)}
                  onValueChange={(value) => setTempIntervalBetweenExecutionsMinutes(Number(value))}
                >
                  <SelectTrigger id="interval-between" className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {runIntervalOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max-positions" className="text-xs text-muted-foreground">Max Open Positions</Label>
                <Input
                  id="max-positions"
                  type="number"
                  min={1}
                  value={tempMaximumOpenPositions}
                  onChange={(e) => setTempMaximumOpenPositions(Number(e.target.value) || 1)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}