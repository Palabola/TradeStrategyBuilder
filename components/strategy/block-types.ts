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
} from "lucide-react"

export type ConditionBlockType =
  | "increased-by"
  | "decreased-by"
  | "greater-than"
  | "lower-than"
  | "crossing-above"
  | "crossing-below"

export type ActionBlockType = "open-position" | "close-position" | "notify-me"

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

export interface Parameter {
  name: string
  type: "select" | "number" | "text" | "textarea"
  label: string
  options?: string[]
  placeholder?: string
  default?: string | number
}

export const candleOptions = ["5min", "15min", "1h", "4h", "6h", "24h"]

export const indicatorOptions = ["Price", "RSI", "MACD", "Moving Average", "Volume", "Bollinger Bands"]

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
        options: indicatorOptions,
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
    bgColor: "bg-orange/10 border-orange/30",
    category: "condition",
    parameters: [
      {
        name: "indicator",
        type: "select",
        label: "Indicator",
        options: indicatorOptions,
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
        options: indicatorOptions,
        default: "RSI",
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
        options: indicatorOptions,
        default: "Moving Average",
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
        options: indicatorOptions,
        default: "RSI",
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
        options: indicatorOptions,
        default: "Moving Average",
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
        options: indicatorOptions,
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
        options: indicatorOptions,
        default: "Moving Average",
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
        options: indicatorOptions,
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
        options: indicatorOptions,
        default: "Moving Average",
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
        options: ["USD", "%"],
        default: "USD",
      },
    ],
  },
  "close-position": {
    type: "close-position",
    label: "Close Position",
    description: "Close an existing position",
    icon: LogOut,
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
        options: ["USD", "%"],
        default: "%",
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
        options: ["Telegram", "Notification", "Email"],
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

export const actionBlocks: ActionBlockType[] = ["open-position", "close-position", "notify-me"]

export const availableBlocks: BlockType[] = [...conditionBlocks, ...actionBlocks]

export const tradingPairs = ["BTC/USD", "ETH/USD", "SOL/USD", "DOGE/USD", "XRP/USD", "ADA/USD"]
