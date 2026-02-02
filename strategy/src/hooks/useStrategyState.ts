import { useState, useMemo } from "react"
import { BlockConfig, BlockType, ConditionBlockType, ActionBlockType, IndicatorOption, BlockCategory } from "../types"

/**
 * Represents a single block placed on the canvas with its configuration and values.
 */
export interface CanvasItem {
  id: string
  blockType: BlockType
  config: BlockConfig
  values: Record<string, string | number>
}

/**
 * Represents a rule group containing conditions and actions.
 */
export interface RuleGroup {
  id: string
  name: string
  conditionItems: CanvasItem[]
  actionItems: CanvasItem[]
}

/**
 * Configuration for creating custom block configs with overridden options.
 */
interface CustomBlockConfigsOptions {
  configOptions: Record<BlockType, BlockConfig>
  candleOptions: string[]
  indicatorOptions: IndicatorOption[]
  unitOptions: string[]
}

/**
 * Creates a modified blockConfigs object with custom options for timeframes, indicators, and units.
 */
function createCustomBlockConfigs({
  configOptions,
  candleOptions,
  indicatorOptions,
  unitOptions,
}: CustomBlockConfigsOptions): Record<BlockType, BlockConfig> {
  const customConfigs: Record<BlockType, BlockConfig> = {} as Record<BlockType, BlockConfig>

  for (const blockType of Object.keys(configOptions) as BlockType[]) {
    const original = configOptions[blockType]
    customConfigs[blockType] = {
      ...original,
      icon: original.icon,
      parameters: original.parameters.map((row) =>
        row.map((param) => {
          if (param.name.includes("timeframe")) {
            return { ...param, options: candleOptions }
          }
          if (param.type === "indicator") {
            return { ...param, indicatorOptions: indicatorOptions }
          }
          if (param.name === "unit") {
            return { ...param, options: unitOptions }
          }
          return { ...param }
        })
      ),
    }
  }

  return customConfigs
}

/**
 * Default rule groups for a new strategy.
 */
const DEFAULT_RULE_GROUPS: RuleGroup[] = [
  { id: "rule-1", name: "Buy Rule", conditionItems: [], actionItems: [] },
  { id: "rule-2", name: "Sell Rule", conditionItems: [], actionItems: [] },
]

/**
 * Default execution options values.
 */
const DEFAULT_EXECUTION_OPTIONS = {
  runIntervalMinutes: 60,
  maximumExecuteCount: 100,
  intervalBetweenExecutionsMinutes: 60,
  maximumOpenPositions: 1,
}

export interface UseStrategyStateProps {
  configOptions: Record<BlockType, BlockConfig>
  candleOptions: string[]
  indicatorOptions: IndicatorOption[]
  unitOptions: string[]
  initialStrategyId?: string
  supportedAIModels: string[]
}

export interface StrategyStateReturn {
  // Custom block configs (memoized)
  customBlockConfigs: Record<BlockType, BlockConfig>
  conditionBlocks: ConditionBlockType[]
  actionBlocks: ActionBlockType[]

  // Core strategy state
  strategyName: string
  setStrategyName: React.Dispatch<React.SetStateAction<string>>
  selectedPairs: string[]
  setSelectedPairs: React.Dispatch<React.SetStateAction<string[]>>
  ruleGroups: RuleGroup[]
  setRuleGroups: React.Dispatch<React.SetStateAction<RuleGroup[]>>
  currentStrategyId: string | undefined
  setCurrentStrategyId: React.Dispatch<React.SetStateAction<string | undefined>>

  // Drag state
  activeId: string | null
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>
  activeBlockType: BlockType | null
  setActiveBlockType: React.Dispatch<React.SetStateAction<BlockType | null>>
  activeConfig: BlockConfig | null
  setActiveConfig: React.Dispatch<React.SetStateAction<BlockConfig | null>>

  // UI state
  previewJson: string | null
  setPreviewJson: React.Dispatch<React.SetStateAction<string | null>>
  blockCategory: BlockCategory
  setBlockCategory: React.Dispatch<React.SetStateAction<BlockCategory>>

  // Dialog states
  importDialogOpen: boolean
  setImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  importJson: string
  setImportJson: React.Dispatch<React.SetStateAction<string>>
  importError: string | null
  setImportError: React.Dispatch<React.SetStateAction<string | null>>
  templatesDialogOpen: boolean
  setTemplatesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  detailsDialogOpen: boolean
  setDetailsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>

  // Mobile block picker
  mobileBlockPickerOpen: boolean
  setMobileBlockPickerOpen: React.Dispatch<React.SetStateAction<boolean>>
  mobileBlockPickerTarget: { groupId: string; category: BlockCategory } | null
  setMobileBlockPickerTarget: React.Dispatch<React.SetStateAction<{ groupId: string; category: BlockCategory } | null>>

  // AI Builder state
  aiDialogOpen: boolean
  setAiDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedAIModel: string
  setSelectedAIModel: React.Dispatch<React.SetStateAction<string>>
  aiPrompt: string
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>
  aiGeneratedJson: string
  setAiGeneratedJson: React.Dispatch<React.SetStateAction<string>>
  aiIsLoading: boolean
  setAiIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  aiError: string | null
  setAiError: React.Dispatch<React.SetStateAction<string | null>>

  // Execution options state
  runIntervalMinutes: number
  setRunIntervalMinutes: React.Dispatch<React.SetStateAction<number>>
  maximumExecuteCount: number
  setMaximumExecuteCount: React.Dispatch<React.SetStateAction<number>>
  intervalBetweenExecutionsMinutes: number
  setIntervalBetweenExecutionsMinutes: React.Dispatch<React.SetStateAction<number>>
  maximumOpenPositions: number
  setMaximumOpenPositions: React.Dispatch<React.SetStateAction<number>>

  // Computed values
  displayedBlocks: BlockType[]
}

/**
 * Custom hook that manages all strategy builder state.
 * Extracts state management from the main component for better organization and reusability.
 */
export function useStrategyState({
  configOptions,
  candleOptions,
  indicatorOptions,
  unitOptions,
  initialStrategyId,
  supportedAIModels,
}: UseStrategyStateProps): StrategyStateReturn {
  // Create custom block configs with the provided options (memoized to prevent infinite loops)
  const customBlockConfigs = useMemo(
    () => createCustomBlockConfigs({ configOptions, candleOptions, indicatorOptions, unitOptions }),
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

  // Core strategy state
  const [strategyName, setStrategyName] = useState("New Strategy")
  const [selectedPairs, setSelectedPairs] = useState<string[]>(["BTC/USD"])
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>(DEFAULT_RULE_GROUPS)
  const [currentStrategyId, setCurrentStrategyId] = useState<string | undefined>(initialStrategyId)

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null)
  const [activeConfig, setActiveConfig] = useState<BlockConfig | null>(null)

  // UI state
  const [previewJson, setPreviewJson] = useState<string | null>(null)
  const [blockCategory, setBlockCategory] = useState<BlockCategory>("condition")

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importJson, setImportJson] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Mobile block picker
  const [mobileBlockPickerOpen, setMobileBlockPickerOpen] = useState(false)
  const [mobileBlockPickerTarget, setMobileBlockPickerTarget] = useState<{
    groupId: string
    category: BlockCategory
  } | null>(null)

  // AI Builder state
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [selectedAIModel, setSelectedAIModel] = useState<string>(supportedAIModels[0] || "")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiGeneratedJson, setAiGeneratedJson] = useState<string>("")
  const [aiIsLoading, setAiIsLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Execution options state
  const [runIntervalMinutes, setRunIntervalMinutes] = useState<number>(DEFAULT_EXECUTION_OPTIONS.runIntervalMinutes)
  const [maximumExecuteCount, setMaximumExecuteCount] = useState<number>(DEFAULT_EXECUTION_OPTIONS.maximumExecuteCount)
  const [intervalBetweenExecutionsMinutes, setIntervalBetweenExecutionsMinutes] = useState<number>(
    DEFAULT_EXECUTION_OPTIONS.intervalBetweenExecutionsMinutes
  )
  const [maximumOpenPositions, setMaximumOpenPositions] = useState<number>(DEFAULT_EXECUTION_OPTIONS.maximumOpenPositions)

  // Computed values
  const displayedBlocks = blockCategory === "condition" ? conditionBlocks : actionBlocks

  return {
    // Custom block configs
    customBlockConfigs,
    conditionBlocks,
    actionBlocks,

    // Core strategy state
    strategyName,
    setStrategyName,
    selectedPairs,
    setSelectedPairs,
    ruleGroups,
    setRuleGroups,
    currentStrategyId,
    setCurrentStrategyId,

    // Drag state
    activeId,
    setActiveId,
    activeBlockType,
    setActiveBlockType,
    activeConfig,
    setActiveConfig,

    // UI state
    previewJson,
    setPreviewJson,
    blockCategory,
    setBlockCategory,

    // Dialog states
    importDialogOpen,
    setImportDialogOpen,
    importJson,
    setImportJson,
    importError,
    setImportError,
    templatesDialogOpen,
    setTemplatesDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,

    // Mobile block picker
    mobileBlockPickerOpen,
    setMobileBlockPickerOpen,
    mobileBlockPickerTarget,
    setMobileBlockPickerTarget,

    // AI Builder state
    aiDialogOpen,
    setAiDialogOpen,
    selectedAIModel,
    setSelectedAIModel,
    aiPrompt,
    setAiPrompt,
    aiGeneratedJson,
    setAiGeneratedJson,
    aiIsLoading,
    setAiIsLoading,
    aiError,
    setAiError,

    // Execution options state
    runIntervalMinutes,
    setRunIntervalMinutes,
    maximumExecuteCount,
    setMaximumExecuteCount,
    intervalBetweenExecutionsMinutes,
    setIntervalBetweenExecutionsMinutes,
    maximumOpenPositions,
    setMaximumOpenPositions,

    // Computed values
    displayedBlocks,
  }
}
