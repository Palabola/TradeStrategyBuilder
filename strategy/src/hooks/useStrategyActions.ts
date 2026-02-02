import { useCallback } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  BlockCategory,
  BlockConfig,
  BlockType,
  Parameter,
  PredefinedStrategyTemplate,
  StrategyBuilderResult,
  StrategyTemplate,
  ActionType,
  ConditionType,
} from "../types"
import { CanvasItem, RuleGroup } from "./useStrategyState"
import { runIntervalOptions } from "../components/block-types"

/**
 * Parses option values to the correct types.
 */
function parseOptionsToValues(opts: Record<string, any>): Record<string, string | number> {
  const values: Record<string, string | number> = {}
  for (const key of Object.keys(opts)) {
    const val = opts[key]
    values[key] = typeof val === "number" ? val : val || ""
  }
  return values
}

/**
 * Parses a strategy template into rule groups.
 */
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

/**
 * Default rule groups for a new strategy.
 */
const DEFAULT_RULE_GROUPS: RuleGroup[] = [
  { id: "rule-1", name: "Buy Rule", conditionItems: [], actionItems: [] },
  { id: "rule-2", name: "Sell Rule", conditionItems: [], actionItems: [] },
]

export interface UseStrategyActionsProps {
  // State values
  customBlockConfigs: Record<BlockType, BlockConfig>
  strategyName: string
  selectedPairs: string[]
  ruleGroups: RuleGroup[]
  currentStrategyId: string | undefined
  runIntervalMinutes: number
  maximumExecuteCount: number
  intervalBetweenExecutionsMinutes: number
  maximumOpenPositions: number
  importJson: string
  mobileBlockPickerTarget: { groupId: string; category: BlockCategory } | null

  // Temp state values
  tempStrategyName: string
  tempSelectedPairs: string[]
  tempRunIntervalMinutes: number
  tempMaximumExecuteCount: number
  tempIntervalBetweenExecutionsMinutes: number
  tempMaximumOpenPositions: number

  // State setters
  setStrategyName: React.Dispatch<React.SetStateAction<string>>
  setSelectedPairs: React.Dispatch<React.SetStateAction<string[]>>
  setRuleGroups: React.Dispatch<React.SetStateAction<RuleGroup[]>>
  setCurrentStrategyId: React.Dispatch<React.SetStateAction<string | undefined>>
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>
  setActiveBlockType: React.Dispatch<React.SetStateAction<BlockType | null>>
  setActiveConfig: React.Dispatch<React.SetStateAction<BlockConfig | null>>
  setPreviewJson: React.Dispatch<React.SetStateAction<string | null>>
  setImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setImportJson: React.Dispatch<React.SetStateAction<string>>
  setImportError: React.Dispatch<React.SetStateAction<string | null>>
  setTemplatesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setMobileBlockPickerOpen: React.Dispatch<React.SetStateAction<boolean>>
  setMobileBlockPickerTarget: React.Dispatch<React.SetStateAction<{ groupId: string; category: BlockCategory } | null>>
  setRunIntervalMinutes: React.Dispatch<React.SetStateAction<number>>
  setMaximumExecuteCount: React.Dispatch<React.SetStateAction<number>>
  setIntervalBetweenExecutionsMinutes: React.Dispatch<React.SetStateAction<number>>
  setMaximumOpenPositions: React.Dispatch<React.SetStateAction<number>>

  // Temp state setters
  setTempSelectedPairs: React.Dispatch<React.SetStateAction<string[]>>

  // Callbacks
  onSave?: (strategy: StrategyTemplate) => void
  onStrategyChange?: (strategy: StrategyTemplate | null) => void
}

export interface StrategyActionsReturn {
  // Drag handlers
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void

  // Block handlers
  handleRemoveBlock: (groupId: string, itemId: string, category: BlockCategory) => void
  handleValueChange: (groupId: string, itemId: string, name: string, value: string | number, category: BlockCategory) => void

  // Rule group handlers
  addRuleGroup: () => void
  removeRuleGroup: (id: string) => void
  handleRuleNameChange: (groupId: string, newName: string) => void

  // Strategy handlers
  handleReset: () => void
  handleDeploy: () => void
  handlePreview: () => void
  handleImportStrategy: () => void
  handleSelectTemplate: (template: PredefinedStrategyTemplate) => void
  loadStrategyFromJson: (parsed: StrategyTemplate) => void
  generateStrategyJson: () => StrategyBuilderResult

  // Mobile handlers
  handleMobileDropZoneClick: (groupId: string, category: BlockCategory) => void
  handleMobileBlockSelect: (blockType: BlockType) => void

  // Dialog handlers
  handleDetailsDialogDone: () => void
  handleTempAddPair: (pair: string) => void
  handleTempRemovePair: (pair: string) => void

  // Utility functions
  getIntervalLabel: (minutes: number) => string
}

/**
 * Custom hook that manages all strategy builder actions/handlers.
 * Extracts action handlers from the main component for better organization and reusability.
 */
export function useStrategyActions({
  customBlockConfigs,
  strategyName,
  selectedPairs,
  ruleGroups,
  currentStrategyId,
  runIntervalMinutes,
  maximumExecuteCount,
  intervalBetweenExecutionsMinutes,
  maximumOpenPositions,
  importJson,
  mobileBlockPickerTarget,
  tempStrategyName,
  tempSelectedPairs,
  tempRunIntervalMinutes,
  tempMaximumExecuteCount,
  tempIntervalBetweenExecutionsMinutes,
  tempMaximumOpenPositions,
  setStrategyName,
  setSelectedPairs,
  setRuleGroups,
  setCurrentStrategyId,
  setActiveId,
  setActiveBlockType,
  setActiveConfig,
  setPreviewJson,
  setImportDialogOpen,
  setImportJson,
  setImportError,
  setTemplatesDialogOpen,
  setDetailsDialogOpen,
  setMobileBlockPickerOpen,
  setMobileBlockPickerTarget,
  setRunIntervalMinutes,
  setMaximumExecuteCount,
  setIntervalBetweenExecutionsMinutes,
  setMaximumOpenPositions,
  setTempSelectedPairs,
  onSave,
  onStrategyChange,
}: UseStrategyActionsProps): StrategyActionsReturn {
  /**
   * Helper to get interval label from minutes value.
   */
  const getIntervalLabel = useCallback((minutes: number) => {
    const option = runIntervalOptions.find((o) => o.value === minutes)
    return option?.label || `${minutes} minutes`
  }, [])

  /**
   * Loads a strategy from JSON into the builder state.
   */
  const loadStrategyFromJson = useCallback(
    (parsed: StrategyTemplate) => {
      const { ruleGroups: newRuleGroups, strategyName: name, symbols } = parseStrategyToRuleGroups(
        parsed,
        customBlockConfigs
      )
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
    [
      customBlockConfigs,
      setStrategyName,
      setSelectedPairs,
      setRuleGroups,
      setRunIntervalMinutes,
      setMaximumExecuteCount,
      setIntervalBetweenExecutionsMinutes,
      setMaximumOpenPositions,
    ]
  )

  /**
   * Generates the strategy JSON from the current state.
   */
  const generateStrategyJson = useCallback((): StrategyBuilderResult => {
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

      for (const row of item.config.parameters) {
        for (const param of row) {
          if (param.type === "label") continue

          const isVisible = isParamVisible(param, item.values)
          const value = item.values[param.name]

          if (param.required && isVisible) {
            if (value === undefined || value === "") {
              errors.push(`${blockLabel}: ${param.label} is required`)
            }
          }

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
  }, [
    strategyName,
    selectedPairs,
    ruleGroups,
    runIntervalMinutes,
    maximumExecuteCount,
    intervalBetweenExecutionsMinutes,
    maximumOpenPositions,
  ])

  // Drag handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(String(active.id))
      if (active.data.current?.blockType) {
        setActiveBlockType(active.data.current.blockType)
      }
      if (active.data.current?.config) {
        setActiveConfig(active.data.current.config)
      }
    },
    [setActiveId, setActiveBlockType, setActiveConfig]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveBlockType(null)
      setActiveConfig(null)

      if (!over) return

      const overId = String(over.id)

      if (String(active.id).startsWith("sidebar-")) {
        const blockType = active.data.current?.blockType as BlockType
        const config = customBlockConfigs[blockType]

        const isConditionsZone = overId.endsWith("-conditions")
        const isActionsZone = overId.endsWith("-actions")

        if (!isConditionsZone && !isActionsZone) return
        if (isConditionsZone && config.category !== "condition") return
        if (isActionsZone && config.category !== "action") return

        const ruleId = overId.replace("-conditions", "").replace("-actions", "")

        const newItem: CanvasItem = {
          id: `item-${Date.now()}`,
          blockType,
          config,
          values: {},
        }

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
          })
        )
        return
      }

      // Handle reordering within the same zone
      if (String(active.id).startsWith("item-") && String(over.id).startsWith("item-")) {
        setRuleGroups((prev) =>
          prev.map((group) => {
            const condOldIndex = group.conditionItems.findIndex((item) => item.id === active.id)
            const condNewIndex = group.conditionItems.findIndex((item) => item.id === over.id)
            if (condOldIndex !== -1 && condNewIndex !== -1 && condOldIndex !== condNewIndex) {
              return { ...group, conditionItems: arrayMove(group.conditionItems, condOldIndex, condNewIndex) }
            }

            const actOldIndex = group.actionItems.findIndex((item) => item.id === active.id)
            const actNewIndex = group.actionItems.findIndex((item) => item.id === over.id)
            if (actOldIndex !== -1 && actNewIndex !== -1 && actOldIndex !== actNewIndex) {
              return { ...group, actionItems: arrayMove(group.actionItems, actOldIndex, actNewIndex) }
            }

            return group
          })
        )
      }
    },
    [customBlockConfigs, setActiveId, setActiveBlockType, setActiveConfig, setRuleGroups]
  )

  // Block handlers
  const handleRemoveBlock = useCallback(
    (groupId: string, itemId: string, category: BlockCategory) => {
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
        })
      )
    },
    [setRuleGroups]
  )

  const handleValueChange = useCallback(
    (groupId: string, itemId: string, name: string, value: string | number, category: BlockCategory) => {
      setRuleGroups((prev) =>
        prev.map((group) => {
          if (group.id === groupId) {
            if (category === "condition") {
              return {
                ...group,
                conditionItems: group.conditionItems.map((item) =>
                  item.id === itemId ? { ...item, values: { ...item.values, [name]: value } } : item
                ),
              }
            } else {
              return {
                ...group,
                actionItems: group.actionItems.map((item) =>
                  item.id === itemId ? { ...item, values: { ...item.values, [name]: value } } : item
                ),
              }
            }
          }
          return group
        })
      )
    },
    [setRuleGroups]
  )

  // Rule group handlers
  const addRuleGroup = useCallback(() => {
    setRuleGroups((prev) => {
      const count = prev.length + 1
      return [...prev, { id: `rule-${Date.now()}`, name: `Rule ${count}`, conditionItems: [], actionItems: [] }]
    })
  }, [setRuleGroups])

  const removeRuleGroup = useCallback(
    (id: string) => {
      setRuleGroups((prev) => prev.filter((group) => group.id !== id))
    },
    [setRuleGroups]
  )

  const handleRuleNameChange = useCallback(
    (groupId: string, newName: string) => {
      setRuleGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, name: newName } : group)))
    },
    [setRuleGroups]
  )

  // Strategy handlers
  const handleReset = useCallback(() => {
    setRuleGroups([...DEFAULT_RULE_GROUPS])
    setStrategyName("New Strategy")
    setSelectedPairs(["BTC/USD"])
    setMaximumExecuteCount(100)
    setRunIntervalMinutes(60)
    setIntervalBetweenExecutionsMinutes(60)
    setMaximumOpenPositions(1)
    setCurrentStrategyId(undefined)

    if (onStrategyChange) {
      onStrategyChange(null)
    }
  }, [
    setRuleGroups,
    setStrategyName,
    setSelectedPairs,
    setMaximumExecuteCount,
    setRunIntervalMinutes,
    setIntervalBetweenExecutionsMinutes,
    setMaximumOpenPositions,
    setCurrentStrategyId,
    onStrategyChange,
  ])

  const handleDeploy = useCallback(() => {
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
  }, [generateStrategyJson, currentStrategyId, onSave, setCurrentStrategyId])

  const handlePreview = useCallback(() => {
    const result = generateStrategyJson()

    if (!result.success) {
      setPreviewJson(JSON.stringify({ errors: result.errors }, null, 2))
      return
    }

    setPreviewJson(JSON.stringify(result.data, null, 2))
  }, [generateStrategyJson, setPreviewJson])

  const handleImportStrategy = useCallback(() => {
    setImportError(null)

    if (!importJson.trim()) {
      setImportError("Please paste a valid JSON strategy")
      return
    }

    try {
      const parsed = JSON.parse(importJson)

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

      setImportDialogOpen(false)
      setImportJson("")
      setImportError(null)
    } catch (e) {
      setImportError("Invalid JSON format. Please check your input.")
    }
  }, [importJson, loadStrategyFromJson, setImportError, setImportDialogOpen, setImportJson])

  const handleSelectTemplate = useCallback(
    (template: PredefinedStrategyTemplate) => {
      loadStrategyFromJson(template.strategy)
      setTemplatesDialogOpen(false)
    },
    [loadStrategyFromJson, setTemplatesDialogOpen]
  )

  // Mobile handlers
  const handleMobileDropZoneClick = useCallback(
    (groupId: string, category: BlockCategory) => {
      setMobileBlockPickerTarget({ groupId, category })
      setMobileBlockPickerOpen(true)
    },
    [setMobileBlockPickerTarget, setMobileBlockPickerOpen]
  )

  const handleMobileBlockSelect = useCallback(
    (blockType: BlockType) => {
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
          {} as Record<string, string | number>
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
        })
      )

      setMobileBlockPickerOpen(false)
      setMobileBlockPickerTarget(null)
    },
    [customBlockConfigs, mobileBlockPickerTarget, setRuleGroups, setMobileBlockPickerOpen, setMobileBlockPickerTarget]
  )

  // Dialog handlers
  const handleDetailsDialogDone = useCallback(() => {
    setStrategyName(tempStrategyName)
    setSelectedPairs([...tempSelectedPairs])
    setRunIntervalMinutes(tempRunIntervalMinutes)
    setMaximumExecuteCount(tempMaximumExecuteCount)
    setIntervalBetweenExecutionsMinutes(tempIntervalBetweenExecutionsMinutes)
    setMaximumOpenPositions(tempMaximumOpenPositions)
    setDetailsDialogOpen(false)
  }, [
    tempStrategyName,
    tempSelectedPairs,
    tempRunIntervalMinutes,
    tempMaximumExecuteCount,
    tempIntervalBetweenExecutionsMinutes,
    tempMaximumOpenPositions,
    setStrategyName,
    setSelectedPairs,
    setRunIntervalMinutes,
    setMaximumExecuteCount,
    setIntervalBetweenExecutionsMinutes,
    setMaximumOpenPositions,
    setDetailsDialogOpen,
  ])

  const handleTempAddPair = useCallback(
    (pair: string) => {
      if (!tempSelectedPairs.includes(pair)) {
        setTempSelectedPairs((prev) => [...prev, pair])
      }
    },
    [tempSelectedPairs, setTempSelectedPairs]
  )

  const handleTempRemovePair = useCallback(
    (pair: string) => {
      setTempSelectedPairs((prev) => prev.filter((p) => p !== pair))
    },
    [setTempSelectedPairs]
  )

  return {
    // Drag handlers
    handleDragStart,
    handleDragEnd,

    // Block handlers
    handleRemoveBlock,
    handleValueChange,

    // Rule group handlers
    addRuleGroup,
    removeRuleGroup,
    handleRuleNameChange,

    // Strategy handlers
    handleReset,
    handleDeploy,
    handlePreview,
    handleImportStrategy,
    handleSelectTemplate,
    loadStrategyFromJson,
    generateStrategyJson,

    // Mobile handlers
    handleMobileDropZoneClick,
    handleMobileBlockSelect,

    // Dialog handlers
    handleDetailsDialogDone,
    handleTempAddPair,
    handleTempRemovePair,

    // Utility functions
    getIntervalLabel,
  }
}
