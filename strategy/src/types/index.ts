import { LucideIcon } from "lucide-react"
  
export interface Parameter {
  /**
   * The name of the parameter
   * Used for identifying the parameter in the strategy
   * Must be unique within the block
   */
  name: string
  type: "select" | "number" | "text" | "textarea" | "label" | "indicator"
  label: string
  /** For "select" type: provide available options */
  options?: string[]
  /** For "indicator" type: provide available indicator options */
  indicatorOptions?: IndicatorOption[]
  placeholder?: string
  default?: string | number
  /** Whether this parameter is required for validation */
  required?: boolean
  /** For "indicator" type: filter options by the category of another indicator parameter */
  filterByIndicator?: string
  /** For conditional rendering: only show this parameter when another parameter equals a specific value */
  showWhen?: { param: string; equals: string | number }
  /** For conditional rendering: only show this parameter when another parameter does NOT equal a specific value */
  hideWhen?: { param: string; equals: string | number }
}

export type BlockCategory = "condition" | "action"

export interface BlockConfig {
  label: string
  description: string
  promptDescription?: string
  labelPrefixFunction?: (params: Record<string, string | number>) => string
  labelPostfixFunction?: (params: Record<string, string | number>) => string
  icon: LucideIcon
  color: string
  bgColor: string
  category: BlockCategory
  parameters: Parameter[][]
}

export interface IndicatorOption {
  name: string
  category: string;
}

export interface StrategyBuilderProps {
  initialStrategy?: StrategyTemplate
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  configOptions?: Record<BlockType, BlockConfig>
  predefinedStrategies?: PredefinedStrategyTemplate[]
  onSave?: (strategy: StrategyTemplate) => void
  themeOverride?: CustomTheme
  supportedAIModels?: string[]
  callAIFunction?: ( systemPrompt: string, userPrompts: string[], model: string) => Promise<string>
}

export interface ActionType {
  index: number
  action: ActionBlockType
  options: {
    side?: string
    amount?: number
    unit?: string
    leverage?: string
    stopLoss?: number
    takeProfit?: number
    trailingStop?: number
    channel?: string
    message?: string
    orderType?: string
    [key: string]: any
  }
}

export type ConditionBlockType = string
export type ActionBlockType = string
export type BlockType = string

export interface ConditionType {
  index: number
  type: ConditionBlockType
  options: {
    indicator1?: string
    timeframe1?: string
    indicator2?: string
    timeframe2?: string
    value?: number
  }
}

export interface ExecutionOptions {
  runIntervalMinutes?: number
  maximumExecuteCount?: number
  intervalBetweenExecutionsMinutes?: number
  maximumOpenPositions?: number
}

export interface StrategyTemplate {
  strategyId?: string
  strategyName: string
  symbols: string[]
  executionOptions: ExecutionOptions
  rules: {
    name: string
    conditions: ConditionType[]
    actions: ActionType[]
  }[]
}

export interface CustomTheme {
  blocks: {
    [key in BlockType]?: {
      color?: string
      bgColor?: string
    }
  }
}

export interface PredefinedStrategyTemplate {
  id: string
  name: string
  description: string
  strategy: StrategyTemplate
}