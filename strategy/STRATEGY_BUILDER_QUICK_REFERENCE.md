# Strategy Builder - Quick Reference for AI Agents

> **Package**: `@palabola86/trade-strategy-builder`  
> **Version**: 1.0.0  
> **Type**: React/Next.js visual trading strategy builder component

---

## 🎯 What This Package Does

A drag-and-drop visual component for building trading strategies. Users create rules with **conditions** (when to trigger) and **actions** (what to do).

---

## 📦 Main Exports

```typescript
// Main Component
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

// Types
import type {
  StrategyTemplate,           // Full strategy structure
  StrategyBuilderProps,       // Component props
  ConditionType,              // Condition block data
  ActionType,                 // Action block data
  BlockType,                  // All block type strings
  ConditionBlockType,         // Condition block type strings
  ActionBlockType,            // Action block type strings
  IndicatorOption,            // { name: string, category: string }
  CustomTheme,                // Theme override structure
  PredefinedStrategyTemplate, // Template with metadata
  ExecutionOptions,           // Strategy execution settings
} from "@palabola86/trade-strategy-builder"

// Constants
import {
  blockConfigs,       // Record<BlockType, BlockConfig>
  conditionBlocks,    // BlockConfig[]
  actionBlocks,       // BlockConfig[]
  tradingPairs,       // string[]
  candleOptions,      // string[] - timeframes
  indicatorOptions,   // IndicatorOption[]
  unitOptions,        // string[]
  channelOptions,     // string[]
  runIntervalOptions, // { label: string, value: number }[]
  leverageOptions,    // { label: string, value: string }[]
  sideOptions,        // string[]
} from "@palabola86/trade-strategy-builder"

// Sub-components (for customization)
import {
  CanvasBlock,
  DraggableBlock,
  RuleDropZone,
} from "@palabola86/trade-strategy-builder"
```

---

## 🧩 Block Types

### Condition Blocks (trigger conditions)
| Type | Description | Key Parameters |
|------|-------------|----------------|
| `increased-by` | Indicator increased by % | `indicator1`, `timeframe1`, `value` |
| `decreased-by` | Indicator decreased by % | `indicator1`, `timeframe1`, `value` |
| `greater-than` | Indicator > another | `indicator1`, `timeframe1`, `indicator2`, `timeframe2` |
| `lower-than` | Indicator < another | `indicator1`, `timeframe1`, `indicator2`, `timeframe2` |
| `crossing-above` | Indicator crosses above | `indicator1`, `timeframe1`, `indicator2`, `timeframe2` |
| `crossing-below` | Indicator crosses below | `indicator1`, `timeframe1`, `indicator2`, `timeframe2` |

### Action Blocks (execute actions)
| Type | Description | Key Options |
|------|-------------|-------------|
| `open-position` | Open trading position | `side`, `amount`, `unit`, `leverage`, `stopLoss`, `takeProfit` |
| `close-position` | Close position | (none) |
| `buy` | Buy asset | `amount`, `unit` |
| `sell` | Sell asset | `amount`, `unit` |
| `notify-me` | Send notification | `channel`, `message` |

---

## 📋 Core Type Definitions

### StrategyTemplate (output format)
```typescript
interface StrategyTemplate {
  strategyId?: string
  strategyName: string
  symbols: string[]                    // e.g., ["BTC/USD", "ETH/USD"]
  executionOptions: ExecutionOptions
  rules: {
    name: string
    conditions: ConditionType[]
    actions: ActionType[]
  }[]
}
```

### ConditionType
```typescript
interface ConditionType {
  index: number
  type: ConditionBlockType
  indicator1?: string      // e.g., "Price", "RSI(14)", "EMA(20)"
  timeframe1?: string      // e.g., "1min", "1h", "4h"
  indicator2?: string      // For comparison conditions
  timeframe2?: string
  value?: number           // For increased-by/decreased-by
}
```

### ActionType
```typescript
interface ActionType {
  index: number
  action: "OPEN" | "CLOSE" | "BUY" | "SELL" | "NOTIFY"
  options: {
    side?: string          // "LONG" | "SHORT"
    amount?: number
    unit?: string          // "USD" | "%"
    leverage?: string      // "1" | "5" | "10"
    stopLoss?: number
    takeProfit?: number
    channel?: string       // "Telegram" | "Notification" | "Email"
    message?: string
  }
}
```

### StrategyBuilderProps
```typescript
interface StrategyBuilderProps {
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
  callAIFunction?: (systemPrompt: string, userPrompts: string[], model: string) => Promise<string>
}
```

---

## ⚡ Quick Usage

### Minimal Example
```tsx
"use client"
import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

export default function Page() {
  return <StrategyBuilder onSave={(s) => console.log(s)} />
}
```

### With Custom Options
```tsx
<StrategyBuilder
  indicatorOptions={[
    { name: "Price", category: "price" },
    { name: "SMA(20)", category: "price" },
    { name: "RSI(14)", category: "oscillator" },
  ]}
  candleOptions={["5min", "15min", "1h", "4h", "1d"]}
  onSave={handleSave}
/>
```

---

## 🎨 Theme Customization

```typescript
const theme: CustomTheme = {
  blocks: {
    "increased-by": { color: "text-emerald-500", bgColor: "bg-emerald-500/10 border-emerald-500/30" },
    "open-position": { color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/30" },
    // ... other block types
  }
}

<StrategyBuilder themeOverride={theme} />
```

---

## 📁 File Structure

```
strategy/
├── src/
│   ├── index.ts                    # Main exports
│   ├── types/
│   │   └── index.ts                # Type definitions
│   └── components/
│       ├── strategy-builder.tsx    # Main component (1372 lines)
│       ├── block-types.ts          # Block configs & constants
│       ├── canvas-block.tsx        # Block on canvas
│       ├── draggable-block.tsx     # Block in palette
│       ├── rule-drop-zone.tsx      # Drop zone component
│       ├── strategy-canvas.tsx     # Canvas container
│       └── ui/                     # Radix UI components
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

---

## 🔗 Dependencies

**Peer Dependencies** (must be installed by consumer):
- `react` ^19.2.0
- `react-dom` ^19.2.0
- `next` ^16.0.7

**Bundled Dependencies**:
- `@dnd-kit/core`, `@dnd-kit/sortable` - Drag and drop
- `@radix-ui/*` - UI primitives
- `lucide-react` - Icons
- `tailwind-merge`, `clsx` - CSS utilities

---

## 🏷️ Tailwind CSS Note

Add to `tailwind.config.ts`:
```typescript
content: [
  // ...
  "./node_modules/@palabola86/trade-strategy-builder/dist/**/*.{js,mjs}",
]
```

---

## 📝 Common Patterns

### Load Existing Strategy
```tsx
<StrategyBuilder
  strategyId="my-strategy-id"
  getStrategyById={(id) => loadFromStorage(id)}
  onSave={(strategy) => saveToStorage(strategy)}
/>
```

### Predefined Templates
```tsx
<StrategyBuilder
  predefinedStrategies={[
    {
      id: "template-1",
      name: "RSI Strategy",
      description: "Buy when RSI < 30",
      strategy: { /* StrategyTemplate */ }
    }
  ]}
/>
```

### AI Integration
```tsx
<StrategyBuilder
  supportedAIModels={["gpt-4", "claude-3"]}
  callAIFunction={async (systemPrompt, userPrompts, model) => {
    // Call your AI backend
    return aiResponse
  }}
/>
```
