"use client"

import { useState, useCallback, useEffect, useMemo, useId } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
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
import { BlockCategory, BlockConfig, BlockType, ConditionBlockType, ActionBlockType, CustomTheme, IndicatorOption, Parameter, PredefinedStrategyTemplate, StrategyBuilderProps, StrategyTemplate, StrategyBuilderResult, ActionType, ConditionType } from "../types"

interface CanvasItem {
  id: string
  blockType: BlockType
  config: BlockConfig
  values: Record<string, string | number>
}

interface RuleGroup {
  id: string
  name: string
  conditionItems: CanvasItem[]
  actionItems: CanvasItem[]
}

/**
 * Creates a modified blockConfigs object with custom options
 */
function createCustomBlockConfigs(
  configOptions: Record<BlockType, BlockConfig>,
  candleOpts: string[],
  indicatorOpts: IndicatorOption[],
  unitOpts: string[]
): Record<BlockType, BlockConfig> {
  const customConfigs: Record<BlockType, BlockConfig> = {} as Record<BlockType, BlockConfig>

  // Deep clone each block config while preserving the icon reference
  for (const blockType of Object.keys(configOptions) as BlockType[]) {
    const original = configOptions[blockType]
    customConfigs[blockType] = {
      ...original,
      icon: original.icon, // Preserve the icon component reference
      parameters: original.parameters.map((row) =>
        row.map((param) => {
          // Update timeframe options
          if (param.name.includes("timeframe")) {
            return { ...param, options: candleOpts }
          }
          // Update indicator options
          if (param.type === "indicator") {
            return { ...param, indicatorOptions: indicatorOpts }
          }
          // Update unit options
          if (param.name === "unit") {
            return { ...param, options: unitOpts }
          }
          return { ...param }
        })
      ),
    }
  }

  return customConfigs
}

function parseOptionsToValues(opts: Record<string, any>): Record<string, string | number> {
  const values: Record<string, string | number> = {}
  for (const key of Object.keys(opts)) {
    const val = opts[key]
    values[key] = typeof val === "number" ? val : val || ""
  }
  return values
}

function parseStrategyToRuleGroups(
  parsed: {
    strategyName: string
    symbols: string[]
    rules: any[]
  },
  configs: Record<BlockType, BlockConfig>
): { ruleGroups: RuleGroup[]; strategyName: string; symbols: string[] } {
  const newRuleGroups: RuleGroup[] = parsed.rules.map((rule: any, ruleIndex: number) => {
    const conditionItems: CanvasItem[] = (rule.conditions || [])
      .map((condition: any) => {
        const blockType = condition.type as BlockType
        const config = configs[blockType]

        if (!config) {
          console.warn(`Unknown block type: ${blockType}`)
          return null
        }

        const values = parseOptionsToValues(condition.options || {})

        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          blockType,
          config,
          values,
        }
      })
      .filter(Boolean) as CanvasItem[]

    const actionItems: CanvasItem[] = (rule.actions || [])
      .map((action: any) => {
        const blockType = action.action as BlockType
        const config = configs[blockType]
        if (!config) return null

        const values = parseOptionsToValues(action.options || {})

        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          blockType,
          config,
          values,
        }
      })
      .filter(Boolean) as CanvasItem[]

    return {
      id: `rule-${ruleIndex + 1}`,
      name: rule.name || `Rule ${ruleIndex + 1}`,
      conditionItems,
      actionItems,
    }
  })

  return {
    ruleGroups:
      newRuleGroups.length > 0
        ? newRuleGroups
        : [{ id: "rule-1", name: "Rule 1", conditionItems: [], actionItems: [] }],
    strategyName: parsed.strategyName,
    symbols: parsed.symbols,
  }
}

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

  // Create custom block configs with the provided options (memoized to prevent infinite loops)
  const customBlockConfigs = useMemo(
    () => createCustomBlockConfigs(configOptions, candleOptions, indicatorOptions, unitOptions),
    [configOptions, candleOptions, indicatorOptions, unitOptions]
  )

  // Calculate condition and action blocks dynamically based on configOptions
  const { conditionBlocks, actionBlocks } = useMemo(() => {
    const conditionBlocks: ConditionBlockType[] = Object.entries(configOptions)
      .filter(([_, config]) => config.category === "condition")
      .map(([key]) => key as ConditionBlockType)

    const actionBlocks: ActionBlockType[] = Object.entries(configOptions)
      .filter(([_, config]) => config.category === "action")
      .map(([key]) => key as ActionBlockType)

    return { conditionBlocks, actionBlocks }
  }, [configOptions])

  const [strategyName, setStrategyName] = useState("New Strategy")
  const [selectedPairs, setSelectedPairs] = useState<string[]>(["BTC/USD"])
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    { id: "rule-1", name: "Buy Rule", conditionItems: [], actionItems: [] },
    { id: "rule-2", name: "Sell Rule", conditionItems: [], actionItems: [] },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null)
  const [activeConfig, setActiveConfig] = useState<BlockConfig | null>(null)
  const [previewJson, setPreviewJson] = useState<string | null>(null)
  const [pairPopoverOpen, setPairPopoverOpen] = useState(false)
  const [blockCategory, setBlockCategory] = useState<BlockCategory>("condition")
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)
  const [mobileBlockPickerOpen, setMobileBlockPickerOpen] = useState(false)
  const [mobileBlockPickerTarget, setMobileBlockPickerTarget] = useState<{
    groupId: string
    category: BlockCategory
  } | null>(null)
  const [currentStrategyId, setCurrentStrategyId] = useState<string | undefined>(initialStrategy?.strategyId || undefined)

  // AI Builder state
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [selectedAIModel, setSelectedAIModel] = useState<string>(supportedAIModels[0] || "")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiGeneratedJson, setAiGeneratedJson] = useState<string>("")
  const [aiIsLoading, setAiIsLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Execution Options state
  const [runIntervalMinutes, setRunIntervalMinutes] = useState<number>(60) // Default: 1 hour
  const [maximumExecuteCount, setMaximumExecuteCount] = useState<number>(10)
  const [intervalBetweenExecutionsMinutes, setIntervalBetweenExecutionsMinutes] = useState<number>(60) // Default: 1 hour
  const [maximumOpenPositions, setMaximumOpenPositions] = useState<number>(1)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Temporary state for Strategy Details dialog
  const [tempStrategyName, setTempStrategyName] = useState<string>("")
  const [tempSelectedPairs, setTempSelectedPairs] = useState<string[]>([])
  const [tempRunIntervalMinutes, setTempRunIntervalMinutes] = useState<number>(60)
  const [tempMaximumExecuteCount, setTempMaximumExecuteCount] = useState<number>(10)
  const [tempIntervalBetweenExecutionsMinutes, setTempIntervalBetweenExecutionsMinutes] = useState<number>(60)
  const [tempMaximumOpenPositions, setTempMaximumOpenPositions] = useState<number>(1)

  // Handle Done button in Strategy Details dialog
  const handleDetailsDialogDone = () => {
    setStrategyName(tempStrategyName)
    setSelectedPairs([...tempSelectedPairs])
    setRunIntervalMinutes(tempRunIntervalMinutes)
    setMaximumExecuteCount(tempMaximumExecuteCount)
    setIntervalBetweenExecutionsMinutes(tempIntervalBetweenExecutionsMinutes)
    setMaximumOpenPositions(tempMaximumOpenPositions)
    setDetailsDialogOpen(false)
  }

  // Temporary handlers for Strategy Details dialog
  const handleTempAddPair = (pair: string) => {
    if (!tempSelectedPairs.includes(pair)) {
      setTempSelectedPairs((prev) => [...prev, pair])
    }
  }

  const handleTempRemovePair = (pair: string) => {
    setTempSelectedPairs((prev) => prev.filter((p) => p !== pair))
  }

  // Helper to get interval label from minutes value
  const getIntervalLabel = (minutes: number) => {
    const option = runIntervalOptions.find(o => o.value === minutes)
    return option?.label || `${minutes} minutes`
  }

  const loadStrategyFromJson = useCallback(
    (parsed: StrategyTemplate) => {
      const { ruleGroups: newRuleGroups, strategyName: name, symbols } = parseStrategyToRuleGroups(parsed, customBlockConfigs)
      setStrategyName(name)
      setSelectedPairs(symbols)
      setRuleGroups(newRuleGroups)
      
      // Load execution options if present
      if (parsed.executionOptions) {
        if (parsed.executionOptions.runIntervalMinutes !== undefined) {
          setRunIntervalMinutes(parsed.executionOptions.runIntervalMinutes)
        }
        if (parsed.executionOptions.maximumExecuteCount !== undefined) {
          setMaximumExecuteCount(parsed.executionOptions.maximumExecuteCount)
        }
        if (parsed.executionOptions.intervalBetweenExecutionsMinutes !== undefined) {
          setIntervalBetweenExecutionsMinutes(parsed.executionOptions.intervalBetweenExecutionsMinutes)
        }
        if (parsed.executionOptions.maximumOpenPositions !== undefined) {
          setMaximumOpenPositions(parsed.executionOptions.maximumOpenPositions)
        }
      }
    },
    [customBlockConfigs],
  )

  useEffect(() => {
    if (initialStrategy) {
      setCurrentStrategyId(initialStrategy.strategyId || undefined)
      loadStrategyFromJson(initialStrategy)
    }
  }, [initialStrategy, loadStrategyFromJson])

  // Call onStrategyChange whenever strategy state changes
  useEffect(() => {
    if (onStrategyChange) {
      const result = generateStrategyJson()
      if (result.success) {
        onStrategyChange(result.data!)
      }
      
    }
  }, [
    onStrategyChange,
    strategyName,
    selectedPairs,
    ruleGroups,
    runIntervalMinutes,
    maximumExecuteCount,
    intervalBetweenExecutionsMinutes,
    maximumOpenPositions,
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(String(active.id))
    if (active.data.current?.blockType) {
      setActiveBlockType(active.data.current.blockType)
    }
    if (active.data.current?.config) {
      setActiveConfig(active.data.current.config)
    }
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveBlockType(null)
    setActiveConfig(null)

    if (!over) return

    const overId = String(over.id)

    if (String(active.id).startsWith("sidebar-")) {
      const blockType = active.data.current?.blockType as BlockType
      const config = customBlockConfigs[blockType]

      // Check if dropping to conditions or actions
      const isConditionsZone = overId.endsWith("-conditions")
      const isActionsZone = overId.endsWith("-actions")

      if (!isConditionsZone && !isActionsZone) return

      // Validate block category matches zone
      if (isConditionsZone && config.category !== "condition") return
      if (isActionsZone && config.category !== "action") return

      const ruleId = overId.replace("-conditions", "").replace("-actions", "")

      const newItem: CanvasItem = {
        id: `item-${Date.now()}`,
        blockType,
        config,
        values: {},
      }

      // Flatten 2D parameters array and set default values
      config.parameters.forEach((row) => {
        row.forEach((param) => {
          if (param.default !== undefined) {
            newItem.values[param.name] = param.default
          }
        })
      })

      setRuleGroups((prev) =>
        prev.map((group) => {
          if (group.id === ruleId) {
            if (isConditionsZone) {
              return { ...group, conditionItems: [...group.conditionItems, newItem] }
            } else {
              return { ...group, actionItems: [...group.actionItems, newItem] }
            }
          }
          return group
        }),
      )
      return
    }

    // Handle reordering within the same zone
    if (String(active.id).startsWith("item-") && String(over.id).startsWith("item-")) {
      setRuleGroups((prev) =>
        prev.map((group) => {
          // Check conditions
          const condOldIndex = group.conditionItems.findIndex((item) => item.id === active.id)
          const condNewIndex = group.conditionItems.findIndex((item) => item.id === over.id)
          if (condOldIndex !== -1 && condNewIndex !== -1 && condOldIndex !== condNewIndex) {
            return { ...group, conditionItems: arrayMove(group.conditionItems, condOldIndex, condNewIndex) }
          }

          // Check actions
          const actOldIndex = group.actionItems.findIndex((item) => item.id === active.id)
          const actNewIndex = group.actionItems.findIndex((item) => item.id === over.id)
          if (actOldIndex !== -1 && actNewIndex !== -1 && actOldIndex !== actNewIndex) {
            return { ...group, actionItems: arrayMove(group.actionItems, actOldIndex, actNewIndex) }
          }

          return group
        }),
      )
    }
  }, [])

  const handleRemoveBlock = (groupId: string, itemId: string, category: BlockCategory) => {
    setRuleGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          if (category === "condition") {
            return { ...group, conditionItems: group.conditionItems.filter((item) => item.id !== itemId) }
          } else {
            return { ...group, actionItems: group.actionItems.filter((item) => item.id !== itemId) }
          }
        }
        return group
      }),
    )
  }

  const handleValueChange = (
    groupId: string,
    itemId: string,
    name: string,
    value: string | number,
    category: BlockCategory,
  ) => {
    setRuleGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          if (category === "condition") {
            return {
              ...group,
              conditionItems: group.conditionItems.map((item) =>
                item.id === itemId ? { ...item, values: { ...item.values, [name]: value } } : item,
              ),
            }
          } else {
            return {
              ...group,
              actionItems: group.actionItems.map((item) =>
                item.id === itemId ? { ...item, values: { ...item.values, [name]: value } } : item,
              ),
            }
          }
        }
        return group
      }),
    )
  }

  const addRuleGroup = () => {
    const count = ruleGroups.length + 1
    setRuleGroups((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, name: `Rule ${count}`, conditionItems: [], actionItems: [] },
    ])
  }

  const removeRuleGroup = (id: string) => {
    setRuleGroups((prev) => prev.filter((group) => group.id !== id))
  }

  const handleReset = () => {
    setRuleGroups([ 
      { id: "rule-1", name: "Buy Rule", conditionItems: [], actionItems: [] },
      { id: "rule-2", name: "Sell Rule", conditionItems: [], actionItems: [] },
    ])
    setStrategyName("New Strategy")
    setSelectedPairs(["BTC/USD"])

    if(onStrategyChange) {
      onStrategyChange(null)
    }
  }

  const handleDeploy = () => {
    const result = generateStrategyJson()

    if (!result.success) {
      alert("Please fix all validation errors before deploying:\n" + result.errors?.join("\n"))
      return
    }

    const strategyToSave: StrategyTemplate = {
      ...result.data!,
      strategyId: currentStrategyId || result.data!.strategyId,
    }

    if (onSave) {
      onSave(strategyToSave)
    }

    setCurrentStrategyId(strategyToSave.strategyId)
  }

  const generateStrategyJson = (): StrategyBuilderResult => {
    const errors: string[] = []

    if (!strategyName || strategyName.trim() === "") {
      errors.push("Strategy name is required")
    }

    if (selectedPairs.length === 0) {
      errors.push("At least one trading pair is required")
    }

    const hasBlocks = ruleGroups.some((g) => g.conditionItems.length > 0 || g.actionItems.length > 0)
    if (!hasBlocks) {
      errors.push("At least one rule with conditions or actions is required")
    }

    // Helper to check if a parameter is visible based on showWhen/hideWhen
    const isParamVisible = (param: Parameter, values: Record<string, string | number>): boolean => {
      if (param.showWhen) {
        const dependentValue = values[param.showWhen.param]
        if (dependentValue !== param.showWhen.equals) {
          return false
        }
      }
      if (param.hideWhen) {
        const dependentValue = values[param.hideWhen.param]
        if (dependentValue === param.hideWhen.equals) {
          return false
        }
      }
      return true
    }

    // Generic function to validate and extract options from an item
    const processItem = (
      item: CanvasItem,
      itemIndex: number,
      blockLabel: string,
      typeKey: "type" | "action"
    ): Record<string, any> => {
      const options: Record<string, any> = {}

      // Flatten and iterate all parameters
      for (const row of item.config.parameters) {
        for (const param of row) {
          // Skip label type parameters - they are for display only
          if (param.type === "label") continue

          const isVisible = isParamVisible(param, item.values)
          const value = item.values[param.name]

          // Check required validation only for visible parameters
          if (param.required && isVisible) {
            if (value === undefined || value === "") {
              errors.push(`${blockLabel}: ${param.label} is required`)
            }
          }

          // Only include visible parameters in output
          if (isVisible && value !== undefined && value !== "") {
            options[param.name] = item.values[param.name]
          }
        }
      }

      return {
        index: itemIndex,
        [typeKey]: item.blockType,
        options,
      }
    }

    const rules = ruleGroups.map((group) => {
      const conditions: ConditionType[] = group.conditionItems.map((item, itemIndex) => {
        const blockLabel = `${group.name}, Condition ${itemIndex + 1} (${item.config.label})`
        return processItem(item, itemIndex, blockLabel, "type") as ConditionType
      })

      const actions: ActionType[] = group.actionItems.map((item, itemIndex) => {
        const blockLabel = `${group.name}, Action ${itemIndex + 1} (${item.config.label})`
        return processItem(item, itemIndex, blockLabel, "action") as ActionType
      })

      return {
        name: group.name,
        conditions,
        actions,
      }
    })

    if (errors.length > 0) {
      return { success: false, errors }
    }

    const strategyJson: StrategyTemplate = {
      strategyId: crypto.randomUUID(),
      strategyName: strategyName.trim(),
      symbols: selectedPairs,
      executionOptions: {
        runIntervalMinutes,
        maximumExecuteCount,
        intervalBetweenExecutionsMinutes,
        maximumOpenPositions,
      },
      rules,
    }

    return { success: true, data: strategyJson }
  }

  const handlePreview = () => {
    const result = generateStrategyJson()

    if (!result.success) {
      setPreviewJson(JSON.stringify({ errors: result.errors }, null, 2))
      return
    }

    setPreviewJson(JSON.stringify(result.data, null, 2))
  }

  const handleImportStrategy = () => {
    setImportError(null)

    if (!importJson.trim()) {
      setImportError("Please paste a valid JSON strategy")
      return
    }

    try {
      const parsed = JSON.parse(importJson)

      // Validate required fields
      if (!parsed.strategyName) {
        setImportError("Invalid strategy: missing strategyName")
        return
      }
      if (!parsed.symbols || !Array.isArray(parsed.symbols)) {
        setImportError("Invalid strategy: missing or invalid symbols array")
        return
      }
      if (!parsed.rules || !Array.isArray(parsed.rules)) {
        setImportError("Invalid strategy: missing or invalid rules array")
        return
      }

      loadStrategyFromJson(parsed)

      // Close dialog and reset
      setImportDialogOpen(false)
      setImportJson("")
      setImportError(null)
    } catch (e) {
      setImportError("Invalid JSON format. Please check your input.")
    }
  }

  const handleSelectTemplate = (template: PredefinedStrategyTemplate) => {
    loadStrategyFromJson(template.strategy)
    setTemplatesDialogOpen(false)
  }

  const handleRuleNameChange = (groupId: string, newName: string) => {
    setRuleGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, name: newName } : group)))
  }

  const handleMobileDropZoneClick = (groupId: string, category: BlockCategory) => {
    setMobileBlockPickerTarget({ groupId, category })
    setMobileBlockPickerOpen(true)
  }

  const handleMobileBlockSelect = (blockType: BlockType) => {
    if (!mobileBlockPickerTarget) return

    const config = customBlockConfigs[blockType]
    const newItem: CanvasItem = {
      id: `canvas-${Date.now()}`,
      blockType,
      config,
      values: config.parameters.flat().reduce(
        (acc, param) => {
          acc[param.name] = param.default || ""
          return acc
        },
        {} as Record<string, string | number>,
      ),
    }

    setRuleGroups((prev) =>
      prev.map((group) => {
        if (group.id !== mobileBlockPickerTarget.groupId) return group
        if (mobileBlockPickerTarget.category === "condition") {
          return { ...group, conditionItems: [...group.conditionItems, newItem] }
        } else {
          return { ...group, actionItems: [...group.actionItems, newItem] }
        }
      }),
    )

    setMobileBlockPickerOpen(false)
    setMobileBlockPickerTarget(null)
  }

  const displayedBlocks = blockCategory === "condition" ? conditionBlocks : actionBlocks

  const id = useId()

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} id={id}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-wrap lg:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          {predefinedStrategies.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplatesDialogOpen(true)}
              className="gap-2 bg-transparent"
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            className="gap-2 bg-transparent"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          {supportedAIModels.length > 0 && callAIFunction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiDialogOpen(true)}
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              AI Builder
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleDeploy} className="gap-2">
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
                onClick={() => setDetailsDialogOpen(true)}
                className="gap-1.5 h-7 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{strategyName || "Unnamed Strategy"}</span>
              {" trades on "}
              <span className="font-medium text-foreground">
                {selectedPairs.length > 0 ? selectedPairs.join(", ") : "no pairs selected"}
              </span>
              {". Checked every "}
              <span className="font-medium text-foreground">{getIntervalLabel(runIntervalMinutes)}</span>
              {", up to "}
              <span className="font-medium text-foreground">{maximumExecuteCount} executions</span>
              {" with "}
              <span className="font-medium text-foreground">{getIntervalLabel(intervalBetweenExecutionsMinutes)}</span>
              {" between each. Max "}
              <span className="font-medium text-foreground">{maximumOpenPositions} open position{maximumOpenPositions !== 1 ? "s" : ""}</span>
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
                    variant={blockCategory === "condition" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlockCategory("condition")}
                    className={`flex-1 ${blockCategory === "condition" ? "" : "bg-transparent"}`}
                  >
                    Conditions
                  </Button>
                  <Button
                    variant={blockCategory === "action" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlockCategory("action")}
                    className={`flex-1 ${blockCategory === "action" ? "" : "bg-transparent"}`}
                  >
                    Actions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayedBlocks.map((blockType) => (
                  <DraggableBlock key={blockType} id={`sidebar-${blockType}`} blockType={blockType} config={customBlockConfigs[blockType]} themeOverride={themeOverride} />
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
                  onClick={addRuleGroup}
                  className="gap-2 border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Add Rule
                </Button>
              </div>
              <div className="space-y-4">
                {ruleGroups.map((group) => (
                  <RuleDropZone
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    onNameChange={(newName) => handleRuleNameChange(group.id, newName)}
                    conditionItems={group.conditionItems}
                    actionItems={group.actionItems}
                    onRemoveBlock={(itemId, category) => handleRemoveBlock(group.id, itemId, category)}
                    onValueChange={(itemId, name, value, category) =>
                      handleValueChange(group.id, itemId, name, value, category)
                    }
                    onDelete={() => removeRuleGroup(group.id)}
                    canDelete={ruleGroups.length > 1}
                    onMobileDropZoneClick={handleMobileDropZoneClick}
                    themeOverride={themeOverride}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Strategy JSON Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewJson(null)}>
                Close
              </Button>
            </div>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
              <code>{previewJson}</code>
            </pre>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(previewJson)
                  alert("Copied to clipboard!")
                }}
              >
                Copy to Clipboard
              </Button>
              <Button size="sm" onClick={() => setPreviewJson(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
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
                        onClick={() => handleTempRemovePair(pair)}
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
                          onClick={() => handleTempAddPair(pair)}
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
              <Button size="sm" onClick={handleDetailsDialogDone}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {importDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Strategy</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImportDialogOpen(false)
                  setImportJson("")
                  setImportError(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paste a valid strategy JSON to import it into the builder.
            </p>
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{"strategyId": "...", "strategyName": "...", "symbols": [...], "rules": [...]}'
              className="min-h-[300px] font-mono text-sm"
            />
            {importError && <p className="mt-2 text-sm text-destructive">{importError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImportDialogOpen(false)
                  setImportJson("")
                  setImportError(null)
                }}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleImportStrategy}>
                Import Strategy
              </Button>
            </div>
          </div>
        </div>
      )}

      {aiDialogOpen && (
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
                  setAiDialogOpen(false)
                  setAiPrompt("")
                  setAiGeneratedJson("")
                  setAiError(null)
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
                onClick={async () => {
                  if (!callAIFunction || !aiPrompt.trim() || !selectedAIModel) return
                  setAiIsLoading(true)
                  setAiError(null)
                  setAiGeneratedJson("")
                  try {
                    const systemPrompt = STATIC_SYSTEM_PROMPT_V1(
                      tradingPairs,
                      indicatorOptions.map(option => option.name),
                      candleOptions,
                      unitOptions,
                      leverageOptions.map(option => option.label),
                      customBlockConfigs
                    )
                    const result = await callAIFunction(systemPrompt, [aiPrompt], selectedAIModel)
                    setAiGeneratedJson(result)
                  } catch (error) {
                    setAiError(error instanceof Error ? error.message : "Failed to generate strategy")
                  } finally {
                    setAiIsLoading(false)
                  }
                }}
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
                      onClick={() => {
                        setAiDialogOpen(false)
                        setAiPrompt("")
                        setAiGeneratedJson("")
                        setAiError(null)
                      }}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(aiGeneratedJson)
                          loadStrategyFromJson(parsed)
                          setAiDialogOpen(false)
                          setAiPrompt("")
                          setAiGeneratedJson("")
                          setAiError(null)
                        } catch (error) {
                          setAiError("Invalid JSON format. Please check the generated output.")
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

      {templatesDialogOpen && predefinedStrategies.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Strategy Templates</h3>
              <Button variant="ghost" size="sm" onClick={() => setTemplatesDialogOpen(false)}>
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
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <h4 className="font-medium text-foreground">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      {template.strategy.symbols.slice(0, 3).map((symbol) => (
                        <span key={symbol} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {symbol}
                        </span>
                      ))}
                      {template.strategy.symbols.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          +{template.strategy.symbols.length - 3} more
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
                onClick={() => setTemplatesDialogOpen(false)}
                className="bg-transparent"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={mobileBlockPickerOpen} onOpenChange={setMobileBlockPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {mobileBlockPickerTarget?.category === "condition" ? "Condition" : "Action"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {(mobileBlockPickerTarget?.category === "condition" ? conditionBlocks : actionBlocks).map((blockType) => {
              const config = customBlockConfigs[blockType]
              const blockTheme = themeOverride?.blocks?.[blockType]
              const effectiveColor = blockTheme?.color ?? config.color
              const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor
              return (
                <button
                  key={blockType}
                  onClick={() => handleMobileBlockSelect(blockType)}
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
        {activeId && activeBlockType && activeConfig && (
          <DragOverlayContent blockType={activeBlockType} config={activeConfig} themeOverride={themeOverride} />
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
