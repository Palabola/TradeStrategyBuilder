# Strategy Builder - Quick Reference for AI Agents

> **Package**: `@palabola86/trade-strategy-builder`  
> **Version**: 1.1.0  
> **Type**: React/Next.js visual trading strategy builder component

---

## 🎯 What This Package Does

A drag-and-drop visual component for building trading strategies. Users create rules with **conditions** (when to trigger) and **actions** (what to do). Supports custom block definitions and dark mode.

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
  BlockType,                  // Block type string (any string)
  ConditionBlockType,         // Condition block type string
  ActionBlockType,            // Action block type string
  BlockConfig,                // Block configuration
  BlockCategory,              // "condition" | "action"
  Parameter,                  // Parameter definition
  IndicatorOption,            // { name: string, category: string }
  CustomTheme,                // Theme override structure
  PredefinedStrategyTemplate, // Template with metadata
  ExecutionOptions,           // Strategy execution settings
} from "@palabola86/trade-strategy-builder"

// Constants
import {
  blockConfigs,       // Record<BlockType, BlockConfig> - default block configs
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

## 🧩 Default Block Types

### Condition Blocks (trigger conditions)
| Type | Description | Key Parameters |
|------|-------------|----------------|
| `increased-by` | Indicator increased by % | `indicator1`, `timeframe1`, `value` |
| `decreased-by` | Indicator decreased by % | `indicator1`, `timeframe1`, `value` |
| `greater-than` | Indicator > another | `indicator1`, `timeframe1`, `indicator2`, `timeframe2`, `value` |
| `lower-than` | Indicator < another | `indicator1`, `timeframe1`, `indicator2`, `timeframe2`, `value` |
| `crossing-above` | Indicator crosses above | `indicator1`, `timeframe1`, `indicator2`, `timeframe2`, `value` |
| `crossing-below` | Indicator crosses below | `indicator1`, `timeframe1`, `indicator2`, `timeframe2`, `value` |

### Action Blocks (execute actions)
| Type | Description | Key Options |
|------|-------------|-------------|
| `open-position` | Open trading position | `side`, `amount`, `unit`, `leverage`, `stopLoss`, `takeProfit` |
| `close-position` | Close position | (none) |
| `buy` | Buy asset | `amount`, `unit` |
| `sell` | Sell asset | `amount`, `unit` |
| `buy-order` | Place buy order | `orderType`, `amount`, `unit`, `stopLoss`, `takeProfit` |
| `sell-order` | Place sell order | `orderType`, `amount`, `unit`, `stopLoss`, `takeProfit` |
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

interface ExecutionOptions {
  runIntervalMinutes?: number
  maximumExecuteCount?: number
  intervalBetweenExecutionsMinutes?: number
  maximumOpenPositions?: number
}
```

### ConditionType
```typescript
interface ConditionType {
  index: number
  type: ConditionBlockType  // Block type name (e.g., "increased-by", "crossing-above")
  options: {
    indicator1?: string
    timeframe1?: string
    indicator2?: string
    timeframe2?: string
    value?: number
    [key: string]: any  // Custom parameters
  }
}
```

### ActionType
```typescript
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
    [key: string]: any  // Custom parameters
  }
}
```

### BlockConfig (for custom blocks)
```typescript
interface BlockConfig {
  label: string
  description: string
  promptDescription?: string  // AI-friendly description
  labelPrefixFunction?: (params: Record<string, string | number>) => string
  labelPostfixFunction?: (params: Record<string, string | number>) => string
  icon: LucideIcon
  color: string              // Tailwind text color class
  bgColor: string            // Tailwind bg/border classes
  category: "condition" | "action"
  parameters: Parameter[][]  // 2D array - rows of parameters
}

interface Parameter {
  name: string               // Unique within the block
  type: "select" | "number" | "text" | "textarea" | "label" | "indicator"
  label: string
  options?: string[]         // For "select" type
  indicatorOptions?: IndicatorOption[]  // For "indicator" type
  placeholder?: string
  default?: string | number
  required?: boolean
  filterByIndicator?: string
  showWhen?: { param: string; equals: string | number }
  hideWhen?: { param: string; equals: string | number }
}
```

### StrategyBuilderProps
```typescript
interface StrategyBuilderProps {
  initialStrategy?: StrategyTemplate           // Load existing strategy
  configOptions?: Record<BlockType, BlockConfig>  // Custom/override blocks
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  predefinedStrategies?: PredefinedStrategyTemplate[]
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

### With Initial Strategy
```tsx
const existingStrategy = getStrategyFromStorage(id)

<StrategyBuilder
  initialStrategy={existingStrategy}
  onSave={handleSave}
/>
```

### With Custom Blocks
```tsx
import { StrategyBuilder, blockConfigs } from "@palabola86/trade-strategy-builder"
import { Bell } from "lucide-react"

const customBlocks = {
  "always": {
    label: "Always",
    description: "Always trigger",
    promptDescription: "Always triggers unconditionally",
    icon: Bell,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    category: "condition",
    parameters: [],
  },
}

<StrategyBuilder
  configOptions={{ ...blockConfigs, ...customBlocks }}
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

## 🌙 Dark Mode Support

Define CSS variables for dark mode in `globals.css`:

```css
.dark {
  --background: #16121f;
  --foreground: #fff;
  --card: #1f1b27;
  --card-foreground: #fff;
  --primary: #8a61ff;
  --primary-foreground: #fff;
  --muted: #686b821f;
  --muted-foreground: #9497a9;
  --border: #686b8252;
  --input: #686b8229;
  --ring: #8a61ff;
  /* ... other variables */
}
```

Toggle dark mode by adding/removing `.dark` class on `<html>` element.

---

## 📁 File Structure

```
strategy/
├── src/
│   ├── index.ts                    # Main exports
│   ├── types/
│   │   └── index.ts                # Type definitions
│   └── components/
│       ├── strategy-builder.tsx    # Main component
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
- `react` ^19.x
- `react-dom` ^19.x
- `next` ^16.x

**Bundled Dependencies**:
- `@dnd-kit/core`, `@dnd-kit/sortable` - Drag and drop
- `@radix-ui/*` - UI primitives
- `lucide-react` - Icons
- `tailwind-merge`, `clsx` - CSS utilities

---

## 🏷️ Tailwind CSS Note

Add to `globals.css`:
```css
@source "../node_modules/@palabola86/trade-strategy-builder/dist";
```

Or add to `tailwind.config.ts`:
```typescript
content: [
  // ...
  "./node_modules/@palabola86/trade-strategy-builder/dist/**/*.{js,mjs}",
]
```

---

## 📝 Common Patterns

### Custom Block with Parameters
```tsx
const customBlock: BlockConfig = {
  label: "Buy Limit",
  description: "Place buy limit order",
  promptDescription: "Buy limit order at specified price",
  icon: DollarSign,
  color: "text-green-500",
  bgColor: "bg-green-500/10 border-green-500/30",
  category: "action",
  parameters: [
    // Row 1
    [
      { name: "price", type: "number", label: "Price", required: true },
      { name: "unit", type: "select", label: "Unit", options: ["USD", "%"] },
    ],
    // Row 2
    [
      { name: "amount", type: "number", label: "Amount", default: 100 },
    ],
  ],
}
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
    const response = await fetch("/api/ai", { ... })
    return response.json().content
  }}
/>
```

---

## 📊 Example Output JSON

```json
{
  "strategyId": "abc123",
  "strategyName": "RSI Strategy",
  "symbols": ["BTC/USD"],
  "executionOptions": {
    "runIntervalMinutes": 15,
    "maximumOpenPositions": 2
  },
  "rules": [
    {
      "name": "Entry Rule",
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
            "unit": "USD"
          }
        }
      ]
    }
  ]
}
```
