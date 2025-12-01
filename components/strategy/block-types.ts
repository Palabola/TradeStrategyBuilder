import {
  type LucideIcon,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  LogOut,
  Bell,
  ShoppingCart,
  Banknote,
} from "lucide-react"

export type ConditionBlockType =
  | "increased-by"
  | "decreased-by"
  | "greater-than"
  | "lower-than"
  | "crossing-above"
  | "crossing-below"

export type ActionBlockType = "open-position" | "close-position" | "buy" | "sell" | "notify-me"

export type BlockType = ConditionBlockType | ActionBlockType

export type BlockCategory = "condition" | "action"

export interface BlockConfig {
  type: BlockType
  label: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  category: BlockCategory
  parameters: Parameter[]
}

export interface IndicatorOption {
  name: string
  category: string;
}

export interface Parameter {
  name: string
  type: "select" | "number" | "text" | "textarea"
  label: string
  options?: string[]
  indicatorOptions?: IndicatorOption[]
  placeholder?: string
  default?: string | number
}

export interface PredefinedStrategyTemplate {
  id: string
  name: string
  description: string
  strategy: StrategyTemplate
}

export interface StrategyTemplate {
  strategyId?: string
  strategyName: string
  symbols: string[]
  rules: {
    name: string
    conditions: {
      index: number
      type: ConditionBlockType
      indicator1?: string
      timeframe1?: string
      indicator2?: string
      timeframe2?: string
      value?: number
    }[]
    actions: {
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
    }[]
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

export const tradingPairs = ["BTC/USD", "ETH/USD", "SOL/USD", "DOGE/USD", "XRP/USD", "ADA/USD"]

export const candleOptions = ["1min", "5min", "15min", "30min", "1h", "4h", "24h", "1w"]

export const indicatorOptions: IndicatorOption[] = [
  { name: "Price", category: "price" },
  { name: "MA", category: "price" },
  { name: "Value", category: "oscillator" },
  { name: "RSI(7)", category: "oscillator" },
  { name: "RSI(14)", category: "oscillator" }
]

export const unitOptions = ["USD", "%"]

export const channelOptions = ["Telegram", "Notification", "Email"]

export const sideOptions = ["LONG", "SHORT"]

export const leverageOptions = [
  { label: "No", value: "1" },
  { label: "5x", value: "5" },
  { label: "10x", value: "10" },
]

export const blockConfigs: Record<BlockType, BlockConfig> = {
  "increased-by": {
    type: "increased-by",
    label: "Increased By",
    description: "Trigger when indicator increases by value",
    icon: TrendingUp,
    color: "text-info",
    bgColor: "bg-info/10 border-info/30",
    category: "condition",
    parameters: [
      {
        name: "indicator",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "Price",
      },
      {
        name: "candles",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "value",
        type: "number",
        label: "Percentage (%)",
        placeholder: "5",
        default: 5,
      },
    ],
  },
  "decreased-by": {
    type: "decreased-by",
    label: "Decreased By",
    description: "Trigger when indicator decreases by value",
    icon: TrendingDown,
    color: "text-orange",
    bgColor: "bg-destructive/10 border-destructive/30",
    category: "condition",
    parameters: [
      {
        name: "indicator",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "Price",
      },
      {
        name: "candles",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "value",
        type: "number",
        label: "Percentage (%)",
        placeholder: "5",
        default: 5,
      },
    ],
  },
  "greater-than": {
    type: "greater-than",
    label: "Greater Than",
    description: "Trigger when indicator exceeds another indicator",
    icon: ChevronUp,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/30",
    category: "condition",
    parameters: [
      {
        name: "indicator1",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "EMA(20)",
      },
      {
        name: "candles1",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "indicator2",
        type: "select",
        label: "Target Indicator",
        indicatorOptions: indicatorOptions,
        default: "MA",
      },
      {
        name: "candles2",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
    ],
  },
  "lower-than": {
    type: "lower-than",
    label: "Lower Than",
    description: "Trigger when indicator falls below another indicator",
    icon: ChevronDown,
    color: "text-pink",
    bgColor: "bg-pink/10 border-pink/30",
    category: "condition",
    parameters: [
      {
        name: "indicator1",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "EMA(20)",
      },
      {
        name: "candles1",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "indicator2",
        type: "select",
        label: "Target Indicator",
        indicatorOptions: indicatorOptions,
        default: "MA",
      },
      {
        name: "candles2",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
    ],
  },
  "crossing-above": {
    type: "crossing-above",
    label: "Crossing Above",
    description: "Trigger when indicator crosses above another indicator",
    icon: ArrowUpRight,
    color: "text-cyan",
    bgColor: "bg-cyan/10 border-cyan/30",
    category: "condition",
    parameters: [
      {
        name: "indicator1",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "Price",
      },
      {
        name: "candles1",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "indicator2",
        type: "select",
        label: "Target Indicator",
        indicatorOptions: indicatorOptions,
        default: "MA",
      },
      {
        name: "candles2",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
    ],
  },
  "crossing-below": {
    type: "crossing-below",
    label: "Crossing Below",
    description: "Trigger when indicator crosses below another indicator",
    icon: ArrowDownRight,
    color: "text-teal",
    bgColor: "bg-teal/10 border-teal/30",
    category: "condition",
    parameters: [
      {
        name: "indicator1",
        type: "select",
        label: "Indicator",
        indicatorOptions: indicatorOptions,
        default: "Price",
      },
      {
        name: "candles1",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
      {
        name: "indicator2",
        type: "select",
        label: "Target Indicator",
        indicatorOptions: indicatorOptions,
        default: "MA",
      },
      {
        name: "candles2",
        type: "select",
        label: "Candles",
        options: candleOptions,
        default: "15min",
      },
    ],
  },
  "open-position": {
    type: "open-position",
    label: "Open Position",
    description: "Open a new trading position",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10 border-success/30",
    category: "action",
    parameters: [
      {
        name: "side",
        type: "select",
        label: "Side",
        options: sideOptions,
        default: "LONG",
      },
      {
        name: "amount",
        type: "number",
        label: "Amount",
        placeholder: "100",
        default: 100,
      },
      {
        name: "unit",
        type: "select",
        label: "Unit",
        options: unitOptions,
        default: "USD",
      },
      {
        name: "leverage",
        type: "select",
        label: "Leverage",
        options: leverageOptions.map(l => l.label),
        default: "No",
      },
      {
        name: "stopLoss",
        type: "number",
        label: "Stop Loss (%)",
        placeholder: "0",
        default: 0,
      },
      {
        name: "takeProfit",
        type: "number",
        label: "Take Profit (%)",
        placeholder: "0",
        default: 0,
      },
    ],
  },
  "close-position": {
    type: "close-position",
    label: "Close Positions",
    description: "Close all open positions",
    icon: LogOut,
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/30",
    category: "action",
    parameters: [],
  },
  "buy": {
    type: "buy",
    label: "Buy",
    description: "Execute a buy order",
    icon: ShoppingCart,
    color: "text-success",
    bgColor: "bg-success/10 border-success/30",
    category: "action",
    parameters: [
      {
        name: "amount",
        type: "number",
        label: "Amount",
        placeholder: "100",
        default: 100,
      },
      {
        name: "unit",
        type: "select",
        label: "Unit",
        options: unitOptions,
        default: "USD",
      },
    ],
  },
  "sell": {
    type: "sell",
    label: "Sell",
    description: "Execute a sell order",
    icon: Banknote,
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/30",
    category: "action",
    parameters: [
      {
        name: "amount",
        type: "number",
        label: "Amount",
        placeholder: "100",
        default: 100,
      },
      {
        name: "unit",
        type: "select",
        label: "Unit",
        options: unitOptions,
        default: "USD",
      },
    ],
  },
  "notify-me": {
    type: "notify-me",
    label: "Notify Me",
    description: "Send a notification when conditions are met",
    icon: Bell,
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/30",
    category: "action",
    parameters: [
      {
        name: "channel",
        type: "select",
        label: "Channel",
        options: channelOptions,
        default: "Notification",
      },
      {
        name: "message",
        type: "text",
        label: "Message",
        placeholder: "Enter notification message",
        default: "Condition triggered!",
      },
    ],
  },
}

export const conditionBlocks: ConditionBlockType[] = [
  "increased-by",
  "decreased-by",
  "greater-than",
  "lower-than",
  "crossing-above",
  "crossing-below",
]

export const actionBlocks: ActionBlockType[] = ["open-position", "close-position", "buy", "sell", "notify-me"]

export const availableBlocks: BlockType[] = [...conditionBlocks, ...actionBlocks]
