import { StrategyTemplate } from "../components/strategy/block-types"

export interface SavedStrategy extends StrategyTemplate {
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "saved_trading_strategies"

export function getSavedStrategies(): SavedStrategy[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error("Failed to parse saved strategies:", error)
    return []
  }
}

export function saveStrategyToStorage(strategy: Omit<SavedStrategy, "createdAt" | "updatedAt">): SavedStrategy {
  const strategies = getSavedStrategies()
  const now = new Date().toISOString()

  const existingIndex = strategies.findIndex((s) => s.strategyId === strategy.strategyId)

  const savedStrategy: SavedStrategy = {
    ...strategy,
    createdAt: existingIndex >= 0 ? strategies[existingIndex].createdAt : now,
    updatedAt: now,
  }

  if (existingIndex >= 0) {
    // Override existing strategy
    strategies[existingIndex] = savedStrategy
  } else {
    // Add new strategy
    strategies.push(savedStrategy)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
  return savedStrategy
}

export function removeStrategyFromStorage(strategyId: string): boolean {
  const strategies = getSavedStrategies()
  const filteredStrategies = strategies.filter((s) => s.strategyId !== strategyId)

  if (filteredStrategies.length === strategies.length) {
    return false // Strategy not found
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredStrategies))
  return true
}

export function getStrategyById(strategyId: string): SavedStrategy | null {
  const strategies = getSavedStrategies()
  return strategies.find((s) => s.strategyId === strategyId) || null
}
