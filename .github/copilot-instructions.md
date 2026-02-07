# Code Generation Guidelines for TradeStrategyBuilder

## Project Overview
TradeStrategyBuilder is a fintech trading strategy builder application consisting of:
- **`/demo`**: Next.js demo application showcasing the strategy builder
- **`/strategy`**: Publishable React component library (`@palabola86/trade-strategy-builder`)

The application enables users to create, analyze, and execute trading strategies using a drag-and-drop interface with real-time market data integration.

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| UI Components | Radix UI + Tailwind CSS |
| State Management | Zustand |
| Server State | TanStack Query (React Query) |
| Drag & Drop | @dnd-kit |
| WebSocket | react-use-websocket |
| Package Manager | pnpm |

---

## State Management with Zustand

### Store Structure
- Place stores in `/lib/stores/` directory
- Name files as `{domain}-store.ts` (e.g., `portfolio-store.ts`, `strategy-draft-store.ts`)

### Required Middlewares
Prefer to use `devtools` and `persist` (when applicable):

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ExampleStore {
  // State
  data: DataType[]
  isLoading: boolean
  
  // Hydration tracking for persisted stores
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  
  // Actions
  setData: (data: DataType[]) => void
  addItem: (item: DataType) => void
  removeItem: (id: string) => void
}

export const useExampleStore = create<ExampleStore>()(
  devtools(
    persist(
      (set, get) => ({
        data: [],
        isLoading: false,
        _hasHydrated: false,
        
        setHasHydrated: (state) => set({ _hasHydrated: state }),
        
        setData: (data) => set({ data }),
        
        addItem: (item) => set((state) => ({
          data: [...state.data, item]
        })),
        
        removeItem: (id) => set((state) => ({
          data: state.data.filter(d => d.id !== id)
        })),
      }),
      {
        name: 'example-storage',
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      }
    ),
    { name: 'ExampleStore' }
  )
)
```

### Selector Pattern (Performance Critical)
```typescript
// ✅ CORRECT: Use selectors for data - prevents unnecessary re-renders
const data = useExampleStore((state) => state.data)
const isLoading = useExampleStore((state) => state.isLoading)
const hasHydrated = useExampleStore((state) => state._hasHydrated)

// ✅ CORRECT: Destructure actions directly - no infinite loop risk
const { addItem, removeItem } = useExampleStore()

// ❌ WRONG: Selecting functions can cause infinite re-renders with persist
const addItem = useExampleStore((state) => state.addItem) // Avoid this!

// ❌ WRONG: Subscribes to entire store, re-renders on any change
const { data, isLoading } = useExampleStore() // Avoid for data!
```

### Hydration Handling (Prevent UI Flicker)
```typescript
function MyComponent() {
  const hasHydrated = useExampleStore((state) => state._hasHydrated)
  const data = useExampleStore((state) => state.data)
  
  if (!hasHydrated) {
    return <LoadingSkeleton />
  }
  
  return <DataList data={data} />
}
```

### Partial Persistence
Use `partialize` to persist only specific fields:
```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'storage-key',
    partialize: (state) => ({ 
      // Only persist these fields
      lastAction: state.lastAction,
      preferences: state.preferences,
    }),
  }
)
```

---

## Data Fetching with TanStack Query

### Query Configuration
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Queries - for GET requests
const { data, isLoading, error } = useQuery({
  queryKey: ['strategies', userId],
  queryFn: () => fetchStrategies(userId),
  staleTime: 1000 * 60 * 5, // 5 minutes for semi-static data
  gcTime: 1000 * 60 * 30,   // 30 minutes cache
})

// Real-time data - always fresh
const { data: prices } = useQuery({
  queryKey: ['prices', symbol],
  queryFn: () => fetchPrice(symbol),
  staleTime: 0,
  refetchInterval: 5000,
})
```

### Mutations with Optimistic Updates
```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: saveStrategy,
  onMutate: async (newStrategy) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['strategies'] })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['strategies'])
    
    // Optimistically update
    queryClient.setQueryData(['strategies'], (old) => [...old, newStrategy])
    
    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['strategies'], context?.previous)
  },
  onSettled: () => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['strategies'] })
  },
})
```

### Cache Bypass for Fresh Data
```typescript
// In fetch function - bypass HTTP caches
const fetchData = async (endpoint: string) => {
  const response = await fetch(endpoint, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
  return response.json()
}
```

---

## TypeScript Best Practices

### Strict Typing Rules
```typescript
// ❌ NEVER use 'any'
const data: any = response // Bad

// ✅ Use 'unknown' for untrusted data + type guards
const data: unknown = response
if (isStrategyTemplate(data)) {
  // Now TypeScript knows the type
}

// Type guard example
function isStrategyTemplate(value: unknown): value is StrategyTemplate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'strategyId' in value &&
    'strategyName' in value
  )
}
```

### Discriminated Unions for Variants
```typescript
type MarketOrder = {
  type: 'market'
  symbol: string
  quantity: number
}

type LimitOrder = {
  type: 'limit'
  symbol: string
  quantity: number
  limitPrice: number
}

type Order = MarketOrder | LimitOrder

function processOrder(order: Order) {
  switch (order.type) {
    case 'market':
      // TypeScript knows this is MarketOrder
      break
    case 'limit':
      // TypeScript knows this is LimitOrder
      console.log(order.limitPrice)
      break
  }
}
```

### Utility Types
```typescript
// Pick specific fields
type OrderSummary = Pick<Order, 'id' | 'symbol' | 'status'>

// Omit auto-generated fields
type CreateOrderDTO = Omit<Order, 'id' | 'createdAt'>

// Make all fields optional
type UpdateOrderDTO = Partial<Order>

// Make specific fields required
type RequiredOrder = Required<Pick<Order, 'symbol' | 'quantity'>>
```

### Branded Types for Safety
```typescript
type Brand<K, T> = K & { __brand: T }

type UserId = Brand<string, 'UserId'>
type StrategyId = Brand<string, 'StrategyId'>

// Prevents mixing up IDs
function getStrategy(id: StrategyId): Strategy { /* ... */ }

const userId = 'user-123' as UserId
getStrategy(userId) // ❌ TypeScript error!
```

### Explicit Function Types
```typescript
// ✅ Always type parameters and return values
function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number
): number {
  return (exitPrice - entryPrice) * quantity
}

// ✅ Type async functions
async function fetchCandles(
  symbol: string,
  timeframe: Timeframe
): Promise<Candle[]> {
  // ...
}
```

---

## Component Architecture

### File Size Limits
- **Maximum 250 lines per component file**
- Extract logic to custom hooks when component grows
- Extract sub-components for complex UI sections

### Component Structure
```typescript
"use client" // Only if needed

import { useState, useCallback, useMemo } from "react"
// External imports first
// Internal imports second
// Types last

interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks (stores, queries, state)
  // 2. Derived/computed values (useMemo)
  // 3. Callbacks (useCallback)
  // 4. Effects (useEffect)
  // 5. Render
  
  return (
    // JSX
  )
}
```

### Custom Hooks Pattern
Extract reusable logic:
```typescript
// lib/hooks/useMarketData.ts
export function useMarketData(symbol: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['market', symbol],
    queryFn: () => fetchMarketData(symbol),
  })
  
  const formattedPrice = useMemo(() => 
    data?.price.toFixed(2), [data?.price]
  )
  
  return { data, isLoading, error, formattedPrice }
}
```

### Memoization Guidelines
```typescript
// ✅ useMemo for expensive calculations
const sortedStrategies = useMemo(() => 
  strategies.sort((a, b) => a.name.localeCompare(b.name)),
  [strategies]
)

// ✅ useCallback for stable function references
const handleSubmit = useCallback((data: FormData) => {
  mutation.mutate(data)
}, [mutation])

// ✅ React.memo for expensive pure components
const PriceRow = React.memo(({ symbol, price }: PriceRowProps) => {
  return <tr>...</tr>
})
```

---

## File Structure

```
/demo
  /app
    /api              # API routes
    /{page}           # Page routes with page.tsx and client.tsx
  /components
    /ui               # Reusable UI components (shadcn/ui)
    /dashboard        # Feature-specific components
    /dialogs          # Modal/dialog components
  /lib
    /hooks            # Custom React hooks
    /stores           # Zustand stores
    /services         # API service classes
    /utils            # Pure utility functions

/strategy
  /src
    /components
      /ui             # Internal UI components
      /dialogs        # Dialog components
    /hooks            # Package-specific hooks
    /stores           # Package stores
    /types            # TypeScript types/interfaces
```

---

## Error Handling

### Error Boundaries
```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

// Wrap critical sections
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <TradingDashboard />
</ErrorBoundary>
```

### Loading and Error States
Always handle all states:
```typescript
function DataComponent() {
  const { data, isLoading, error } = useQuery(/* ... */)
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data || data.length === 0) return <EmptyState />
  
  return <DataList data={data} />
}
```

---

## Performance Guidelines

### Virtualization for Long Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <ItemRow key={items[virtualRow.index].id} item={items[virtualRow.index]} />
        ))}
      </div>
    </div>
  )
}
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Avoid Inline Objects/Functions in JSX
```typescript
// ❌ Creates new reference every render
<Component style={{ color: 'red' }} onClick={() => handleClick(id)} />

// ✅ Stable references
const style = useMemo(() => ({ color: 'red' }), [])
const handleClick = useCallback(() => { /* ... */ }, [id])
<Component style={style} onClick={handleClick} />
```

---

## WebSocket / Real-time Data

Use `react-use-websocket` for WebSocket connections:
```typescript
import useWebSocket from 'react-use-websocket'

function usePriceFeed(symbol: string) {
  const { lastJsonMessage, readyState } = useWebSocket(
    `wss://stream.example.com/${symbol}`,
    {
      shouldReconnect: () => true,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
    }
  )
  
  return {
    price: lastJsonMessage?.price,
    connected: readyState === ReadyState.OPEN,
  }
}
```

---

## Testing Considerations

Write testable code:
- Keep side effects in hooks/services (not components)
- Use dependency injection where possible
- Write pure utility functions
- Mock Zustand stores and React Query in tests

---

## Common Patterns in This Codebase

### Strategy Template Type
```typescript
interface StrategyTemplate {
  strategyId: string
  strategyName: string
  symbols: string[]
  rules: Rule[]
  executionOptions?: ExecutionOptions
}
```

### Condition Evaluation
The strategy runner evaluates conditions like:
- `increased-by` / `decreased-by`: Percentage changes
- `greater-than` / `lower-than`: Value comparisons
- `crossing-above` / `crossing-below`: Crossover detection

### Store Naming Conventions
- `useStrategyDraftStore` - Draft strategy being edited
- `useSavedStrategiesStore` - Saved/deployed strategies
- `useStrategyOptionsStore` - UI configuration options
- `useAIBuilderStore` - AI generation state

---

## Do Not

- ❌ Use `any` type
- ❌ Use `var` keyword
- ❌ Mutate state directly
- ❌ Use `useEffect` for derived state (use `useMemo`)
- ❌ Create inline functions/objects in JSX (for components that re-render often)
- ❌ Ignore loading/error states
- ❌ Use localStorage directly (use Zustand with persist)
- ❌ Make components larger than 150 lines without extracting logic
