import { create } from 'zustand'
import { IndicatorOption } from '@palabola86/trade-strategy-builder'
import { supportedTimeframes, supportedIndicators } from '../strategy-runner'

interface StrategyOptionsState {
  // Candle options
  candleOptions: string[]
  newCandle: string
  
  // Indicator options
  indicatorOptions: IndicatorOption[]
  newIndicatorName: string
  newIndicatorCategory: string
}

interface StrategyOptionsActions {
  // Candle options actions
  setCandleOptions: (options: string[]) => void
  setNewCandle: (candle: string) => void
  addCandleOption: () => void
  removeCandleOption: (candle: string) => void
  resetCandleOptions: () => void
  
  // Indicator options actions
  setIndicatorOptions: (options: IndicatorOption[]) => void
  setNewIndicatorName: (name: string) => void
  setNewIndicatorCategory: (category: string) => void
  addIndicatorOption: () => void
  removeIndicatorOption: (name: string) => void
  resetIndicatorOptions: () => void
  
  // Initialize with props
  initialize: (candleOptions?: string[], indicatorOptions?: IndicatorOption[]) => void
}

type StrategyOptionsStore = StrategyOptionsState & StrategyOptionsActions

export const useStrategyOptionsStore = create<StrategyOptionsStore>((set, get) => ({
  // Initial state
  candleOptions: [],
  newCandle: '',
  indicatorOptions: [],
  newIndicatorName: '',
  newIndicatorCategory: 'price',
  
  // Candle options actions
  setCandleOptions: (options) => set({ candleOptions: options }),
  
  setNewCandle: (candle) => set({ newCandle: candle }),
  
  addCandleOption: () => {
    const { newCandle, candleOptions } = get()
    const trimmed = newCandle.trim()
    if (trimmed && !candleOptions.includes(trimmed)) {
      set({
        candleOptions: [...candleOptions, trimmed],
        newCandle: '',
      })
    }
  },
  
  removeCandleOption: (candle) => {
    const { candleOptions } = get()
    set({ candleOptions: candleOptions.filter(c => c !== candle) })
  },
  
  resetCandleOptions: () => set({ candleOptions: supportedTimeframes }),
  
  // Indicator options actions
  setIndicatorOptions: (options) => set({ indicatorOptions: options }),
  
  setNewIndicatorName: (name) => set({ newIndicatorName: name }),
  
  setNewIndicatorCategory: (category) => set({ newIndicatorCategory: category }),
  
  addIndicatorOption: () => {
    const { newIndicatorName, newIndicatorCategory, indicatorOptions } = get()
    const trimmed = newIndicatorName.trim()
    if (trimmed && !indicatorOptions.some(i => i.name === trimmed)) {
      set({
        indicatorOptions: [...indicatorOptions, { name: trimmed, category: newIndicatorCategory }],
        newIndicatorName: '',
      })
    }
  },
  
  removeIndicatorOption: (name) => {
    const { indicatorOptions } = get()
    set({ indicatorOptions: indicatorOptions.filter(i => i.name !== name) })
  },
  
  resetIndicatorOptions: () => set({ indicatorOptions: supportedIndicators }),
  
  // Initialize with props (called once on mount)
  initialize: (candleOptions, indicatorOptions) => {
    set({
      candleOptions: candleOptions || [],
      indicatorOptions: indicatorOptions || [],
    })
  },
}))
