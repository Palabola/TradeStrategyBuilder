
export interface IndicatorOption {
  name: string
  category: string;
}

export interface StrategyBuilderProps {
  strategyId?: string
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  channelOptions?: string[]
  predefinedStrategies?: PredefinedStrategyTemplate[]
  getStrategyById?: (id: string) => StrategyTemplate | null
  onSave?: (strategy: StrategyTemplate) => void
  themeOverride?: CustomTheme
  supportedAIModels?: string[]
  callAIFunction?: ( systemPrompt: string, userPrompts: string[], model: string) => Promise<string>
}

export interface ActionType {
  index: number
  action: "OPEN" | "CLOSE" |"BUY" | "SELL" | "NOTIFY"
  options: {
    side?: string
    amount?: number
    unit?: string
    leverage?: string
    stopLoss?: number
    takeProfit?: number
    channel?: string
    message?: string
  }
}

export type ConditionBlockType =
  | "increased-by"
  | "decreased-by"
  | "greater-than"
  | "lower-than"
  | "crossing-above"
  | "crossing-below"

export type ActionBlockType = "open-position" | "close-position" | "buy" | "sell" | "notify-me"

export type BlockType = ConditionBlockType | ActionBlockType

export interface ConditionType {
  index: number
  type: ConditionBlockType
  indicator1?: string
  timeframe1?: string
  indicator2?: string
  timeframe2?: string
  value?: number
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