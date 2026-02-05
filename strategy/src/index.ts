"use client"

// Main component
export { StrategyBuilder } from "./components/strategy-builder"

// Constants (for consumers who need them)
export {
  blockConfigs,
  tradingPairs,
  candleOptions,
  indicatorOptions,
  unitOptions,
  channelOptions,
  runIntervalOptions,
  leverageOptions,
  sideOptions,
} from "./components/block-types"

// Sub-components (if consumers need to customize)
export { CanvasBlock } from "./components/canvas-block"
export { DraggableBlock } from "./components/draggable-block"
export { RuleDropZone } from "./components/rule-drop-zone"

// Types from types folder
export type { 
    BlockCategory,
    BlockConfig,
    StrategyTemplate,  
    IndicatorOption,
    CustomTheme,
    PredefinedStrategyTemplate,
    ExecutionOptions,
    ConditionType,
    ActionType,
    BlockType,
} from "./types"

// Hooks for advanced customization
export { useStrategyState, useStrategyActions } from "./hooks"
export type { 
    UseStrategyStateProps, 
    StrategyStateReturn, 
    CanvasItem, 
    RuleGroup,
    UseStrategyActionsProps, 
    StrategyActionsReturn,
} from "./hooks"

// Stores for advanced customization
export { useAIBuilderStore } from "./stores/ai-builder-store"

// UI Components (optional - consumers might want to use them)
export * from "./components/ui"