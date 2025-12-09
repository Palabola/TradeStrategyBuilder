# @palabola86/trade-strategy-builder

A visual drag-and-drop trading strategy builder component for React and Next.js applications. Build complex trading strategies with an intuitive interface featuring condition blocks, action blocks, and rule-based logic.

![npm version](https://img.shields.io/npm/v/@palabola86/trade-strategy-builder)
![license](https://img.shields.io/npm/l/@palabola86/trade-strategy-builder)

## Features

- 🎯 **Drag-and-Drop Interface** - Intuitive block-based strategy building
- 📊 **Condition Blocks** - Price movements, indicator comparisons, crossovers
- ⚡ **Action Blocks** - Open/close positions, buy/sell, notifications
- 🎨 **Customizable Themes** - Override colors and styles
- 🤖 **AI Builder Support** - Integrate with AI models to generate strategies
- 📱 **Responsive Design** - Works on desktop and mobile

## Installation

```bash
npm install @palabola86/trade-strategy-builder
```

or

```bash
yarn add @palabola86/trade-strategy-builder
```

or

```bash
pnpm add @palabola86/trade-strategy-builder
```

## Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react react-dom next
```

## Quick Start

### Basic Usage

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

export default function StrategyPage() {
  const handleSave = (strategy: StrategyTemplate) => {
    console.log("Strategy saved:", strategy)
    // Save to your backend or localStorage
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Strategy Builder</h1>
      <StrategyBuilder onSave={handleSave} />
    </div>
  )
}
```

### Tailwind CSS Configuration

Add the package source to your `globals.css` (or `globals.scss`) file:

```css
/* globals.css */
@import "tailwindcss";

/* Add this line to include the package styles */
@source "../node_modules/@palabola86/trade-strategy-builder/dist";
```

Alternatively, if you're using a `tailwind.config.ts` file, add the package to your content configuration:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Add the package
    "./node_modules/@palabola86/trade-strategy-builder/dist/**/*.{js,mjs}",
  ],
  // ... rest of config
}

export default config
```

## Configuration Options

### Full Props Interface

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type {
  StrategyTemplate,
  IndicatorOption,
  CustomTheme,
  PredefinedStrategyTemplate,
} from "@palabola86/trade-strategy-builder"

interface StrategyBuilderProps {
  // Load existing strategy by ID
  strategyId?: string

  // Custom dropdown options
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  channelOptions?: string[]

  // Predefined strategy templates
  predefinedStrategies?: PredefinedStrategyTemplate[]

  // Strategy persistence
  getStrategyById?: (id: string) => StrategyTemplate | null
  onSave?: (strategy: StrategyTemplate) => void

  // Theming
  themeOverride?: CustomTheme

  // AI Integration
  supportedAIModels?: string[]
  callAIFunction?: (
    systemPrompt: string,
    userPrompts: string[],
    model: string
  ) => Promise<string>
}
```

## Usage Examples

### Custom Indicators and Timeframes

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { IndicatorOption, StrategyTemplate } from "@palabola86/trade-strategy-builder"

const customIndicators: IndicatorOption[] = [
  { name: "Price", category: "price" },
  { name: "SMA(20)", category: "price" },
  { name: "SMA(50)", category: "price" },
  { name: "EMA(12)", category: "price" },
  { name: "EMA(26)", category: "price" },
  { name: "RSI(14)", category: "oscillator" },
  { name: "MACD", category: "oscillator" },
  { name: "Stochastic", category: "oscillator" },
  { name: "Bollinger Bands", category: "volatility" },
  { name: "ATR(14)", category: "volatility" },
  { name: "Volume", category: "volume" },
]

const customTimeframes = ["1min", "5min", "15min", "30min", "1h", "4h", "1d", "1w"]

const customUnits = ["USD", "EUR", "BTC", "%"]

export default function CustomStrategyBuilder() {
  const handleSave = (strategy: StrategyTemplate) => {
    localStorage.setItem(`strategy-${strategy.strategyId}`, JSON.stringify(strategy))
  }

  return (
    <StrategyBuilder
      indicatorOptions={customIndicators}
      candleOptions={customTimeframes}
      unitOptions={customUnits}
      onSave={handleSave}
    />
  )
}
```

### With Strategy Persistence

```tsx
"use client"

import { useState, useEffect } from "react"
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

const STORAGE_KEY = "saved-strategies"

function getSavedStrategies(): StrategyTemplate[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function getStrategyById(id: string): StrategyTemplate | null {
  const strategies = getSavedStrategies()
  return strategies.find((s) => s.strategyId === id) || null
}

function saveStrategy(strategy: StrategyTemplate): void {
  const strategies = getSavedStrategies()
  const existingIndex = strategies.findIndex((s) => s.strategyId === strategy.strategyId)
  
  if (existingIndex >= 0) {
    strategies[existingIndex] = strategy
  } else {
    strategies.push(strategy)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
}

export default function PersistentStrategyBuilder({ strategyId }: { strategyId?: string }) {
  return (
    <StrategyBuilder
      strategyId={strategyId}
      getStrategyById={getStrategyById}
      onSave={saveStrategy}
    />
  )
}
```

### Custom Theme

The Strategy Builder supports custom theming through the `themeOverride` prop for block colors, and CSS variables for UI elements.

#### Primary Button Colors

You can customize the primary button colors by defining the `--primary` CSS variable in your `globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

#### Block Theme Override

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { CustomTheme, StrategyTemplate } from "@palabola86/trade-strategy-builder"

// Grayscale theme example
const grayscaleTheme: CustomTheme = {
  blocks: {
    "increased-by": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "decreased-by": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "greater-than": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "lower-than": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "crossing-above": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "crossing-below": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "open-position": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
    "close-position": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
    "buy": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
    "sell": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
    "notify-me": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
  },
}

// Vibrant theme example
const vibrantTheme: CustomTheme = {
  blocks: {
    "increased-by": { color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/30" },
    "decreased-by": { color: "text-rose-500", bgColor: "bg-rose-500/10 border-rose-500/30" },
    "greater-than": { color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/30" },
    "lower-than": { color: "text-purple-500", bgColor: "bg-purple-500/10 border-purple-500/30" },
    "crossing-above": { color: "text-cyan-500", bgColor: "bg-cyan-500/10 border-cyan-500/30" },
    "crossing-below": { color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/30" },
    "open-position": { color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/30" },
    "close-position": { color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/30" },
    "buy": { color: "text-teal-500", bgColor: "bg-teal-500/10 border-teal-500/30" },
    "sell": { color: "text-orange-500", bgColor: "bg-orange-500/10 border-orange-500/30" },
    "notify-me": { color: "text-indigo-500", bgColor: "bg-indigo-500/10 border-indigo-500/30" },
  },
}

export default function ThemedStrategyBuilder() {
  return <StrategyBuilder themeOverride={vibrantTheme} />
}
```

### Predefined Strategy Templates

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { PredefinedStrategyTemplate, StrategyTemplate } from "@palabola86/trade-strategy-builder"

const predefinedStrategies: PredefinedStrategyTemplate[] = [
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    description: "Buy when RSI drops below 30 and starts recovering",
    strategy: {
      strategyName: "RSI Oversold Bounce",
      symbols: ["BTC/USD", "ETH/USD"],
      executionOptions: {
        runIntervalMinutes: 15,
        maximumExecuteCount: 10,
        intervalBetweenExecutionsMinutes: 60,
        maximumOpenPositions: 2,
      },
      rules: [
        {
          name: "Buy on RSI Recovery",
          conditions: [
            {
              index: 0,
              type: "crossing-above",
              indicator1: "RSI(14)",
              timeframe1: "1h",
              indicator2: "Value",
              value: 30,
            },
          ],
          actions: [
            {
              index: 0,
              action: "OPEN",
              options: {
                side: "LONG",
                amount: 100,
                unit: "USD",
                leverage: "No",
              },
            },
          ],
        },
        {
          name: "Take Profit",
          conditions: [
            {
              index: 0,
              type: "greater-than",
              indicator1: "RSI(14)",
              timeframe1: "1h",
              indicator2: "Value",
              value: 70,
            },
          ],
          actions: [
            {
              index: 0,
              action: "CLOSE",
              options: {},
            },
          ],
        },
      ],
    },
  },
  {
    id: "ma-crossover",
    name: "Moving Average Crossover",
    description: "Classic EMA 20/50 crossover strategy",
    strategy: {
      strategyName: "MA Crossover",
      symbols: ["BTC/USD"],
      executionOptions: {
        runIntervalMinutes: 60,
        maximumExecuteCount: 5,
        intervalBetweenExecutionsMinutes: 240,
        maximumOpenPositions: 1,
      },
      rules: [
        {
          name: "Golden Cross - Buy",
          conditions: [
            {
              index: 0,
              type: "crossing-above",
              indicator1: "EMA(20)",
              timeframe1: "4h",
              indicator2: "EMA(50)",
              timeframe2: "4h",
            },
          ],
          actions: [
            {
              index: 0,
              action: "BUY",
              options: { amount: 50, unit: "%" },
            },
          ],
        },
        {
          name: "Death Cross - Sell",
          conditions: [
            {
              index: 0,
              type: "crossing-below",
              indicator1: "EMA(20)",
              timeframe1: "4h",
              indicator2: "EMA(50)",
              timeframe2: "4h",
            },
          ],
          actions: [
            {
              index: 0,
              action: "SELL",
              options: { amount: 100, unit: "%" },
            },
          ],
        },
      ],
    },
  },
]

export default function TemplatesStrategyBuilder() {
  return <StrategyBuilder predefinedStrategies={predefinedStrategies} />
}
```

### AI-Powered Strategy Generation

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

const supportedModels = ["gpt-4", "gpt-3.5-turbo", "claude-3"]

async function callAI(
  systemPrompt: string,
  userPrompts: string[],
  model: string
): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      systemPrompt,
      messages: userPrompts,
    }),
  })

  if (!response.ok) {
    throw new Error("AI request failed")
  }

  const data = await response.json()
  return data.content
}

export default function AIStrategyBuilder() {
  const handleSave = (strategy: StrategyTemplate) => {
    console.log("Strategy saved:", strategy)
  }

  return (
    <StrategyBuilder
      supportedAIModels={supportedModels}
      callAIFunction={callAI}
      onSave={handleSave}
    />
  )
}
```

## Strategy JSON Structure

The component outputs a `StrategyTemplate` object:

```typescript
interface StrategyTemplate {
  strategyId?: string
  strategyName: string
  symbols: string[]
  executionOptions: {
    runIntervalMinutes?: number
    maximumExecuteCount?: number
    intervalBetweenExecutionsMinutes?: number
    maximumOpenPositions?: number
  }
  rules: {
    name: string
    conditions: ConditionType[]
    actions: ActionType[]
  }[]
}

interface ConditionType {
  index: number
  type: "increased-by" | "decreased-by" | "greater-than" | "lower-than" | "crossing-above" | "crossing-below"
  indicator1?: string
  timeframe1?: string
  indicator2?: string
  timeframe2?: string
  value?: number
}

interface ActionType {
  index: number
  action: "OPEN" | "CLOSE" | "BUY" | "SELL" | "NOTIFY"
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
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © [Palabola](https://github.com/Palabola)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/Palabola/TradeStrategyBuilder)
- [NPM Package](https://www.npmjs.com/package/@palabola86/trade-strategy-builder)
- [Demo](https://github.com/Palabola/TradeStrategyBuilder/tree/main/demo)
