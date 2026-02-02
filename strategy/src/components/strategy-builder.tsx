"use client"

/**
 * StrategyBuilder Component
 * 
 * Main component for building trading strategies with drag-and-drop blocks.
 * Uses custom hooks (useStrategyState and useStrategyActions) for state management
 * and action handlers to maintain clean separation of concerns.
 * 
 */

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
import { DraggableBlock } from "./draggable-block"
import { RuleDropZone } from "./rule-drop-zone"
import { ImportDialog, DetailsDialog, AIDialog, TemplatesDialog, type StrategyDetailsData } from "./dialogs"
import {
  blockConfigs,
  candleOptions as defaultCandleOptions,
  indicatorOptions as defaultIndicatorOptions,
  unitOptions as defaultUnitOptions,
  STATIC_SYSTEM_PROMPT_V1,
  leverageOptions,
  tradingPairs,
} from "./block-types"
import { Play, RotateCcw, Plus, Eye, Upload, LayoutTemplate, Sparkles, Pencil } from "lucide-react"
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
    setMobileBlockPickerOpen: state.setMobileBlockPickerOpen,
    setMobileBlockPickerTarget: state.setMobileBlockPickerTarget,
    setRunIntervalMinutes: state.setRunIntervalMinutes,
    setMaximumExecuteCount: state.setMaximumExecuteCount,
    setIntervalBetweenExecutionsMinutes: state.setIntervalBetweenExecutionsMinutes,
    setMaximumOpenPositions: state.setMaximumOpenPositions,
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

  // Call onStrategyChange whenever strategy state changes (debounced to prevent excessive calls)
  useEffect(() => {
    if (!onStrategyChange) return

    const timeoutId = setTimeout(() => {
      const result = actions.generateStrategyJson()
      if (result.success) {
        onStrategyChange(result.data!)
      }
    }, 300) // Debounce by 300ms

    // Cleanup function to cancel pending timeout on unmount or dependency change
    return () => clearTimeout(timeoutId)
  }, [
    onStrategyChange,
    state.strategyName,
    state.selectedPairs,
    state.ruleGroups,
    state.runIntervalMinutes,
    state.maximumExecuteCount,
    state.intervalBetweenExecutionsMinutes,
    state.maximumOpenPositions,
    actions.generateStrategyJson,
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
                onClick={() => state.setDetailsDialogOpen(true)}
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

      <DetailsDialog
        open={state.detailsDialogOpen}
        onOpenChange={state.setDetailsDialogOpen}
        initialData={{
          strategyName: state.strategyName,
          selectedPairs: state.selectedPairs,
          runIntervalMinutes: state.runIntervalMinutes,
          maximumExecuteCount: state.maximumExecuteCount,
          intervalBetweenExecutionsMinutes: state.intervalBetweenExecutionsMinutes,
          maximumOpenPositions: state.maximumOpenPositions,
        }}
        onSave={(data: StrategyDetailsData) => {
          state.setStrategyName(data.strategyName)
          state.setSelectedPairs(data.selectedPairs)
          state.setRunIntervalMinutes(data.runIntervalMinutes)
          state.setMaximumExecuteCount(data.maximumExecuteCount)
          state.setIntervalBetweenExecutionsMinutes(data.intervalBetweenExecutionsMinutes)
          state.setMaximumOpenPositions(data.maximumOpenPositions)
        }}
      />

      <ImportDialog
        open={state.importDialogOpen}
        onOpenChange={state.setImportDialogOpen}
        importJson={state.importJson}
        setImportJson={state.setImportJson}
        importError={state.importError}
        setImportError={state.setImportError}
        onImport={actions.handleImportStrategy}
      />

      <AIDialog
        open={state.aiDialogOpen}
        onOpenChange={state.setAiDialogOpen}
        selectedAIModel={state.selectedAIModel}
        setSelectedAIModel={state.setSelectedAIModel}
        supportedAIModels={supportedAIModels}
        aiPrompt={state.aiPrompt}
        setAiPrompt={state.setAiPrompt}
        aiIsLoading={state.aiIsLoading}
        aiError={state.aiError}
        setAiError={state.setAiError}
        aiGeneratedJson={state.aiGeneratedJson}
        setAiGeneratedJson={state.setAiGeneratedJson}
        onGenerateStrategy={async () => {
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
        onUseStrategy={() => {
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
      />

      <TemplatesDialog
        open={state.templatesDialogOpen}
        onOpenChange={state.setTemplatesDialogOpen}
        predefinedStrategies={predefinedStrategies}
        onSelectTemplate={actions.handleSelectTemplate}
      />

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
