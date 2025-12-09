import { StrategyTemplate } from "@palabola86/trade-strategy-builder"

const STORAGE_KEY = "saved_trading_strategies"

export function getSavedStrategies(): StrategyTemplate[] {
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

export function saveStrategyToStorage(strategy: StrategyTemplate): StrategyTemplate {
  const strategies = getSavedStrategies()
  const now = new Date().toISOString()

  const existingIndex = strategies.findIndex((s) => s.strategyId === strategy.strategyId)

  const savedStrategy: StrategyTemplate = {
    ...strategy,
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

export function getStrategyById(strategyId: string): StrategyTemplate | null {
  const strategies = getSavedStrategies()
  return strategies.find((s) => s.strategyId === strategyId) || null
}
