# Strategy Builder - Project Summary for AI Agents

> High-level overview of `@palabola86/trade-strategy-builder`

---

## 🎯 Purpose

This package provides a **visual drag-and-drop trading strategy builder** for React/Next.js applications. It enables users to create trading strategies without writing code by combining condition and action blocks into rules. The component is fully customizable with support for custom block definitions, theming, and dark mode.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      StrategyBuilder                            │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │  Block Palette  │  │           Strategy Canvas            │  │
│  │                 │  │  ┌────────────────────────────────┐  │  │
│  │  [Conditions]   │  │  │ Rule 1                         │  │  │
│  │  ├─ Increased   │  │  │  Conditions: [...blocks]       │  │  │
│  │  ├─ Decreased   │──│  │  Actions: [...blocks]          │  │  │
│  │  ├─ Greater     │  │  └────────────────────────────────┘  │  │
│  │  ├─ Lower       │  │  ┌────────────────────────────────┐  │  │
│  │  ├─ Cross Above │  │  │ Rule 2                         │  │  │
│  │  ├─ Cross Below │  │  │  Conditions: [...blocks]       │  │  │
│  │  ├─ + Custom... │  │  │  Actions: [...blocks]          │  │  │
│  │                 │  │  └────────────────────────────────┘  │  │
│  │  [Actions]      │  │                                      │  │
│  │  ├─ Open        │  │        + Add New Rule                │  │
│  │  ├─ Close       │  │                                      │  │
│  │  ├─ Buy         │  └──────────────────────────────────────┘  │
│  │  ├─ Sell        │                                            │
│  │  ├─ Notify      │                                            │
│  │  └─ + Custom... │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Strategy Settings: Name, Symbols, Execution Options        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                    [Save Strategy] [Preview]    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    StrategyTemplate (JSON)
```

---

## 📁 Source Structure

```
strategy/
├── src/
│   ├── index.ts                      # Public exports
│   ├── types/
│   │   └── index.ts                  # Type definitions
│   │       ├── StrategyTemplate      # Main output type
│   │       ├── ConditionType         # Condition block data
│   │       ├── ActionType            # Action block data
│   │       ├── BlockConfig           # Block configuration
│   │       ├── Parameter             # Parameter definition
│   │       ├── StrategyBuilderProps  # Component props
│   │       └── CustomTheme           # Theme override
│   │
│   └── components/
│       ├── strategy-builder.tsx      # Main component
│       │   └── Orchestrates all sub-components
│       │   └── Manages drag-and-drop context
│       │   └── Handles strategy serialization
│       │   └── AI generation integration
│       │   └── Dynamically calculates condition/action blocks
│       │
│       ├── block-types.ts            # Block configurations
│       │   └── blockConfigs: Record<BlockType, BlockConfig>
│       │   └── Default options (indicators, timeframes, etc.)
│       │   └── STATIC_SYSTEM_PROMPT_V1 for AI generation
│       │
│       ├── canvas-block.tsx          # Block rendered on canvas
│       │   └── Editable parameters (2D grid layout)
│       │   └── Delete functionality
│       │   └── Uses blockType prop for identification
│       │
│       ├── draggable-block.tsx       # Block in palette (draggable)
│       │   └── Preview appearance
│       │   └── Drag source
│       │
│       ├── rule-drop-zone.tsx        # Drop target for blocks
│       │   └── Accepts condition/action blocks
│       │   └── Reordering support
│       │
│       ├── strategy-canvas.tsx       # Canvas container
│       │   └── Rules management
│       │
│       └── ui/                       # Radix UI components
│           ├── button.tsx
│           ├── card.tsx
│           ├── dialog.tsx
│           ├── input.tsx
│           ├── select.tsx
│           └── ...
│
├── package.json                      # Package manifest
├── tsconfig.json                     # TypeScript config
├── tsup.config.ts                    # Build configuration
├── README.md                         # User documentation
├── LICENSE                           # MIT license
├── STRATEGY_BUILDER_QUICK_REFERENCE.md
├── STRATEGY_BUILDER_SETUP.md
└── STRATEGY_BUILDER_SUMMARY.md       # This file
```

---

## 🔄 Data Flow

```
User Interaction
       │
       ▼
┌──────────────────┐
│  Drag Block      │ ──────────────────────┐
│  from Palette    │                       │
└──────────────────┘                       ▼
                              ┌────────────────────────┐
┌──────────────────┐          │   DndContext           │
│  Drop on Canvas  │ ◄────────│   (@dnd-kit/core)      │
└──────────────────┘          └────────────────────────┘
       │
       ▼
┌──────────────────┐
│  CanvasBlock     │ ◄──── User edits parameters (2D grid)
│  Created         │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Rule State      │
│  Updated         │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Save Button     │ ──────────────────────┐
│  Clicked         │                       │
└──────────────────┘                       ▼
                              ┌────────────────────────┐
┌──────────────────┐          │  Convert to            │
│  onSave callback │ ◄────────│  StrategyTemplate      │
│  invoked         │          │  (JSON serialization)  │
└──────────────────┘          └────────────────────────┘
```

---

## 🧩 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `StrategyBuilder` | Main entry point, DnD context, state management, AI integration, dynamically calculates blocks from configOptions |
| `DraggableBlock` | Render blocks in palette, initiate drag |
| `RuleDropZone` | Accept dropped blocks, handle reordering |
| `CanvasBlock` | Render placed blocks with 2D parameter grid, edit parameters, delete |
| `block-types.ts` | Define default block configurations and options |

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@dnd-kit/core` | Drag-and-drop core functionality |
| `@dnd-kit/sortable` | Sortable list support |
| `@radix-ui/*` | Accessible UI primitives |
| `lucide-react` | Block icons |
| `clsx`, `tailwind-merge` | CSS class utilities |

---

## 🎨 Styling System

- **Tailwind CSS** for all styling
- **CSS Variables** for theming (supports dark mode via `.dark` class)
- **Custom themes** via `themeOverride` prop for block colors
- Block colors follow semantic meaning:
  - 🟢 Green: bullish/buy actions
  - 🔴 Red: bearish/sell actions  
  - 🔵 Blue: neutral conditions
  - 🟡 Yellow/Orange: warnings/notifications

### Dark Mode Support

The component reads CSS variables that change based on `.dark` class on `<html>`:

```css
/* Light mode */
:root {
  --background: #ffffff;
  --card: #ffffff;
  --primary: #8a61ff;
  /* ... */
}

/* Dark mode */
.dark {
  --background: #16121f;
  --card: #1f1b27;
  --primary: #8a61ff;
  /* ... */
}
```

---

## 🔌 Extension Points

### 1. Custom Block Configurations
```tsx
configOptions={{
  ...blockConfigs,
  "my-custom-block": {
    label: "Custom",
    description: "...",
    icon: MyIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    category: "action",
    parameters: [
      [{ name: "param1", type: "number", label: "Value" }],
    ],
  },
}}
```

### 2. Custom Indicators
```tsx
indicatorOptions={[{ name: "Custom", category: "custom" }]}
```

### 3. Custom Timeframes
```tsx
candleOptions={["1s", "5s", "1min", ...]}
```

### 4. Custom Theme
```tsx
themeOverride={{ blocks: { "increased-by": { color: "...", bgColor: "..." } } }}
```

### 5. AI Generation
```tsx
callAIFunction={async (system, user, model) => "AI response"}
```

### 6. Initial Strategy
```tsx
initialStrategy={existingStrategyObject}
```

---

## 📊 Output Format

The component produces a `StrategyTemplate` JSON:

```json
{
  "strategyId": "uuid-here",
  "strategyName": "My Strategy",
  "symbols": ["BTC/USD"],
  "executionOptions": {
    "runIntervalMinutes": 15,
    "maximumExecuteCount": 10,
    "intervalBetweenExecutionsMinutes": 60,
    "maximumOpenPositions": 2
  },
  "rules": [
    {
      "name": "Rule 1",
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

### Key Type Structures

```typescript
// Condition block output
interface ConditionType {
  index: number
  type: ConditionBlockType  // Block type name (e.g., "crossing-above")
  options: {
    indicator1?: string
    timeframe1?: string
    indicator2?: string
    timeframe2?: string
    value?: number
    [key: string]: any  // Custom parameters
  }
}

// Action block output
interface ActionType {
  index: number
  action: ActionBlockType  // Block type name (e.g., "open-position")
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
    [key: string]: any  // Custom parameters
  }
}
```

---

## 🔗 Related Files

| File | Description |
|------|-------------|
| `README.md` | Full user documentation |
| `STRATEGY_BUILDER_QUICK_REFERENCE.md` | Quick lookup for exports & types |
| `STRATEGY_BUILDER_SETUP.md` | Step-by-step integration guide |
| `../demo/` | Reference implementation |

---

## 📝 Common AI Agent Tasks

### Add a new custom block type
1. Define `BlockConfig` with label, description, icon, colors, category, parameters
2. Pass to `configOptions` prop merged with `blockConfigs`
3. Parameters are a 2D array (rows of parameters)

### Add new parameter to a block
1. Add parameter object to the block's `parameters` array in `configOptions`
2. Each parameter needs unique `name` within the block
3. Supported types: `"select"`, `"number"`, `"text"`, `"textarea"`, `"label"`, `"indicator"`

### Load an existing strategy
1. Fetch strategy data as `StrategyTemplate`
2. Pass to `initialStrategy` prop
3. Component will initialize with that strategy loaded

### Enable dark mode
1. Define CSS variables in `.dark` selector
2. Toggle `.dark` class on `<html>` element
3. Component automatically uses the CSS variables

### Customize block appearance
1. Create `CustomTheme` object with block overrides
2. Pass to `themeOverride` prop
3. Override `color` (text) and `bgColor` (background/border) per block type

---

## 🏷️ Package Info

- **Name**: `@palabola86/trade-strategy-builder`
- **Version**: 1.1.0
- **License**: MIT
- **Repository**: https://github.com/Palabola/TradeStrategyBuilder
- **NPM**: https://www.npmjs.com/package/@palabola86/trade-strategy-builder

---

## ⚠️ Breaking Changes from v1.0

### Props Changes
- **Removed**: `strategyId`, `getStrategyById`, `channelOptions`
- **Added**: `initialStrategy`, `configOptions`

### Type Changes
- `ConditionType`: Now has `type` (block type name) and `options` object (was flat structure)
- `ActionType.action`: Now uses block type name (e.g., `"open-position"`) instead of uppercase (e.g., `"OPEN"`)
- `BlockConfig`: Parameters are now a 2D array (`Parameter[][]`) for row-based layout
- `BlockConfig`: Added optional `promptDescription` field for AI generation

### Component Changes
- Condition/action block arrays are now dynamically calculated from `configOptions`
- Dark mode supported via CSS variables with `.dark` class
