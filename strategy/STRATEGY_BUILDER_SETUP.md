# Strategy Builder - Setup Guide for AI Agents

> Step-by-step integration guide for `@palabola86/trade-strategy-builder`

---

## 🚀 Installation

### 1. Install the Package

```bash
# npm
npm install @palabola86/trade-strategy-builder

# yarn
yarn add @palabola86/trade-strategy-builder

# pnpm
pnpm add @palabola86/trade-strategy-builder
```

### 2. Verify Peer Dependencies

The package requires these peer dependencies:

```json
{
  "peerDependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "next": "^16.x"
  }
}
```

If not installed, add them:
```bash
npm install react react-dom next
```

---

## ⚙️ Configuration

### 1. Tailwind CSS Setup (Required)

Add the package to your Tailwind content paths. Choose one method:

**Method A: Using `@source` in globals.css (Recommended)**

```css
/* globals.css */
@import "tailwindcss";

/* Add this line to include the package styles */
@source "../node_modules/@palabola86/trade-strategy-builder/dist";
```

**Method B: Using tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Add this line for the package styles to work
    "./node_modules/@palabola86/trade-strategy-builder/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

### 2. Create the Strategy Page

Create a client component for the strategy builder:

```tsx
// app/strategy/page.tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

export default function StrategyPage() {
  const handleSave = (strategy: StrategyTemplate) => {
    console.log("Strategy saved:", strategy)
    // Implement your save logic
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Strategy Builder</h1>
      <StrategyBuilder onSave={handleSave} />
    </div>
  )
}
```

---

## 🔧 Integration Patterns

### Pattern 1: LocalStorage Persistence

```tsx
// lib/strategy-storage.ts
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"

const STORAGE_KEY = "strategies"

export function getStrategies(): StrategyTemplate[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getStrategyById(id: string): StrategyTemplate | null {
  return getStrategies().find((s) => s.strategyId === id) || null
}

export function saveStrategy(strategy: StrategyTemplate): void {
  const strategies = getStrategies()
  const idx = strategies.findIndex((s) => s.strategyId === strategy.strategyId)
  if (idx >= 0) {
    strategies[idx] = strategy
  } else {
    strategies.push(strategy)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
}
```

```tsx
// app/strategy/[id]/page.tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import { getStrategyById, saveStrategy } from "@/lib/strategy-storage"
import { useParams } from "next/navigation"
import { useMemo } from "react"

export default function EditStrategyPage() {
  const { id } = useParams<{ id: string }>()
  
  // Load strategy before rendering
  const initialStrategy = useMemo(() => getStrategyById(id), [id])

  return (
    <StrategyBuilder
      initialStrategy={initialStrategy || undefined}
      onSave={saveStrategy}
    />
  )
}
```

### Pattern 2: API Backend Integration

```tsx
// app/strategy/page.tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { StrategyTemplate } from "@palabola86/trade-strategy-builder"
import { useEffect, useState } from "react"

export default function StrategyPage({ strategyId }: { strategyId?: string }) {
  const [initialStrategy, setInitialStrategy] = useState<StrategyTemplate | undefined>()
  const [loading, setLoading] = useState(!!strategyId)

  useEffect(() => {
    if (strategyId) {
      fetch(`/api/strategies/${strategyId}`)
        .then(res => res.json())
        .then(data => {
          setInitialStrategy(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [strategyId])

  const handleSave = async (strategy: StrategyTemplate) => {
    await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strategy),
    })
  }

  if (loading) return <div>Loading...</div>

  return (
    <StrategyBuilder
      initialStrategy={initialStrategy}
      onSave={handleSave}
    />
  )
}
```

### Pattern 3: Custom Block Configurations

```tsx
import { StrategyBuilder, blockConfigs, BlockConfig, BlockType } from "@palabola86/trade-strategy-builder"
import { DollarSign, Banknote, Bell } from "lucide-react"

// Define custom blocks
const customBlockConfigs: Record<string, BlockConfig> = {
  // Custom action block
  "buy-limit": {
    label: "Buy Limit",
    description: "Place a buy limit order at a specified price",
    promptDescription: "Buy limit order at limitPrice. stopLoss and takeProfit are optional.",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    category: "action",
    // Parameters are a 2D array - each inner array becomes a row in the UI
    parameters: [
      // Row 1: Price settings
      [
        {
          name: "limitPrice",
          type: "number",
          label: "Limit Price",
          default: 0.5,
          required: true,
        },
        {
          name: "priceUnit",
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
          name: "amountUnit",
          type: "select",
          label: "Unit",
          options: ["USD", "%"],
          default: "USD",
          required: true,
        },
      ],
      // Row 3: Risk management
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
  // Custom condition block
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

export default function CustomBlocksBuilder() {
  return (
    <StrategyBuilder
      configOptions={{
        ...blockConfigs,       // Include all default blocks
        ...customBlockConfigs, // Add/override with custom blocks
      }}
      onSave={(s) => console.log(s)}
    />
  )
}
```

### Pattern 4: Custom Indicators & Timeframes

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { IndicatorOption } from "@palabola86/trade-strategy-builder"

const indicators: IndicatorOption[] = [
  // Price indicators
  { name: "Price", category: "price" },
  { name: "SMA(10)", category: "price" },
  { name: "SMA(20)", category: "price" },
  { name: "SMA(50)", category: "price" },
  { name: "SMA(200)", category: "price" },
  { name: "EMA(12)", category: "price" },
  { name: "EMA(26)", category: "price" },
  
  // Oscillators
  { name: "RSI(7)", category: "oscillator" },
  { name: "RSI(14)", category: "oscillator" },
  { name: "MACD", category: "oscillator" },
  { name: "Stochastic", category: "oscillator" },
  
  // Volatility
  { name: "ATR(14)", category: "volatility" },
  { name: "Bollinger Upper", category: "volatility" },
  { name: "Bollinger Lower", category: "volatility" },
  
  // Volume
  { name: "Volume", category: "volume" },
  { name: "OBV", category: "volume" },
  
  // Special
  { name: "Value", category: "oscillator" }, // For numeric comparisons
]

const timeframes = ["1min", "5min", "15min", "30min", "1h", "4h", "1d", "1w"]

const units = ["USD", "EUR", "BTC", "%"]

export default function CustomBuilder() {
  return (
    <StrategyBuilder
      indicatorOptions={indicators}
      candleOptions={timeframes}
      unitOptions={units}
      onSave={(s) => console.log(s)}
    />
  )
}
```

### Pattern 5: AI Integration

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

const AI_MODELS = ["gpt-4o", "gpt-4", "claude-3-opus", "claude-3-sonnet", "grok"]

async function callAI(
  systemPrompt: string,
  userPrompts: string[],
  model: string
): Promise<string> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      systemPrompt,
      messages: userPrompts.map((content) => ({ role: "user", content })),
    }),
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content
}

export default function AIStrategyBuilder() {
  return (
    <StrategyBuilder
      supportedAIModels={AI_MODELS}
      callAIFunction={callAI}
      onSave={(s) => console.log(s)}
    />
  )
}
```

---

## 🎨 Theming Setup

### Block Theme Override

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { CustomTheme } from "@palabola86/trade-strategy-builder"

// Grayscale theme
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

export default function ThemedBuilder() {
  return <StrategyBuilder themeOverride={grayscaleTheme} />
}
```

### Dark Mode via CSS Variables

Add dark mode support in your `globals.css`:

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
  --success: #22c55e;
  --warning: #eab308;
  --info: #3b82f6;
}

/* Dark mode - toggle .dark class on <html> */
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
  --success: #35df8d;
  --warning: #ffcd60;
  --info: #00adfe;
}
```

Create a dark mode toggle:

```tsx
// components/dark-mode-toggle.tsx
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
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
```

---

## 📦 Predefined Templates Setup

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { PredefinedStrategyTemplate } from "@palabola86/trade-strategy-builder"

const templates: PredefinedStrategyTemplate[] = [
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    description: "Opens position when RSI recovers from oversold conditions",
    strategy: {
      strategyName: "RSI Oversold Bounce",
      symbols: ["BTC/USD"],
      executionOptions: {
        runIntervalMinutes: 15,
        maximumExecuteCount: 10,
        intervalBetweenExecutionsMinutes: 60,
        maximumOpenPositions: 2,
      },
      rules: [
        {
          name: "Entry Rule",
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
              options: {
                side: "LONG",
                amount: 100,
                unit: "USD",
                leverage: "1",
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: "ma-crossover",
    name: "MA Crossover",
    description: "Classic moving average crossover strategy",
    strategy: {
      strategyName: "MA Crossover",
      symbols: ["BTC/USD", "ETH/USD"],
      executionOptions: {
        runIntervalMinutes: 60,
        maximumExecuteCount: 5,
        intervalBetweenExecutionsMinutes: 240,
        maximumOpenPositions: 1,
      },
      rules: [
        {
          name: "Golden Cross",
          conditions: [
            {
              index: 0,
              type: "crossing-above",
              options: {
                indicator1: "EMA(20)",
                timeframe1: "4h",
                indicator2: "EMA(50)",
                timeframe2: "4h",
              },
            },
          ],
          actions: [
            { index: 0, action: "buy", options: { amount: 50, unit: "%" } },
          ],
        },
        {
          name: "Death Cross",
          conditions: [
            {
              index: 0,
              type: "crossing-below",
              options: {
                indicator1: "EMA(20)",
                timeframe1: "4h",
                indicator2: "EMA(50)",
                timeframe2: "4h",
              },
            },
          ],
          actions: [
            { index: 0, action: "sell", options: { amount: 100, unit: "%" } },
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

---

## ✅ Setup Checklist

- [ ] Package installed: `npm install @palabola86/trade-strategy-builder`
- [ ] Peer dependencies verified: `react`, `react-dom`, `next`
- [ ] Tailwind config updated with package path or `@source` directive
- [ ] Strategy page created with `"use client"` directive
- [ ] `onSave` callback implemented
- [ ] (Optional) Custom block configurations defined
- [ ] (Optional) Custom indicators/timeframes configured
- [ ] (Optional) Strategy persistence implemented via `initialStrategy`
- [ ] (Optional) AI integration configured
- [ ] (Optional) Custom theme applied via `themeOverride`
- [ ] (Optional) Dark mode CSS variables defined
- [ ] (Optional) Predefined templates added

---

## 🐛 Troubleshooting

### Styles not working
- Verify Tailwind content includes the package path
- Check that `@source` directive is correct
- Run `npm run build` to regenerate Tailwind CSS

### Hydration errors
- Ensure `"use client"` directive is at the top of the file
- Wrap localStorage access in `typeof window !== "undefined"` checks
- Load `initialStrategy` before rendering, not in useEffect

### TypeScript errors
- Import types with `import type { ... }` syntax
- Ensure `@types/react` version matches React version
- Check that custom block parameter names are unique

### Drag-and-drop not working
- Check that `@dnd-kit/core` and `@dnd-kit/sortable` are not duplicated
- These are bundled with the package, don't install separately

### Custom blocks not appearing
- Verify `category` is set to `"condition"` or `"action"`
- Check that `configOptions` includes both `blockConfigs` and your custom blocks
- Ensure icon is a valid LucideIcon component

### Dark mode not working
- Verify `.dark` class is being added to `<html>` element
- Check CSS variables are defined in `.dark` selector
- Ensure `@custom-variant dark` is set if using Tailwind v4
