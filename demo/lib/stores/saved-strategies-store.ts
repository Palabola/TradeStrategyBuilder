import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StrategyTemplate } from '@palabola86/trade-strategy-builder'

interface SavedStrategiesStore {
  strategies: StrategyTemplate[]
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setStrategies: (strategies: StrategyTemplate[]) => void
  addStrategy: (strategy: StrategyTemplate) => void
  updateStrategy: (strategy: StrategyTemplate) => void
  removeStrategy: (strategyId: string) => boolean
  getStrategyById: (strategyId: string) => StrategyTemplate | undefined
  saveStrategy: (strategy: StrategyTemplate) => StrategyTemplate
}

export const useSavedStrategiesStore = create<SavedStrategiesStore>()(
  persist(
    (set, get) => ({
      strategies: [],
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      
      setStrategies: (strategies) => {
        set({ strategies })
      },
      
      addStrategy: (strategy) => {
        set((state) => ({
          strategies: [...state.strategies, strategy]
        }))
      },
      
      updateStrategy: (strategy) => {
        set((state) => ({
          strategies: state.strategies.map(s => 
            s.strategyId === strategy.strategyId ? strategy : s
          )
        }))
      },
      
      removeStrategy: (strategyId) => {
        const { strategies } = get()
        const filtered = strategies.filter(s => s.strategyId !== strategyId)
        
        if (filtered.length === strategies.length) {
          return false // Strategy not found
        }
        
        set({ strategies: filtered })
        return true
      },
      
      getStrategyById: (strategyId) => {
        const { strategies } = get()
        return strategies.find(s => s.strategyId === strategyId)
      },
      
      saveStrategy: (strategy) => {
        const { strategies } = get()
        const existingIndex = strategies.findIndex(s => s.strategyId === strategy.strategyId)
        
        const savedStrategy: StrategyTemplate = { ...strategy }
        
        if (existingIndex >= 0) {
          // Update existing
          set((state) => ({
            strategies: state.strategies.map((s, i) => 
              i === existingIndex ? savedStrategy : s
            )
          }))
        } else {
          // Add new
          set((state) => ({
            strategies: [...state.strategies, savedStrategy]
          }))
        }
        
        return savedStrategy
      },
    }),
    {
      name: 'saved_trading_strategies', // localStorage key (matches old key)
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
