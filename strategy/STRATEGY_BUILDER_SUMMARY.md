# Strategy Builder - Project Summary for AI Agents

> High-level overview of `@palabola86/trade-strategy-builder`

---

## 🎯 Purpose

This package provides a **visual drag-and-drop trading strategy builder** for React/Next.js applications. It enables users to create trading strategies without writing code by combining condition and action blocks into rules.

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
│  │  └─ Cross Below │  │  │  Conditions: [...blocks]       │  │  │
│  │                 │  │  │  Actions: [...blocks]          │  │  │
│  │  [Actions]      │  │  └────────────────────────────────┘  │  │
│  │  ├─ Open        │  │                                      │  │
│  │  ├─ Close       │  │        + Add New Rule                │  │
│  │  ├─ Buy         │  │                                      │  │
│  │  ├─ Sell        │  └──────────────────────────────────────┘  │
│  │  └─ Notify      │                                            │
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
│   └── components/
│       ├── strategy-builder.tsx      # Main component (1372 lines)
│       │   └── Orchestrates all sub-components
│       │   └── Manages drag-and-drop context
│       │   └── Handles strategy serialization
│       │   └── AI generation integration
│       │
│       ├── block-types.ts            # Block configurations (657 lines)
│       │   └── blockConfigs: Record<BlockType, BlockConfig>
│       │   └── conditionBlocks, actionBlocks arrays
│       │   └── Default options (indicators, timeframes, etc.)
│       │
│       ├── canvas-block.tsx          # Block rendered on canvas
│       │   └── Editable parameters
│       │   └── Delete functionality
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
│  CanvasBlock     │ ◄──── User edits parameters
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
| `StrategyBuilder` | Main entry point, DnD context, state management, AI integration |
| `DraggableBlock` | Render blocks in palette, initiate drag |
| `RuleDropZone` | Accept dropped blocks, handle reordering |
| `CanvasBlock` | Render placed blocks, edit parameters, delete |
| `block-types.ts` | Define all block configurations and default options |

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
- **CSS Variables** for theming (via Radix UI)
- **Custom themes** via `themeOverride` prop
- Block colors follow semantic meaning:
  - 🟢 Green: bullish/buy actions
  - 🔴 Red: bearish/sell actions  
  - 🔵 Blue: neutral conditions
  - 🟡 Yellow/Orange: warnings/notifications

---

## 🔌 Extension Points

### 1. Custom Indicators
```tsx
indicatorOptions={[{ name: "Custom", category: "custom" }]}
```

### 2. Custom Timeframes
```tsx
candleOptions={["1s", "5s", "1min", ...]}
```

### 3. Custom Theme
```tsx
themeOverride={{ blocks: { "increased-by": { color: "...", bgColor: "..." } } }}
```

### 4. AI Generation
```tsx
callAIFunction={async (system, user, model) => "AI response"}
```

### 5. Persistence
```tsx
getStrategyById={(id) => fetchFromDB(id)}
onSave={(strategy) => saveToDBB(strategy)}
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
          "indicator1": "RSI(14)",
          "timeframe1": "1h",
          "indicator2": "Value",
          "value": 30
        }
      ],
      "actions": [
        {
          "index": 0,
          "action": "OPEN",
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

### Add a new condition block type
1. Add type to `ConditionBlockType` in `types/index.ts`
2. Add config to `blockConfigs` in `block-types.ts`
3. Add to `conditionBlocks` array

### Add a new action block type
1. Add action to `ActionType.action` union in `types/index.ts`
2. Add config to `blockConfigs` in `block-types.ts`
3. Add to `actionBlocks` array

### Add new parameter to a block
1. Add parameter to `BlockConfig.parameters` in `block-types.ts`
2. Update serialization in `strategy-builder.tsx`

### Modify the output JSON structure
1. Update `StrategyTemplate` in `types/index.ts`
2. Update serialization logic in `strategy-builder.tsx`

---

## 🏷️ Package Info

- **Name**: `@palabola86/trade-strategy-builder`
- **Version**: 1.0.0
- **License**: MIT
- **Repository**: https://github.com/Palabola/TradeStrategyBuilder
- **NPM**: https://www.npmjs.com/package/@palabola86/trade-strategy-builder
