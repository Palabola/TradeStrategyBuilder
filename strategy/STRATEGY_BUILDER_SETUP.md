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
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "next": "16.0.7"
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

Add the package to your Tailwind content paths:

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

export default function EditStrategyPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <StrategyBuilder
      strategyId={id}
      getStrategyById={getStrategyById}
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

async function fetchStrategyById(id: string): Promise<StrategyTemplate | null> {
  const res = await fetch(`/api/strategies/${id}`)
  if (!res.ok) return null
  return res.json()
}

async function saveStrategy(strategy: StrategyTemplate): Promise<void> {
  await fetch("/api/strategies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(strategy),
  })
}

export default function StrategyPage({ strategyId }: { strategyId?: string }) {
  return (
    <StrategyBuilder
      strategyId={strategyId}
      getStrategyById={fetchStrategyById}
      onSave={saveStrategy}
    />
  )
}
```

### Pattern 3: Custom Indicators & Timeframes

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

const channels = ["Telegram", "Discord", "Email", "Push"]

export default function CustomBuilder() {
  return (
    <StrategyBuilder
      indicatorOptions={indicators}
      candleOptions={timeframes}
      unitOptions={units}
      channelOptions={channels}
      onSave={(s) => console.log(s)}
    />
  )
}
```

### Pattern 4: AI Integration

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

const AI_MODELS = ["gpt-4o", "gpt-4", "claude-3-opus", "claude-3-sonnet"]

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

### Custom Theme Example

```tsx
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"
import type { CustomTheme } from "@palabola86/trade-strategy-builder"

// Dark mode friendly theme
const darkTheme: CustomTheme = {
  blocks: {
    // Condition blocks
    "increased-by": {
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/30 border-emerald-500/40",
    },
    "decreased-by": {
      color: "text-rose-400",
      bgColor: "bg-rose-900/30 border-rose-500/40",
    },
    "greater-than": {
      color: "text-blue-400",
      bgColor: "bg-blue-900/30 border-blue-500/40",
    },
    "lower-than": {
      color: "text-purple-400",
      bgColor: "bg-purple-900/30 border-purple-500/40",
    },
    "crossing-above": {
      color: "text-cyan-400",
      bgColor: "bg-cyan-900/30 border-cyan-500/40",
    },
    "crossing-below": {
      color: "text-amber-400",
      bgColor: "bg-amber-900/30 border-amber-500/40",
    },
    // Action blocks
    "open-position": {
      color: "text-green-400",
      bgColor: "bg-green-900/30 border-green-500/40",
    },
    "close-position": {
      color: "text-red-400",
      bgColor: "bg-red-900/30 border-red-500/40",
    },
    "buy": {
      color: "text-teal-400",
      bgColor: "bg-teal-900/30 border-teal-500/40",
    },
    "sell": {
      color: "text-orange-400",
      bgColor: "bg-orange-900/30 border-orange-500/40",
    },
    "notify-me": {
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/30 border-indigo-500/40",
    },
  },
}

export default function ThemedBuilder() {
  return <StrategyBuilder themeOverride={darkTheme} />
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
              indicator1: "EMA(20)",
              timeframe1: "4h",
              indicator2: "EMA(50)",
              timeframe2: "4h",
            },
          ],
          actions: [
            { index: 0, action: "BUY", options: { amount: 50, unit: "%" } },
          ],
        },
        {
          name: "Death Cross",
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
            { index: 0, action: "SELL", options: { amount: 100, unit: "%" } },
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
- [ ] Tailwind config updated with package path
- [ ] Strategy page created with `"use client"` directive
- [ ] `onSave` callback implemented
- [ ] (Optional) Custom indicators configured
- [ ] (Optional) Strategy persistence implemented
- [ ] (Optional) AI integration configured
- [ ] (Optional) Custom theme applied
- [ ] (Optional) Predefined templates added

---

## 🐛 Troubleshooting

### Styles not working
- Verify Tailwind content includes the package path
- Run `npm run build` to regenerate Tailwind CSS

### Hydration errors
- Ensure `"use client"` directive is at the top of the file
- Wrap localStorage access in `typeof window !== "undefined"` checks

### TypeScript errors
- Import types with `import type { ... }` syntax
- Ensure `@types/react` version matches React version

### Drag-and-drop not working
- Check that `@dnd-kit/core` and `@dnd-kit/sortable` are not duplicated
- These are bundled with the package, don't install separately
