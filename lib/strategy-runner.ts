import { candleService, type Candle } from "./candle-service"
import { indicatorsService } from "./indicators-service"
import type { SavedStrategy } from "./strategy-storage"

// Supported indicators
export type IndicatorType = "Price" | "RSI" | "MACD" | "MA" | "EMA(20)" | "EMA(50)" | "Bollinger Bands"

// Supported timeframes (matching candle-service)
export type Timeframe = "1min" | "5min" | "15min" | "30min" | "1h" | "4h" | "24h" | "1w"

// Condition types from block-types
export type ConditionType = 
  | "increased-by" 
  | "decreased-by" 
  | "greater-than" 
  | "lower-than" 
  | "crossing-above" 
  | "crossing-below"

export interface ConditionEvaluation {
  conditionIndex: number
  condition: any
  currentValue: number | null
  previousValue?: number | null
  comparisonValue?: number | null
  result: boolean
  error?: string
}

export interface RuleEvaluation {
  ruleIndex: number
  ruleName: string
  conditions: ConditionEvaluation[]
  allConditionsMet: boolean
  actions: any[]
}

export interface StrategyEvaluation {
  strategyId: string
  strategyName: string
  symbol: string
  evaluatedAt: Date
  rules: RuleEvaluation[]
  triggeredRules: RuleEvaluation[]
}

export class StrategyRunner {
  private candleCache: Map<string, Candle[]> = new Map()

  /**
   * Get cache key for candle data
   */
  private getCacheKey(symbol: string, timeframe: string): string {
    return `${symbol}-${timeframe}`
  }

  /**
   * Fetch candles with caching
   */
  async fetchCandles(symbol: string, timeframe: string): Promise<Candle[]> {
    const cacheKey = this.getCacheKey(symbol, timeframe)
    
    if (this.candleCache.has(cacheKey)) {
      return this.candleCache.get(cacheKey)!
    }

    const candles = await candleService.fetchCandles(symbol, timeframe)
    this.candleCache.set(cacheKey, candles)
    return candles
  }

  /**
   * Clear the candle cache
   */
  clearCache(): void {
    this.candleCache.clear()
  }

  /**
   * Get the current value of an indicator
   */
  async getIndicatorValue(
    symbol: string,
    indicator: IndicatorType,
    timeframe: Timeframe
  ): Promise<number | null> {
    try {
      const candles = await this.fetchCandles(symbol, timeframe)
      
      if (!candles || candles.length === 0) {
        return null
      }

      switch (indicator) {
        case "Price":
          return candles[candles.length - 1].close

        case "RSI":
          return indicatorsService.getLatestRSI(candles, 14)

        case "MACD": {
          const macd = indicatorsService.getLatestMACD(candles)
          return macd.macd // Return the MACD line value
        }

        case "MA":
          return indicatorsService.getLatestMA(candles, 20)

        case "EMA(20)":
          return indicatorsService.getLatestEMA(candles, 20)

        case "EMA(50)":
          return indicatorsService.getLatestEMA(candles, 50)

        case "Bollinger Bands": {
          const bb = indicatorsService.getLatestBollingerBands(candles)
          return bb.middleBand // Return middle band (SMA)
        }

        default:
          console.warn(`Unknown indicator: ${indicator}`)
          return null
      }
    } catch (error) {
      console.error(`Error getting indicator value for ${indicator}:`, error)
      return null
    }
  }

  /**
   * Get the previous value of an indicator (for crossing/change detection)
   */
  async getPreviousIndicatorValue(
    symbol: string,
    indicator: IndicatorType,
    timeframe: Timeframe
  ): Promise<number | null> {
    try {
      const candles = await this.fetchCandles(symbol, timeframe)
      
      if (!candles || candles.length < 2) {
        return null
      }

      // Use all candles except the last one to get previous value
      const previousCandles = candles.slice(0, -1)

      switch (indicator) {
        case "Price":
          return previousCandles[previousCandles.length - 1].close

        case "RSI": {
          const rsiValues = indicatorsService.calculateRSI(previousCandles, 14)
          return rsiValues[rsiValues.length - 1]
        }

        case "MACD": {
          const macdResult = indicatorsService.calculateMACD(previousCandles)
          return macdResult.macd[macdResult.macd.length - 1]
        }

        case "MA": {
          const maValues = indicatorsService.calculateMA(previousCandles, 20)
          return maValues[maValues.length - 1]
        }

        case "EMA(20)": {
          const emaValues = indicatorsService.calculateEMA(previousCandles, 20)
          return emaValues[emaValues.length - 1]
        }

        case "EMA(50)": {
          const emaValues = indicatorsService.calculateEMA(previousCandles, 50)
          return emaValues[emaValues.length - 1]
        }

        case "Bollinger Bands": {
          const bbResult = indicatorsService.calculateBollingerBands(previousCandles)
          return bbResult.middleBand[bbResult.middleBand.length - 1]
        }

        default:
          return null
      }
    } catch (error) {
      console.error(`Error getting previous indicator value:`, error)
      return null
    }
  }

  /**
   * Evaluate a single condition
   */
  async evaluateCondition(
    symbol: string,
    condition: any,
    conditionIndex: number
  ): Promise<ConditionEvaluation> {
    const result: ConditionEvaluation = {
      conditionIndex,
      condition,
      currentValue: null,
      result: false,
    }

    try {
      const type = condition.type as ConditionType
      
      switch (type) {
        case "increased-by":
        case "decreased-by": {
          const indicator = condition.indicator1 as IndicatorType
          const timeframe = condition.timeframe1 as Timeframe
          const targetPercentage = Number(condition.value) || 0

          const currentValue = await this.getIndicatorValue(symbol, indicator, timeframe)
          const previousValue = await this.getPreviousIndicatorValue(symbol, indicator, timeframe)

          result.currentValue = currentValue
          result.previousValue = previousValue

          if (currentValue !== null && previousValue !== null && previousValue !== 0) {
            const percentageChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100

            if (type === "increased-by") {
              result.result = percentageChange >= targetPercentage
            } else {
              result.result = percentageChange <= -targetPercentage
            }
          }
          break
        }

        case "greater-than":
        case "lower-than": {
          const indicator1 = condition.indicator1 as IndicatorType
          const timeframe1 = condition.timeframe1 as Timeframe
          const indicator2 = condition.indicator2 as IndicatorType
          const timeframe2 = condition.timeframe2 as Timeframe

          const value1 = await this.getIndicatorValue(symbol, indicator1, timeframe1)
          const value2 = await this.getIndicatorValue(symbol, indicator2, timeframe2)

          result.currentValue = value1
          result.comparisonValue = value2

          if (value1 !== null && value2 !== null) {
            if (type === "greater-than") {
              result.result = value1 > value2
            } else {
              result.result = value1 < value2
            }
          }
          break
        }

        case "crossing-above":
        case "crossing-below": {
          const indicator1 = condition.indicator1 as IndicatorType
          const timeframe1 = condition.timeframe1 as Timeframe
          const indicator2 = condition.indicator2 as IndicatorType
          const timeframe2 = condition.timeframe2 as Timeframe

          const currentValue1 = await this.getIndicatorValue(symbol, indicator1, timeframe1)
          const previousValue1 = await this.getPreviousIndicatorValue(symbol, indicator1, timeframe1)
          const currentValue2 = await this.getIndicatorValue(symbol, indicator2, timeframe2)
          const previousValue2 = await this.getPreviousIndicatorValue(symbol, indicator2, timeframe2)

          result.currentValue = currentValue1
          result.previousValue = previousValue1
          result.comparisonValue = currentValue2

          if (
            currentValue1 !== null &&
            previousValue1 !== null &&
            currentValue2 !== null &&
            previousValue2 !== null
          ) {
            if (type === "crossing-above") {
              // Was below or equal, now above
              result.result = previousValue1 <= previousValue2 && currentValue1 > currentValue2
            } else {
              // Was above or equal, now below
              result.result = previousValue1 >= previousValue2 && currentValue1 < currentValue2
            }
          }
          break
        }

        default:
          result.error = `Unknown condition type: ${type}`
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error"
    }

    return result
  }

  /**
   * Evaluate a single rule (all conditions must be met)
   */
  async evaluateRule(
    symbol: string,
    rule: { name: string; conditions: any[]; actions: any[] },
    ruleIndex: number
  ): Promise<RuleEvaluation> {
    const conditionResults: ConditionEvaluation[] = []

    for (let i = 0; i < rule.conditions.length; i++) {
      const conditionResult = await this.evaluateCondition(symbol, rule.conditions[i], i)
      conditionResults.push(conditionResult)
    }

    const allConditionsMet = conditionResults.length > 0 && 
      conditionResults.every((c) => c.result === true)

    return {
      ruleIndex,
      ruleName: rule.name,
      conditions: conditionResults,
      allConditionsMet,
      actions: rule.actions,
    }
  }

  /**
   * Evaluate a complete strategy for a given symbol
   */
  async evaluateStrategy(
    strategy: SavedStrategy,
    symbol: string
  ): Promise<StrategyEvaluation> {
    // Clear cache before evaluation to get fresh data
    this.clearCache()

    const ruleEvaluations: RuleEvaluation[] = []

    for (let i = 0; i < strategy.rules.length; i++) {
      const ruleResult = await this.evaluateRule(symbol, strategy.rules[i], i)
      ruleEvaluations.push(ruleResult)
    }

    const triggeredRules = ruleEvaluations.filter((r) => r.allConditionsMet)

    return {
      strategyId: strategy.strategyId,
      strategyName: strategy.strategyName,
      symbol,
      evaluatedAt: new Date(),
      rules: ruleEvaluations,
      triggeredRules,
    }
  }

  /**
   * Evaluate a strategy for all its configured symbols
   */
  async evaluateStrategyAllSymbols(
    strategy: SavedStrategy
  ): Promise<StrategyEvaluation[]> {
    const results: StrategyEvaluation[] = []

    for (const symbol of strategy.symbols) {
      // Convert symbol format from "BTC/USD" to "BTCUSD" for Kraken API
      const krakenSymbol = symbol.replace("/", "")
      const result = await this.evaluateStrategy(strategy, krakenSymbol)
      results.push(result)
    }

    return results
  }

  /**
   * Get a summary of the evaluation results
   */
  getEvaluationSummary(evaluation: StrategyEvaluation): {
    totalRules: number
    triggeredRules: number
    totalConditions: number
    metConditions: number
    pendingActions: any[]
  } {
    let totalConditions = 0
    let metConditions = 0
    const pendingActions: any[] = []

    for (const rule of evaluation.rules) {
      totalConditions += rule.conditions.length
      metConditions += rule.conditions.filter((c) => c.result).length

      if (rule.allConditionsMet) {
        pendingActions.push(...rule.actions)
      }
    }

    return {
      totalRules: evaluation.rules.length,
      triggeredRules: evaluation.triggeredRules.length,
      totalConditions,
      metConditions,
      pendingActions,
    }
  }
}

// Export singleton instance
export const strategyRunner = new StrategyRunner()
