import { LucideIcon } from "lucide-react"
  
export interface Parameter {
  /**
   * The unique identifier for this parameter.
   * Used for referencing the parameter in the strategy configuration.
   * Must be unique within the block.
   */
  name: string
  /** The input type that determines how the parameter is rendered and validated */
  type: "select" | "number" | "text" | "textarea" | "label" | "indicator"
  /** The display label shown in the UI for this parameter */
  label: string
  /** Available options for "select" type parameters */
  options?: string[]
  /** Available indicator options for "indicator" type parameters */
  indicatorOptions?: IndicatorOption[]
  /** Placeholder text shown when the input is empty */
  placeholder?: string
  /** Default value used when initializing the parameter */
  default?: string | number
  /** Whether this parameter is required for validation */
  required?: boolean
  /** For "indicator" type: filters options by the category of another indicator parameter */
  filterByIndicator?: string
  /** Conditional rendering: shows this parameter only when another parameter equals a specific value */
  showWhen?: { param: string; equals: string | number }
  /** Conditional rendering: hides this parameter when another parameter equals a specific value */
  hideWhen?: { param: string; equals: string | number }
}

export type BlockCategory = "condition" | "action"

export interface BlockConfig {
  /** The label shown on the block in the block selector and builder */
  label: string
  /** A short description shown in the block selector */
  description?: string
  /**
   * A description sent to the AI for better understanding of the block's purpose, parameters, and usage.
   * Example: "indicator1 in timeframe1 has decreased by value% over timeframe1"
   */
  promptDescription?: string
  /** Function to generate a dynamic label prefix based on parameter values */
  labelPrefixFunction?: (params: Record<string, string | number>) => string
  /** Function to generate a dynamic label suffix based on parameter values */
  labelPostfixFunction?: (params: Record<string, string | number>) => string
  /** The icon component to display for this block */
  icon: LucideIcon
  /** The text color class for the block */
  color: string
  /** The background color class for the block */
  bgColor: string
  /** The category of the block (condition or action) */
  category: BlockCategory
  /**
   * Parameters for the block as a 2D array to support grouping in the UI.
   * Each inner array represents a row of parameters.
   * On small screens, all parameters will be stacked vertically.
   */
  parameters: Parameter[][]
}

/**
 * Configuration for indicators used in "indicator" type parameters.
 */
export interface IndicatorOption {
  /** Unique identifier for the indicator */
  name: string
  /**
   * Category of the indicator (e.g., "Trend", "Momentum", "Volume", "Volatility").
   * Indicators are grouped by category in the selector.
   * If filterByIndicator is set, only indicators from the matching category will be shown.
   */
  category: string;
}

export interface StrategyBuilderProps {
  /** Strategy to load initially. Use this to restore a cached or saved strategy. */
  initialStrategy?: StrategyTemplate
  /** Available candle timeframe options. Passed to the AI agent for better prompt generation. */
  candleOptions?: string[]
  /** Available indicator options. Passed to the AI agent for better prompt generation. */
  indicatorOptions?: IndicatorOption[]
  /** Available units of measurement options. Passed to the AI agent for better prompt generation. */
  unitOptions?: string[]
  /** Configuration for available blocks in the builder. If not provided, default blocks will be used. */
  configOptions?: Record<BlockType, BlockConfig>
  /** Predefined strategies that can be loaded into the builder. If not provided, the "Templates" button will be hidden. */
  predefinedStrategies?: PredefinedStrategyTemplate[]
  /** Callback invoked when the strategy is saved by pressing the "Deploy" button. */
  onSave?: (strategy: StrategyTemplate) => void
  /** Callback invoked when the strategy is changed. Can be used for autosave or live preview. */
  onStrategyChange?: (strategy: StrategyTemplate | null) => void
  /** Optional theme override for customizing block colors. Overrides colors defined in configOptions if both are provided. */
  themeOverride?: CustomTheme
  /** List of supported AI model identifiers for strategy generation. */
  supportedAIModels?: string[]
  /** Function to call the AI service. Should return the AI response as a string. */
  callAIFunction?: (systemPrompt: string, userPrompts: string[], model: string) => Promise<string>
}

export type ConditionBlockType = string
export type ActionBlockType = string
export type BlockType = string

export interface ConditionType {
  /** The index position of this condition within the rule */
  index: number
  /** The type identifier for this condition block */
  type: ConditionBlockType
  /**
   * Configuration options for this condition.
   * The available fields vary based on the condition type.
   * The defined values are used in the default configuration; additional values can be defined.
   */
  options: {
    indicator1?: string
    timeframe1?: string
    indicator2?: string
    timeframe2?: string
    value?: number
    [key: string]: string | number | undefined
  }
}

export interface ActionType {
  /** The index position of this action within the rule */
  index: number
  /** The type identifier for this action block */
  action: ActionBlockType
  /**
   * Configuration options for this action.
   * The available fields vary based on the action type.
   * The defined values are used in the default configuration; additional values can be defined.
   */
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
    [key: string]: string | number | undefined
  }
}

export interface ExecutionOptions {
  /** How often to evaluate the strategy (in minutes) */
  runIntervalMinutes?: number
  /** Maximum number of times to evaluate the strategy */
  maximumExecuteCount?: number
  /** Minimum interval between executions (in minutes) */
  intervalBetweenExecutionsMinutes?: number
  /** Maximum number of open positions allowed */
  maximumOpenPositions?: number
}

export interface StrategyTemplate {
  /** Unique identifier for the strategy */
  strategyId?: string
  /** Display name for the strategy */
  strategyName: string
  /** List of trading symbols/pairs this strategy applies to */
  symbols: string[]
  /** Execution configuration options */
  executionOptions: ExecutionOptions
  /** List of rules that define the strategy logic */
  rules: {
    /** Display name for the rule */
    name: string
    /** List of conditions that must be met to trigger the rule */
    conditions: ConditionType[]
    /** List of actions to execute when the rule is triggered */
    actions: ActionType[]
  }[]
}

/**
 * Theme configuration for customizing block appearance.
 * 
 * @example
 * ```typescript
 * const COLORED_THEME: CustomTheme = {
 *   blocks: {
 *     "increased-by": {
 *       color: "text-info",
 *       bgColor: "bg-info/10 border-info/30",
 *     },
 *     // ...additional blocks
 *   }
 * }
 * ```
 */
export interface CustomTheme {
  /** Block-specific color overrides keyed by block type */
  blocks: {
    [key in BlockType]?: {
      /** Text color class for the block */
      color?: string
      /** Background color class for the block */
      bgColor?: string
    }
  }
}

export interface PredefinedStrategyTemplate {
  /** Unique identifier for the template */
  id: string
  /** Display name shown in the templates selector */
  name: string
  /** Short description shown in the templates selector */
  description: string
  /** The strategy configuration to load when this template is selected */
  strategy: StrategyTemplate
}

export interface StrategyBuilderResult {
  /** Indicates whether the strategy generation was successful */
  success: boolean
  /** The generated strategy template (present when success is true) */
  data?: StrategyTemplate
  /** List of validation errors (present when success is false) */
  errors?: string[]
}