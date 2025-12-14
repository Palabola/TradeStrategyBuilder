import {
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
import { BlockConfig, BlockType, IndicatorOption } from "../types"

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
  { label: "1x", value: "1" },
  { label: "5x", value: "5" },
  { label: "10x", value: "10" },
]

export const runIntervalOptions = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "12 hours", value: 720 },
  { label: "1 day", value: 1440 },
  { label: "1 week", value: 10080 },
]

export const blockConfigs: Record<BlockType, BlockConfig> = {
  "increased-by": {
    label: "Increased By",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => `${params.value}%`,
    description: "Trigger when indicator increases by value",
    promptDescription: "indicator1 in timeframe1 has increased by value% over timeframe1",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "Price",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "value",
          type: "number",
          label: "Percentage (%)",
          placeholder: "5",
          default: 5,
          required: true,
        },
      ],
    ],
  },
  "decreased-by": {
    label: "Decreased By",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => `${params.value}%`,
    description: "Trigger when indicator decreases by value",
    promptDescription: "indicator1 in timeframe1 has decreased by value% over timeframe1",
    icon: TrendingDown,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "Price",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "value",
          type: "number",
          label: "Percentage (%)",
          placeholder: "5",
          default: 5,
          required: true,
        },
      ],
    ],
  },
  "greater-than": {
    label: "Greater Than",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => params.indicator2 === "Value" ? `${params.value}` : `${params.indicator2} (${params.timeframe2})`,
    description: "Trigger when indicator exceeds another indicator",
    promptDescription: "indicator1 in timeframe1 is greater than indicator2 in timeframe2, or greater than 'value' if indicator2 is 'Value'",
    icon: ChevronUp,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10 border-violet-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "EMA(20)",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "conditionLabel",
          type: "label",
          label: "Greater Than",
        },
      ],
      [
        {
          name: "indicator2",
          type: "indicator",
          label: "Target Indicator",
          indicatorOptions: indicatorOptions,
          filterByIndicator: "indicator1",
          default: "MA",
          required: true,
        },
        {
          name: "timeframe2",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          hideWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
        {
          name: "value",
          type: "number",
          label: "Value",
          placeholder: "Enter value",
          default: 0,
          showWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
      ],
    ],
  },
  "lower-than": {
    label: "Lower Than",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => params.indicator2 === "Value" ? `${params.value}` : `${params.indicator2} (${params.timeframe2})`,
    description: "Trigger when indicator falls below another indicator",
    promptDescription: "indicator1 in timeframe1 is lower than indicator2 in timeframe2, or lower than 'value' if indicator2 is 'Value'",
    icon: ChevronDown,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10 border-pink-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "EMA(20)",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "conditionLabel",
          type: "label",
          label: "Lower Than",
        },
      ],
      [
        {
          name: "indicator2",
          type: "indicator",
          label: "Target Indicator",
          indicatorOptions: indicatorOptions,
          filterByIndicator: "indicator1",
          default: "MA",
          required: true,
        },
        {
          name: "timeframe2",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          hideWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
        {
          name: "value",
          type: "number",
          label: "Value",
          placeholder: "Enter value",
          default: 0,
          showWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
      ],
    ],
  },
  "crossing-above": {
    label: "Crossing Above",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => params.indicator2 === "Value" ? `${params.value}` : `${params.indicator2} (${params.timeframe2})`,
    description: "Trigger when indicator crosses above another indicator",
    promptDescription: "indicator1 in timeframe1 has crossed above indicator2 in timeframe2, or crossed above 'value' if indicator2 is 'Value'",
    icon: ArrowUpRight,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10 border-cyan-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "Price",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "conditionLabel",
          type: "label",
          label: "Crossing Above",
        },
      ],
      [
        {
          name: "indicator2",
          type: "indicator",
          label: "Target Indicator",
          indicatorOptions: indicatorOptions,
          filterByIndicator: "indicator1",
          default: "MA",
          required: true,
        },
        {
          name: "timeframe2",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          hideWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
        {
          name: "value",
          type: "number",
          label: "Value",
          placeholder: "Enter value",
          default: 0,
          showWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
      ],
    ],
  },
  "crossing-below": {
    label: "Crossing Below",
    labelPrefixFunction: (params) => `${params.indicator1} (${params.timeframe1})`,
    labelPostfixFunction: (params) => params.indicator2 === "Value" ? `${params.value}` : `${params.indicator2} (${params.timeframe2})`,
    description: "Trigger when indicator crosses below another indicator",
    promptDescription: "indicator1 in timeframe1 has crossed below indicator2 in timeframe2, or crossed below 'value' if indicator2 is 'Value'",
    icon: ArrowDownRight,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10 border-teal-500/30",
    category: "condition",
    parameters: [
      [
        {
          name: "indicator1",
          type: "indicator",
          label: "Indicator",
          indicatorOptions: indicatorOptions,
          default: "Price",
          required: true,
        },
        {
          name: "timeframe1",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          required: true,
        },
      ],
      [
        {
          name: "conditionLabel",
          type: "label",
          label: "Crossing Below",
        },
      ],
      [
        {
          name: "indicator2",
          type: "indicator",
          label: "Target Indicator",
          indicatorOptions: indicatorOptions,
          filterByIndicator: "indicator1",
          default: "MA",
          required: true,
        },
        {
          name: "timeframe2",
          type: "select",
          label: "Candles",
          options: candleOptions,
          default: "15min",
          hideWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
        {
          name: "value",
          type: "number",
          label: "Value",
          placeholder: "Enter value",
          default: 0,
          showWhen: { param: "indicator2", equals: "Value" },
          required: true,
        },
      ],
    ],
  },
  "open-position": {
    label: "Open",
    labelPostfixFunction: (params) => {
      let result = `${params.side} ${params.amount} ${params.unit}`
      if (params.leverage && params.leverage !== "No" && params.leverage !== "1x") {
        result += ` @ ${params.leverage}`
      }
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Open a new trading position",
    promptDescription: "Opens a new 'side' position for 'amount' of the currency in 'unit' using 'leverage'. Optionally setting 'stopLoss' and 'takeProfit' as percentages.",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    category: "action",
    parameters: [
      [
        {
          name: "side",
          type: "select",
          label: "Side",
          options: sideOptions,
          default: "LONG",
          required: true,
        },
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "leverage",
          type: "select",
          label: "Leverage",
          options: leverageOptions.map(l => l.label),
          default: "1x",
        },
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
  },
  "close-position": {
    label: "Close All Positions",
    description: "Close all open positions",
    promptDescription: "Closes all positions. No additional fields required.",
    icon: LogOut,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    category: "action",
    parameters: [],
  },
  "buy": {
    label: "Buy",
    labelPostfixFunction: (params) => {
      let result = `${params.amount} ${params.unit}`
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Execute a Market buy",
    promptDescription: "Buy 'amount' of the currency in 'unit'. Optionally setting 'stopLoss' and 'takeProfit' as percentages.",
    icon: ShoppingCart,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    category: "action",
    parameters: [
      [
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
  },
  "sell": {
    label: "Sell",
    labelPostfixFunction: (params) => {
      let result = `${params.amount} ${params.unit}`
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Execute a Market sell",
    promptDescription: "Sell 'amount' of the currency in 'unit'. Optionally setting 'stopLoss' and 'takeProfit' as percentages.",
    icon: Banknote,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    category: "action",
    parameters: [
      [
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
  },
  "buy-order": {
    label: "Buy Order",
    labelPostfixFunction: (params) => {
      let result = `${params.amount} ${params.unit}`
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Place a market buy order",
    promptDescription: "Places a buy order with specified order type, distance, and amount. Order types include Stop Loss, Take Profit, and Trailing Stop. Optionally can define stopLoss and takeProfit percentages.",
    icon: ShoppingCart,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    category: "action",
    parameters: [
      [
        {
          name: "orderType",
          type: "select",
          label: "Order Type",
          options: [
            "Stop Loss", "Take Profit", "Trailing Stop"
          ],
          default: "Stop Loss",
          required: true,
        },
        {
          name: "distance",
          type: "number",
          label: "Distance",
          default: 0.1,
          required: true,
        },
        {
          name: "distanceUnit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "%",
          required: true,
        },
      ],
      [ 
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
  },
  "sell-order": {
    label: "Sell Order",
    labelPostfixFunction: (params) => {
      let result = `${params.amount} ${params.unit}`
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Place a market sell order",
    promptDescription: "Places a sell order with specified order type, distance, and amount. Order types include Stop Loss, Take Profit, and Trailing Stop. Optionally can define stopLoss and takeProfit percentages.",
    icon: Banknote,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    category: "action",
    parameters: [
       [
        {
          name: "orderType",
          type: "select",
          label: "Order Type",
          options: [
            "Stop Loss", "Take Profit", "Trailing Stop"
          ],
          default: "Stop Loss",
          required: true,
        },
        {
          name: "distance",
          type: "number",
          label: "Distance",
          default: 0.1,
          required: true,
        },
        {
          name: "distanceUnit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "%",
          required: true,
        },
      ],
      [
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
  },
  "notify-me": {
    label: "Notify Me",
    labelPostfixFunction: (params) => `via ${params.channel}`,
    description: "Send a notification when conditions are met",
    promptDescription: "Sends a notification to 'channel' with content 'message'.",
    icon: Bell,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    category: "action",
    parameters: [
      [
        {
          name: "channel",
          type: "select",
          label: "Channel",
          options: channelOptions,
          default: "Notification",
          required: true,
        },
      ],
      [
        {
          name: "message",
          type: "textarea",
          label: "Message",
          placeholder: "Enter notification message",
          default: "Condition triggered!",
          required: true,
        },
      ],
    ],
  },
}

export const STATIC_SYSTEM_PROMPT_V1 = (
  tradeableSymbols: string[],
  usableIndicators: string[],
  candleLengths: string[],
  tradeUnits: string[],
  leverageValues: string[],
  configBlocks: Record<BlockType, BlockConfig>,
) => {
  // Generate dynamic lists from configBlocks
  const conditionBlocks = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "condition")
    .map(([_, config], index) => `${index + 1}. ${config.label}: ${config.description}`)

  const actionBlocks = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "action")
    .map(([_, config], index) => `${index + 1}. ${config.label}: ${config.description}`)

  // Generate dynamic lists from configBlocks
  const conditionBlocksRules = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "condition")
    .map(([key, config], index) => `${index + 1}. ${key}: ${config.promptDescription}`)

  const actionBlocksRules = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "action")
    .map(([key, config], index) => `${index + 1}. ${key}: ${config.promptDescription}`)

   // Generate dynamic lists from configBlocks
  const conditions = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "condition")
    .map(([key, _]) => `${key}`)

  const actions = Object.entries(configBlocks)
    .filter(([_, config]) => config.category === "action")
    .map(([key, _]) => `${key}`)


  return `
  #### Persona and role:
  - You are an expert cryptocurrency trading strategy developer. 

  #### Your goal:
   - Your task is to help creating trading strategy rules based on user requirements and your knowledge of trading.
   - You are have to translate the free text user requirements into formal strategy rules.

   ### Available resources:
   - Tradeable Symbols: ${tradeableSymbols.join(", ")}
   - Usable Indicators: ${usableIndicators.join(", ")}. There is a Special indicator called "Value" which represents a numeric constant value, it can be used to compare an indicator to a constant value.
   - Candle Lengths: ${candleLengths.join(", ")}
   - Trade Units: ${tradeUnits.join(", ")}
   - Leverage Values: ${leverageValues.join(", ")}
   - Execution Options: ${JSON.stringify(runIntervalOptions.map(o => o.value))}
   - Available trade rules: 
${conditionBlocks.map(rule => `      ${rule}`).join('\n')}
   - Available actions:
${actionBlocks.map(rule => `      ${rule}`).join('\n')}

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
         type: ${conditions.map(c => `"${c}"`).join(" | ")}
         options: {
          indicator1?: string
          timeframe1?: string
          indicator2?: string
          timeframe2?: string
          value?: number
          [key: string]: any
         }
       }[]
       actions: {
         index: number
         action: ${actions.map(a => `"${a}"`).join(" | ")}
         options: {
           side?: "LONG" | "SHORT"
           amount?: number
           unit?: string
           leverage?: string
           stopLoss?: number
           takeProfit?: number
           channel?: string
           message?: string
           [key: string]: any
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
${conditionBlocksRules.map(rule => `      ${rule}`).join('\n')}
    - Never use any other condition types!
    - Never use the fields not listed for each condition type!

    - Rules for each action:
${actionBlocksRules.map(rule => `      ${rule}`).join('\n')}
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
              options: {
                indicator1: "Price",
                timeframe1: "24h",
                value: 1,
              },
            },
          ],
          actions: [
            {
              index: 0,
              action: "buy",
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
          name: "Buy on low RSI",
          conditions: [
            {
              index: 0,
              type: "crossing-below",
              options: {
                indicator1: "RSI(14)",
                timeframe1: "4h",
                indicator2: "RSI(7)",
                timeframe2: "15min"
              }
            },
            {
              index: 1,
              type: "greater-than",
              options: {
                indicator1: "RSI(14)",
                timeframe1: "4h",
                indicator2: "Value",
                value: "30"
              }
            }
        ],
        actions: [
            {
            index: 0,
              action: "buy",
              options: {
                amount: 20,
                unit: "USD"
              }
            }
        ]
        },
        {
        name: "Sell on High RSI",
          conditions: [
            {
              index: 0,
              type: "greater-than",
              indicator1: "RSI(14)",
              timeframe1: "4h",
              indicator2: "RSI(14)",
              timeframe2: "15min"
            }
        ],
        actions: [
            {
            index: 0,
              action: "sell",
              options: {
                amount: 100,
                unit: "%"
              }
            }
        ]
        }
    ]
    }
    \`\`\`
  `
}