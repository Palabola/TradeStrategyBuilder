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
import { ActionBlockType, BlockType, ConditionBlockType, IndicatorOption } from "../types"

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
  indicatorOptions?: IndicatorOption[]
  placeholder?: string
  default?: string | number
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

export const runIntervalOptions = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "1 day", value: 1440 },
  { label: "1 week", value: 10080 },
  { label: "1 month", value: 43200 },
]

export const blockConfigs: Record<BlockType, BlockConfig> = {
  "increased-by": {
    type: "increased-by",
    label: "Increased By",
    description: "Trigger when indicator increases by value",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
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
        name: "timeframe1",
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
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 border-orange-500/30",
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
        name: "timeframe1",
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
    color: "text-violet-500",
    bgColor: "bg-violet-500/10 border-violet-500/30",
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
        name: "timeframe1",
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
        name: "timeframe2",
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
    color: "text-pink-500",
    bgColor: "bg-pink-500/10 border-pink-500/30",
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
        name: "timeframe1",
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
        name: "timeframe2",
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
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10 border-cyan-500/30",
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
        name: "timeframe1",
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
        name: "timeframe2",
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
    color: "text-teal-500",
    bgColor: "bg-teal-500/10 border-teal-500/30",
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
        name: "timeframe1",
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
        name: "timeframe2",
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
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
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
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    category: "action",
    parameters: [],
  },
  "buy": {
    type: "buy",
    label: "Buy",
    description: "Execute a buy order",
    icon: ShoppingCart,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
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
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
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
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30",
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

export const STATIC_SYSTEM_PROMPT_V1 = (
  tradeableSymbols: string[],
  usableIndicators: string[],
  candleLengths: string[],
  tradeUnits: string[],
) => {
  return `
  #### Persona and role:
  - You are an expert cryptocurrency trading strategy developer. 

  #### Your goal:
   - Your task is to help creating trading strategy rules based on user requirements and your knowledge of trading.
   - You are have to translate the free text user requirements into formal strategy rules.

   ### Available resources:
   - Tradeable Symbols: ${tradeableSymbols.join(", ")}
   - Usable Indicators: ${usableIndicators.join(", ")}
   - Candle Lengths: ${candleLengths.join(", ")}
   - Trade Units: ${tradeUnits.join(", ")}
   - Execution Options: ${JSON.stringify(runIntervalOptions.map(o => o.value))}
   - Available trade rules: 
      1. Increased By: usage the indicator has increased by a certain percentage over a specified timeframe.
      2. Decreased By: usage the indicator has decreased by a certain percentage over a specified timeframe.
      3. Crossed Above: usage the indicator has crossed above another indicator or value.
      4. Crossed Below: usage the indicator has crossed below another indicator or value.
      5. Greater Than: usage the indicator is greater than a certain value or another indicator.
      6. Less Than: usage the indicator is less than a certain value or another indicator.
   - Available actions: Open Position, Close Position, Buy, Sell, Notify Me

   ### Strategy building guidelines:
   - Build strategies by combining multiple rules and actions into a cohesive plan.
   - The strategy should implement at least one entry rule and one exit rule.
   - Only use indicators listed in the "Usable Indicators". Exact match is required!
   - Only use candle lengths listed in the "Candle Lengths". Exact match is required!
   - Only use trade units listed in the "Trade Units". Exact match is required!

   ### Response format:
   - Your response must be a valid JSON object with the following structure:
   \`\`\`
   StrategyTemplate {
     strategyName: string
     symbols: string[]
     executionOptions?: {
       runIntervalMinutes?: number
       maximumExecuteCount?: number
       intervalBetweenExecutionsMinutes?: number
       maximumOpenPositions?: number
     }
     rules: {
       name: string
       conditions: {
         index: number
         type: "increased-by" | "decreased-by" | "greater-than" | "lower-than" | "crossing-above" | "crossing-below"
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
           side?: "LONG" | "SHORT"
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
   }\`\`\`
    - Rules for execution Options:
      - runIntervalMinutes: The frequency at which the strategy is executed (in minutes).
      - maximumExecuteCount: The maximum number of times the strategy can be executed.
      - intervalBetweenExecutionsMinutes: The minimum time between consecutive executions (in minutes). Set to 0 for no delay.
      - maximumOpenPositions: The maximum number of open positions allowed for the strategy, only usable if 'OPEN' action is defined.

    - Rules for each condition:
    1 "increased-by": indicator1 has increased by value% over timeframe1
    2 "decreased-by": indicator1 has decreased by value% over timeframe1
    3 "greater-than": indicator1 in timeframe1 is greater than indicator2 in timeframe2
    4 "lower-than": indicator1 in timeframe1 is lower than indicator2 in timeframe2
    5 "crossing-above": indicator1 in timeframe1 has crossed above indicator2 in timeframe2
    6 "crossing-below": indicator1 in timeframe1 has crossed below indicator2 in timeframe2
    - Never use any other condition types!
    - Never use the fields not listed for each condition type!

    - Rules for each action:
        1 "OPEN": Opens a new 'side' position for 'amount' of the currency in 'unit' using 'leverage'. Optionally setting 'stopLoss' and 'takeProfit' as percentages.
        2 "CLOSE": Closes All positions. No additional fields required.
        3 "BUY": Buy 'amount' of the currency in 'unit'.
        4 "SELL": Sell 'amount' of the currency in 'unit'.
        5 "NOTIFY": Sends a notification to 'channel' with content 'message'.
    - 'symbols' is an array of 'Tradeable Symbols' should never be empty!
    - Never use any other action types!
    - Never use the fields not listed for each action type!
    - Never include explanations or any text outside the JSON object.

    ### Example responses:
    - Example 1:
    \`\`\`
     {
      strategyName: "Buy when price drops",
      symbols: ["BTC/USD", "ETH/USD"],
      executionOptions: {
        runIntervalMinutes: 360,
        maximumExecuteCount: 20,
        intervalBetweenExecutionsMinutes: 360,
        maximumOpenPositions: 1
      },
      rules: [
        {
          name: "Buy the Dip",
          conditions: [
            {
              index: 0,
              type: "decreased-by",
              indicator1: "Price",
              timeframe1: "24h",
              value: 1,
            },
          ],
          actions: [
            {
              index: 0,
              action: "BUY",
              options: {
                amount: 25,
                unit: "USD",
              },
            },
          ],
        },
      ],
    }
    \`\`\`
    - Example 2:
    \`\`\`
    {
   "strategyName": "RSI buy low sell high",
    "symbols": [
        "BTC/USD",
        "XRP/USD",
        "SOL/USD"
    ],
    executionOptions: {
        runIntervalMinutes: 30,
        maximumExecuteCount: 100,
        intervalBetweenExecutionsMinutes: 720,
        maximumOpenPositions: 10
    },
    "rules": [
        {
        "name": "Buy on low RSI",
        "conditions": [
            {
            "index": 0,
            "type": "lower-than",
            "indicator1": "RSI(14)",
            "timeframe1": "4h",
            "indicator2": "RSI(7)",
            "timeframe2": "15min"
            }
        ],
        "actions": [
            {
            "index": 0,
            "action": "BUY",
            "options": {
                "amount": 20,
                "unit": "USD"
            }
            }
        ]
        },
        {
        "name": "Sell on High RSI",
        "conditions": [
            {
            "index": 0,
            "type": "greater-than",
            "indicator1": "RSI(14)",
            "timeframe1": "4h",
            "indicator2": "RSI(14)",
            "timeframe2": "15min"
            }
        ],
        "actions": [
            {
            "index": 0,
            "action": "SELL",
            "options": {
                "amount": 100,
                "unit": "%"
            }
            }
        ]
        }
    ]
    }
    \`\`\`
  `
}