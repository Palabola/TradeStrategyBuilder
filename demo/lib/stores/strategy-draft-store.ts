import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StrategyTemplate } from '@palabola86/trade-strategy-builder'

interface StrategyDraftStore {
  draft: StrategyTemplate | null
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setDraft: (strategy: StrategyTemplate | null) => void
  clearDraft: () => void
  getDraft: () => StrategyTemplate | null
}

export const useStrategyDraftStore = create<StrategyDraftStore>()(
  persist(
    (set, get) => ({
      draft: null,
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      
      setDraft: (strategy) => {
        set({ draft: strategy })
      },
      
      clearDraft: () => {
        set({ draft: null })
      },
      
      getDraft: () => {
        return get().draft
      },
    }),
    {
      name: 'strategy-draft', // localStorage key
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
