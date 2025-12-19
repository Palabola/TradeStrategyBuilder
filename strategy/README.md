# @palabola86/trade-strategy-builder

A visual drag-and-drop trading strategy builder component for React and Next.js applications. Build complex trading strategies with an intuitive interface featuring condition blocks, action blocks, and rule-based logic.

[Live Demo](https://palabola.github.io/TradeStrategyBuilder)

![npm version](https://img.shields.io/npm/v/@palabola86/trade-strategy-builder)
![license](https://img.shields.io/npm/l/@palabola86/trade-strategy-builder)

## Features

- 🎯 **Drag-and-Drop Interface** - Intuitive block-based strategy building
- 📊 **Condition Blocks** - Price movements, indicator comparisons, crossovers
- ⚡ **Action Blocks** - Open/close positions, buy/sell, notifications
- 🧩 **Custom Block Configs** - Define your own blocks with custom parameters
- 🎨 **Customizable Themes** - Override colors and styles
- 🌙 **Dark Mode Support** - Full dark mode via CSS variables
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
  BlockType,
  BlockConfig,
} from "@palabola86/trade-strategy-builder"

interface StrategyBuilderProps {
  // Load existing strategy directly
  initialStrategy?: StrategyTemplate

  // Custom block configurations (extend or override default blocks)
  configOptions?: Record<BlockType, BlockConfig>

  // Custom dropdown options
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]

  // Predefined strategy templates
  predefinedStrategies?: PredefinedStrategyTemplate[]

  // Strategy persistence
  onSave?: (strategy: StrategyTemplate) => void

  // Callback on strategy change
  onStrategyChange?: (strategy: StrategyTemplate | null) => void

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

## Custom Block Configurations

You can define custom blocks or override existing ones using the `configOptions` prop:

```tsx
import { StrategyBuilder, blockConfigs, BlockConfig, BlockType } from "@palabola86/trade-strategy-builder"
import { DollarSign, Banknote, Bell } from "lucide-react"

// Define custom blocks
const customBlockConfigs: Record<BlockType, BlockConfig> = {
  "buy-limit": {
    label: "Buy Limit",
    description: "Place a buy limit order at a specified price",
    promptDescription: "Buy limit order at limitPrice. Optional stopLoss, takeProfit, trailingStop.",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    category: "action",
    // Parameters are a 2D array - each inner array is a row in the UI
    parameters: [
      // Row 1: Limit price settings
      [
        {
          name: "limitPrice",
          type: "number",
          label: "Limit Price",
          default: 0.5,
          required: true,
        },
        {
          name: "unitLimit",
          type: "select",
          label: "Unit",
          options: ["USD", "%"],
          default: "%",
          required: true,
        },
      ],
      // Row 2: Amount settings
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
          options: ["USD", "%"],
          default: "USD",
          required: true,
        },
      ],
      // Row 3: Stop loss / Take profit
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
      ],
    ],
  },
  "always": {
    label: "Always Trigger",
    description: "Always trigger the action regardless of conditions",
    promptDescription: "Always triggers the associated action block unconditionally.",
    icon: Bell,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    category: "condition",
    parameters: [], // No parameters needed
  },
}

// Use with StrategyBuilder
export default function CustomStrategyBuilder() {
  return (
    <StrategyBuilder
      configOptions={{
        ...blockConfigs, // Include default blocks
        ...customBlockConfigs, // Add/override with custom blocks
      }}
      onSave={(strategy) => console.log(strategy)}
    />
  )
}
```

### BlockConfig Interface

```typescript
interface BlockConfig {
  label: string                    // Display name
  description: string              // Tooltip description
  promptDescription?: string       // AI-friendly description for strategy generation
  labelPrefixFunction?: (params: Record<string, string | number>) => string
  labelPostfixFunction?: (params: Record<string, string | number>) => string
  icon: LucideIcon                 // Icon component from lucide-react
  color: string                    // Tailwind text color class
  bgColor: string                  // Tailwind bg/border color classes
  category: "condition" | "action" // Block category
  parameters: Parameter[][]        // 2D array - rows of parameters
}

interface Parameter {
  name: string                     // Unique identifier within the block
  type: "select" | "number" | "text" | "textarea" | "label" | "indicator"
  label: string                    // Display label
  options?: string[]               // For "select" type
  indicatorOptions?: IndicatorOption[]  // For "indicator" type
  placeholder?: string
  default?: string | number
  required?: boolean
  filterByIndicator?: string       // Filter options by another indicator's category
  showWhen?: { param: string; equals: string | number }  // Conditional rendering
  hideWhen?: { param: string; equals: string | number }  // Conditional hiding
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
  { name: "EMA(12)", category: "price" },
  { name: "RSI(14)", category: "oscillator" },
  { name: "MACD", category: "oscillator" },
  { name: "Volume", category: "volume" },
]

const customTimeframes = ["1min", "5min", "15min", "1h", "4h", "1d"]

export default function CustomStrategyBuilder() {
  const handleSave = (strategy: StrategyTemplate) => {
    localStorage.setItem(`strategy-${strategy.strategyId}`, JSON.stringify(strategy))
  }

  return (
    <StrategyBuilder
      indicatorOptions={customIndicators}
      candleOptions={customTimeframes}
      onSave={handleSave}
    />
  )
}
```

### Loading an Existing Strategy

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

// Load strategy from your storage
function getStrategyById(id: string): StrategyTemplate | null {
  const stored = localStorage.getItem(`strategy-${id}`)
  return stored ? JSON.parse(stored) : null
}

export default function EditStrategyPage({ strategyId }: { strategyId: string }) {
  // Fetch the strategy before rendering
  const existingStrategy = getStrategyById(strategyId)

  return (
    <StrategyBuilder
      initialStrategy={existingStrategy || undefined}
      onSave={(strategy) => {
        localStorage.setItem(`strategy-${strategy.strategyId}`, JSON.stringify(strategy))
      }}
    />
  )
}
```

### Custom Theme

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { CustomTheme } from "@palabola86/trade-strategy-builder"

const grayscaleTheme: CustomTheme = {
  blocks: {
    "increased-by": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "decreased-by": { color: "text-gray-600", bgColor: "bg-gray-100 border-gray-300" },
    "open-position": { color: "text-gray-700", bgColor: "bg-gray-200 border-gray-400" },
    // ... other blocks
  },
}

export default function ThemedStrategyBuilder() {
  return <StrategyBuilder themeOverride={grayscaleTheme} />
}
```

## Dark Mode Support

The Strategy Builder supports dark mode via CSS variables. Define your dark mode colors in your `globals.css`:

```css
/* Light mode (default) */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --primary: #8a61ff;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #0a0a0a;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #8a61ff;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #8a61ff;
}

/* Dark mode - add .dark class to html element */
.dark {
  --background: #16121f;
  --foreground: #fff;
  --card: #1f1b27;
  --card-foreground: #fff;
  --popover: #1f1b27;
  --popover-foreground: #fff;
  --primary: #8a61ff;
  --primary-foreground: #fff;
  --secondary: #686b8229;
  --secondary-foreground: #fff;
  --muted: #686b821f;
  --muted-foreground: #9497a9;
  --accent: #8a61ff;
  --accent-foreground: #fff;
  --destructive: #ff7386;
  --destructive-foreground: #fff;
  --border: #686b8252;
  --input: #686b8229;
  --ring: #8a61ff;
}
```

Create a dark mode toggle component:

```tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setIsDark(initialDark)
    if (initialDark) document.documentElement.classList.add("dark")
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle("dark", newIsDark)
    localStorage.setItem("theme", newIsDark ? "dark" : "light")
  }

  return (
    <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-accent">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
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
  executionOptions: ExecutionOptions
  rules: {
    name: string
    conditions: ConditionType[]
    actions: ActionType[]
  }[]
}

interface ExecutionOptions {
  runIntervalMinutes?: number
  maximumExecuteCount?: number
  intervalBetweenExecutionsMinutes?: number
  maximumOpenPositions?: number
}

interface ConditionType {
  index: number
  type: ConditionBlockType  // Block type name (e.g., "increased-by", "crossing-above")
  options: {
    indicator1?: string
    timeframe1?: string
    indicator2?: string
    timeframe2?: string
    value?: number
    [key: string]: any  // Custom parameters from your blocks
  }
}

interface ActionType {
  index: number
  action: ActionBlockType  // Block type name (e.g., "open-position", "buy", "notify-me")
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
    [key: string]: any  // Custom parameters from your blocks
  }
}
```

### Example Output

```json
{
  "strategyId": "abc123",
  "strategyName": "RSI Strategy",
  "symbols": ["BTC/USD"],
  "executionOptions": {
    "runIntervalMinutes": 15,
    "maximumExecuteCount": 10,
    "maximumOpenPositions": 2
  },
  "rules": [
    {
      "name": "Buy on RSI Oversold",
      "conditions": [
        {
          "index": 0,
          "type": "crossing-above",
          "options": {
            "indicator1": "RSI(14)",
            "timeframe1": "1h",
            "indicator2": "Value",
            "value": 30
          }
        }
      ],
      "actions": [
        {
          "index": 0,
          "action": "open-position",
          "options": {
            "side": "LONG",
            "amount": 100,
            "unit": "USD",
            "leverage": "1"
          }
        }
      ]
    }
  ]
}
```

## Predefined Strategy Templates

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { PredefinedStrategyTemplate } from "@palabola86/trade-strategy-builder"

const templates: PredefinedStrategyTemplate[] = [
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    description: "Buy when RSI drops below 30 and starts recovering",
    strategy: {
      strategyName: "RSI Oversold Bounce",
      symbols: ["BTC/USD"],
      executionOptions: { runIntervalMinutes: 15 },
      rules: [
        {
          name: "Buy on RSI Recovery",
          conditions: [
            {
              index: 0,
              type: "crossing-above",
              options: {
                indicator1: "RSI(14)",
                timeframe1: "1h",
                indicator2: "Value",
                value: 30,
              },
            },
          ],
          actions: [
            {
              index: 0,
              action: "open-position",
              options: { side: "LONG", amount: 100, unit: "USD" },
            },
          ],
        },
      ],
    },
  },
]

export default function TemplatesBuilder() {
  return <StrategyBuilder predefinedStrategies={templates} />
}
```

## AI-Powered Strategy Generation

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

const supportedModels = ["gpt-4", "claude-3", "grok"]

async function callAI(
  systemPrompt: string,
  userPrompts: string[],
  model: string
): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, systemPrompt, messages: userPrompts }),
  })
  const data = await response.json()
  return data.content
}

export default function AIStrategyBuilder() {
  return (
    <StrategyBuilder
      supportedAIModels={supportedModels}
      callAIFunction={callAI}
      onSave={(strategy) => console.log(strategy)}
    />
  )
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
