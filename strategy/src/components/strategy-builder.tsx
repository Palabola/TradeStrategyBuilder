"use client"

import { useEffect, useId } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { DraggableBlock } from "./draggable-block"
import { RuleDropZone } from "./rule-drop-zone"
import {
  blockConfigs,
  tradingPairs,
  candleOptions as defaultCandleOptions,
  indicatorOptions as defaultIndicatorOptions,
  unitOptions as defaultUnitOptions,
  runIntervalOptions,
  STATIC_SYSTEM_PROMPT_V1,
  leverageOptions,
} from "./block-types"
import { Play, RotateCcw, Plus, Eye, X, Upload, LayoutTemplate, Sparkles, Loader2, Pencil } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { BlockConfig, BlockType, CustomTheme, StrategyBuilderProps } from "../types"
import { useStrategyState } from "../hooks/useStrategyState"
import { useStrategyActions } from "../hooks/useStrategyActions"

export function StrategyBuilder({
  initialStrategy,
  candleOptions = defaultCandleOptions,
  indicatorOptions = defaultIndicatorOptions,
  unitOptions = defaultUnitOptions,
  configOptions = blockConfigs,
  predefinedStrategies = [],
  onSave,
  onStrategyChange,
  themeOverride,
  supportedAIModels = ['grok'],
  callAIFunction,
}: StrategyBuilderProps) {
  // Use the custom state hook
  const state = useStrategyState({
    configOptions,
    candleOptions,
    indicatorOptions,
    unitOptions,
    initialStrategyId: initialStrategy?.strategyId,
    supportedAIModels,
  })

  // Use the custom actions hook
  const actions = useStrategyActions({
    customBlockConfigs: state.customBlockConfigs,
    strategyName: state.strategyName,
    selectedPairs: state.selectedPairs,
    ruleGroups: state.ruleGroups,
    currentStrategyId: state.currentStrategyId,
    runIntervalMinutes: state.runIntervalMinutes,
    maximumExecuteCount: state.maximumExecuteCount,
    intervalBetweenExecutionsMinutes: state.intervalBetweenExecutionsMinutes,
    maximumOpenPositions: state.maximumOpenPositions,
    importJson: state.importJson,
    mobileBlockPickerTarget: state.mobileBlockPickerTarget,
    tempStrategyName: state.tempStrategyName,
    tempSelectedPairs: state.tempSelectedPairs,
    tempRunIntervalMinutes: state.tempRunIntervalMinutes,
    tempMaximumExecuteCount: state.tempMaximumExecuteCount,
    tempIntervalBetweenExecutionsMinutes: state.tempIntervalBetweenExecutionsMinutes,
    tempMaximumOpenPositions: state.tempMaximumOpenPositions,
    setStrategyName: state.setStrategyName,
    setSelectedPairs: state.setSelectedPairs,
    setRuleGroups: state.setRuleGroups,
    setCurrentStrategyId: state.setCurrentStrategyId,
    setActiveId: state.setActiveId,
    setActiveBlockType: state.setActiveBlockType,
    setActiveConfig: state.setActiveConfig,
    setPreviewJson: state.setPreviewJson,
    setImportDialogOpen: state.setImportDialogOpen,
    setImportJson: state.setImportJson,
    setImportError: state.setImportError,
    setTemplatesDialogOpen: state.setTemplatesDialogOpen,
    setDetailsDialogOpen: state.setDetailsDialogOpen,
    setMobileBlockPickerOpen: state.setMobileBlockPickerOpen,
    setMobileBlockPickerTarget: state.setMobileBlockPickerTarget,
    setRunIntervalMinutes: state.setRunIntervalMinutes,
    setMaximumExecuteCount: state.setMaximumExecuteCount,
    setIntervalBetweenExecutionsMinutes: state.setIntervalBetweenExecutionsMinutes,
    setMaximumOpenPositions: state.setMaximumOpenPositions,
    setTempSelectedPairs: state.setTempSelectedPairs,
    onSave,
    onStrategyChange,
  })

  // Load initial strategy
  useEffect(() => {
    if (initialStrategy) {
      state.setCurrentStrategyId(initialStrategy.strategyId || undefined)
      actions.loadStrategyFromJson(initialStrategy)
    }
  }, [initialStrategy, actions.loadStrategyFromJson])

  // Call onStrategyChange whenever strategy state changes
  useEffect(() => {
    if (onStrategyChange) {
      const result = actions.generateStrategyJson()
      if (result.success) {
        onStrategyChange(result.data!)
      }
    }
  }, [
    onStrategyChange,
    state.strategyName,
    state.selectedPairs,
    state.ruleGroups,
    state.runIntervalMinutes,
    state.maximumExecuteCount,
    state.intervalBetweenExecutionsMinutes,
    state.maximumOpenPositions,
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const id = useId()

  return (
    <DndContext sensors={sensors} onDragStart={actions.handleDragStart} onDragEnd={actions.handleDragEnd} id={id}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-wrap lg:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={actions.handleReset} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          {predefinedStrategies.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => state.setTemplatesDialogOpen(true)}
              className="gap-2 bg-transparent"
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
          )}
          {supportedAIModels.length > 0 && callAIFunction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => state.setAiDialogOpen(true)}
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              AI Builder
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => state.setImportDialogOpen(true)}
            className="gap-2 bg-transparent"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={actions.handlePreview} className="gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={actions.handleDeploy} className="gap-2">
            <Play className="h-4 w-4" />
            Deploy
          </Button>
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Strategy Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Initialize temp variables with current values
                  state.setTempStrategyName(state.strategyName)
                  state.setTempSelectedPairs([...state.selectedPairs])
                  state.setTempRunIntervalMinutes(state.runIntervalMinutes)
                  state.setTempMaximumExecuteCount(state.maximumExecuteCount)
                  state.setTempIntervalBetweenExecutionsMinutes(state.intervalBetweenExecutionsMinutes)
                  state.setTempMaximumOpenPositions(state.maximumOpenPositions)
                  state.setDetailsDialogOpen(true)
                }}
                className="gap-1.5 h-7 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{state.strategyName || "Unnamed Strategy"}</span>
              {" trades on "}
              <span className="font-medium text-foreground">
                {state.selectedPairs.length > 0 ? state.selectedPairs.join(", ") : "no pairs selected"}
              </span>
              {". Checked every "}
              <span className="font-medium text-foreground">{actions.getIntervalLabel(state.runIntervalMinutes)}</span>
              {", up to "}
              <span className="font-medium text-foreground">{state.maximumExecuteCount} executions</span>
              {" with "}
              <span className="font-medium text-foreground">{actions.getIntervalLabel(state.intervalBetweenExecutionsMinutes)}</span>
              {" between each. Max "}
              <span className="font-medium text-foreground">{state.maximumOpenPositions} open position{state.maximumOpenPositions !== 1 ? "s" : ""}</span>
              {"."}
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] max-w-screen-2xl">
          <div className="space-y-4 hidden lg:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Building Blocks</CardTitle>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant={state.blockCategory === "condition" ? "default" : "outline"}
                    size="sm"
                    onClick={() => state.setBlockCategory("condition")}
                    className={`flex-1 ${state.blockCategory === "condition" ? "" : "bg-transparent"}`}
                  >
                    Conditions
                  </Button>
                  <Button
                    variant={state.blockCategory === "action" ? "default" : "outline"}
                    size="sm"
                    onClick={() => state.setBlockCategory("action")}
                    className={`flex-1 ${state.blockCategory === "action" ? "" : "bg-transparent"}`}
                  >
                    Actions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {state.displayedBlocks.map((blockType) => (
                  <DraggableBlock key={blockType} id={`sidebar-${blockType}`} blockType={blockType} config={state.customBlockConfigs[blockType]} themeOverride={themeOverride} />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Rules</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.addRuleGroup}
                  className="gap-2 border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Rule
                </Button>
              </div>
              <div className="space-y-4">
                {state.ruleGroups.map((group) => (
                  <RuleDropZone
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    onNameChange={(newName) => actions.handleRuleNameChange(group.id, newName)}
                    conditionItems={group.conditionItems}
                    actionItems={group.actionItems}
                    onRemoveBlock={(itemId, category) => actions.handleRemoveBlock(group.id, itemId, category)}
                    onValueChange={(itemId, name, value, category) =>
                      actions.handleValueChange(group.id, itemId, name, value, category)
                    }
                    onDelete={() => actions.removeRuleGroup(group.id)}
                    canDelete={state.ruleGroups.length > 1}
                    onMobileDropZoneClick={actions.handleMobileDropZoneClick}
                    themeOverride={themeOverride}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {state.previewJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Strategy Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => state.setPreviewJson(null)}>
                Close
              </Button>
            </div>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
              <code>{state.previewJson}</code>
            </pre>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(state.previewJson!)
                  alert("Copied to clipboard!")
                }}
              >
                Copy to Clipboard
              </Button>
              <Button size="sm" onClick={() => state.setPreviewJson(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={state.detailsDialogOpen} onOpenChange={state.setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Strategy Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-name">Strategy Name</Label>
              <Input
                id="strategy-name"
                value={state.tempStrategyName}
                onChange={(e) => state.setTempStrategyName(e.target.value)}
                placeholder="Enter strategy name"
              />
            </div>
            <div className="space-y-2">
              <Label>Trading Pairs</Label>
              {state.tempSelectedPairs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.tempSelectedPairs.map((pair) => (
                    <div
                      key={pair}
                      className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-primary/10 text-primary"
                    >
                      <span>{pair}</span>
                      <button
                        onClick={() => actions.handleTempRemovePair(pair)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Popover open={state.pairPopoverOpen} onOpenChange={state.setPairPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 w-full bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add Trading Pair
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="flex flex-col gap-1 max-h-60 overflow-auto">
                    {tradingPairs
                      .filter((pair) => !state.tempSelectedPairs.includes(pair))
                      .map((pair) => (
                        <button
                          key={pair}
                          onClick={() => actions.handleTempAddPair(pair)}
                          className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          {pair}
                        </button>
                      ))}
                    {tradingPairs.filter((pair) => !state.tempSelectedPairs.includes(pair)).length === 0 && (
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
                    value={String(state.tempRunIntervalMinutes)}
                    onValueChange={(value) => state.setTempRunIntervalMinutes(Number(value))}
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
                    value={state.tempMaximumExecuteCount}
                    onChange={(e) => state.setTempMaximumExecuteCount(Number(e.target.value) || 1)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interval-between" className="text-xs text-muted-foreground">Wait Between Executions</Label>
                  <Select
                    value={String(state.tempIntervalBetweenExecutionsMinutes)}
                    onValueChange={(value) => state.setTempIntervalBetweenExecutionsMinutes(Number(value))}
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
                    value={state.tempMaximumOpenPositions}
                    onChange={(e) => state.setTempMaximumOpenPositions(Number(e.target.value) || 1)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={actions.handleDetailsDialogDone}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {state.importDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Strategy</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  state.setImportDialogOpen(false)
                  state.setImportJson("")
                  state.setImportError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paste a valid strategy JSON to import it into the builder.
            </p>
            <Textarea
              value={state.importJson}
              onChange={(e) => state.setImportJson(e.target.value)}
              placeholder='{"strategyId": "...", "strategyName": "...", "symbols": [...], "rules": [...]}'
              className="min-h-[300px] max-h-[450px] font-mono text-sm overflow-y-auto"
            />
            {state.importError && <p className="mt-2 text-sm text-destructive">{state.importError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  state.setImportDialogOpen(false)
                  state.setImportJson("")
                  state.setImportError(null)
                }}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={actions.handleImportStrategy}>
                Import Strategy
              </Button>
            </div>
          </div>
        </div>
      )}

      {state.aiDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Strategy Builder
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  state.setAiDialogOpen(false)
                  state.setAiPrompt("")
                  state.setAiGeneratedJson("")
                  state.setAiError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Describe your trading strategy in natural language and let AI generate it for you.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select value={state.selectedAIModel} onValueChange={state.setSelectedAIModel}>
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
                  value={state.aiPrompt}
                  onChange={(e) => state.setAiPrompt(e.target.value)}
                  placeholder="Example: Create a strategy that opens a long position when RSI crosses above 30 and the price is above the 50-day moving average. Close the position when RSI goes above 70."
                  className="min-h-[120px]"
                />
              </div>

              <Button
                size="sm"
                onClick={async () => {
                  if (!callAIFunction || !state.aiPrompt.trim() || !state.selectedAIModel) return
                  state.setAiIsLoading(true)
                  state.setAiError(null)
                  state.setAiGeneratedJson("")
                  try {
                    const systemPrompt = STATIC_SYSTEM_PROMPT_V1(
                      tradingPairs,
                      indicatorOptions.map(option => option.name),
                      candleOptions,
                      unitOptions,
                      leverageOptions.map(option => option.label),
                      state.customBlockConfigs
                    )
                    const result = await callAIFunction(systemPrompt, [state.aiPrompt], state.selectedAIModel)
                    state.setAiGeneratedJson(result)
                  } catch (error) {
                    state.setAiError(error instanceof Error ? error.message : "Failed to generate strategy")
                  } finally {
                    state.setAiIsLoading(false)
                  }
                }}
                disabled={state.aiIsLoading || !state.aiPrompt.trim() || !state.selectedAIModel}
                className="w-full gap-2"
              >
                {state.aiIsLoading ? (
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

              {state.aiError && <p className="text-sm text-destructive">{state.aiError}</p>}

              {state.aiGeneratedJson && (
                <div className="space-y-2">
                  <Label>Generated Strategy JSON</Label>
                  <Textarea
                    value={state.aiGeneratedJson}
                    onChange={(e) => state.setAiGeneratedJson(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        state.setAiDialogOpen(false)
                        state.setAiPrompt("")
                        state.setAiGeneratedJson("")
                        state.setAiError(null)
                      }}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(state.aiGeneratedJson)
                          actions.loadStrategyFromJson(parsed)
                          state.setAiDialogOpen(false)
                          state.setAiPrompt("")
                          state.setAiGeneratedJson("")
                          state.setAiError(null)
                        } catch (error) {
                          state.setAiError("Invalid JSON format. Please check the generated output.")
                        }
                      }}
                    >
                      Use Strategy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {state.templatesDialogOpen && predefinedStrategies.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Strategy Templates</h3>
              <Button variant="ghost" size="sm" onClick={() => state.setTemplatesDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
                    onClick={() => actions.handleSelectTemplate(template)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <h4 className="font-medium text-foreground">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      {template.strategy.rules.slice(0, 3).map((rule, index) => (
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
                onClick={() => state.setTemplatesDialogOpen(false)}
                className="bg-transparent"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={state.mobileBlockPickerOpen} onOpenChange={state.setMobileBlockPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {state.mobileBlockPickerTarget?.category === "condition" ? "Condition" : "Action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {(state.mobileBlockPickerTarget?.category === "condition" ? state.conditionBlocks : state.actionBlocks).map((blockType) => {
              const config = state.customBlockConfigs[blockType]
              const blockTheme = themeOverride?.blocks?.[blockType]
              const effectiveColor = blockTheme?.color ?? config.color
              const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor
              return (
                <button
                  key={blockType}
                  onClick={() => actions.handleMobileBlockSelect(blockType)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors hover:opacity-80 ${effectiveBgColor}`}
                >
                  <div className="flex items-center gap-3">
                    <config.icon className={`min-w-5 h-5 w-5 ${effectiveColor}`} />
                    <div>
                      <p className={`font-medium ${effectiveColor}`}>{config.label}</p>
                      {config.description && (
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <DragOverlay>
        {state.activeId && state.activeBlockType && state.activeConfig && (
          <DragOverlayContent blockType={state.activeBlockType} config={state.activeConfig} themeOverride={themeOverride} />
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Separate component for DragOverlay content to avoid IIFE
function DragOverlayContent({ blockType, config, themeOverride }: { blockType: BlockType; config: BlockConfig; themeOverride?: CustomTheme }) {
  const blockTheme = themeOverride?.blocks?.[blockType]
  const effectiveColor = blockTheme?.color ?? config.color
  const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${effectiveBgColor} bg-card shadow-lg`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${effectiveColor}`}>
        <config.icon className="h-4 w-4" />
      </div>
      <span className="font-medium">{config.label}</span>
    </div>
  )
}
