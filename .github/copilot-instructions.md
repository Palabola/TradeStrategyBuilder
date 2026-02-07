# Code Generation Guidelines for TradeStrategyBuilder

## Project Overview
- **`/demo`**: Next.js demo app
- **`/strategy`**: React component library (`@palabola86/trade-strategy-builder`)

---

## Zustand State Management

### Store Rules
- Place in `/lib/stores/{domain}-store.ts`
- Use `devtools` + `persist` middlewares
- Include `_hasHydrated` + `setHasHydrated` + `onRehydrateStorage` for persisted stores
- Use `partialize` to persist only needed fields

### Selector Pattern (Critical)
```typescript
// ✅ Data: use selectors
const data = useStore((state) => state.data)
const hasHydrated = useStore((state) => state._hasHydrated)

// ✅ Actions: destructure directly
const { addItem, removeItem } = useStore()

// ❌ Never select functions - causes infinite re-renders with persist
const addItem = useStore((state) => state.addItem)

// ❌ Never destructure data - re-renders on any change
const { data } = useStore()
```

### Hydration
Check `_hasHydrated` before rendering persisted data to prevent flicker.

---

## TanStack Query

### Queries
- Use `staleTime: 1000 * 60 * 5` for semi-static data
- Use `staleTime: 0` + `refetchInterval` for real-time data
- Use `gcTime` for cache duration

### Mutations with Optimistic Updates
Use `onMutate` (cancelQueries + snapshot + optimistic set) → `onError` (rollback) → `onSettled` (invalidateQueries).

### Fresh Data
Use `cache: 'no-store'` + `Cache-Control: no-cache` headers.

---

## TypeScript

### Rules
- ❌ Never use `any` → ✅ Use `unknown` + type guards
- Always type function parameters and return values
- Use discriminated unions with `type` field for variants
- Use `Pick`, `Omit`, `Partial`, `Required` utility types
- Use branded types for ID safety: `type UserId = Brand<string, 'UserId'>`

---

## Component Architecture

### Rules
- Max 250 lines per file → extract hooks/sub-components
- Order: hooks → useMemo → useCallback → useEffect → render
- External imports first, internal second, types last
- Use `"use client"` only when needed

### Memoization
- `useMemo` for expensive calculations
- `useCallback` for stable function refs passed to children
- `React.memo` for expensive pure components
- Avoid inline objects/functions in JSX for frequently re-rendering components

---

## Error Handling
- Wrap critical sections with `<ErrorBoundary>` from `react-error-boundary`
- Always handle: `isLoading` → `error` → empty → data

---

## Performance
- Use `@tanstack/react-virtual` for long lists (100+ items)
- Use `lazy()` + `<Suspense>` for heavy components

---

## WebSocket
Use `react-use-websocket` with `shouldReconnect`, `reconnectInterval`, `reconnectAttempts`.

---

## Store Naming
- `useStrategyDraftStore` - draft being edited
- `useSavedStrategiesStore` - saved strategies
- `useStrategyOptionsStore` - UI config
- `useAIBuilderStore` - AI generation state

---

## Do Not
- ❌ `any` type
- ❌ `var` keyword
- ❌ Mutate state directly
- ❌ `useEffect` for derived state (use `useMemo`)
- ❌ Inline functions/objects in JSX for re-rendering components
- ❌ Ignore loading/error states
- ❌ `localStorage` directly (use Zustand persist)
- ❌ Components > 250 lines without extraction
