import { ActionType, IndicatorOption } from "../components/strategy/block-types"
import { candleService, type Candle } from "./candle-service"
import { indicatorsService } from "./indicators-service"
import type { SavedStrategy } from "./strategy-storage"

// Supported indicators
export const supportedIndicators: IndicatorOption[] = [
  { name: "Price", category: "price" },
  { name: "MA", category: "price" },
  { name: "EMA(20)", category: "price" },
  { name: "EMA(50)", category: "price" },
  { name: "Bollinger Bands", category: "price" },
  { name: "Value", category: "oscillator" },
  { name: "RSI(7)", category: "oscillator" },
  { name: "RSI(14)", category: "oscillator" },
  { name: "MACD", category: "oscillator" },
]

// Supported timeframes (matching candle-service)
export type Timeframe = "1min" | "5min" | "15min" | "30min" | "1h" | "4h" | "24h" | "1w"

export const supportedTimeframes: Timeframe[] = [
  "1min",
  "5min",
  "15min",
  "30min",
  "1h",
  "4h",
  "24h",
  "1w",
]

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
  actions: ActionType[]
}

export interface StrategyEvaluation {
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
   * @param symbol - Trading pair symbol
   * @param timeframe - Candle timeframe
   * @param until - Optional timestamp to filter candles before this time
   */
  async fetchCandles(symbol: string, timeframe: string, until?: number): Promise<Candle[]> {
    const cacheKey = this.getCacheKey(symbol, timeframe)
    
    let candles: Candle[]
    
    if (this.candleCache.has(cacheKey)) {
      candles = this.candleCache.get(cacheKey)!
    } else {
      // Convert symbol format from "BTC/USD" to "BTCUSD" for Kraken API
      const krakenSymbol = symbol.replace("/", "")
      candles = await candleService.fetchCandles(krakenSymbol, timeframe)
      this.candleCache.set(cacheKey, candles)
    }

    // Filter candles if until timestamp is provided
    if (until !== undefined) {
      return candles.filter(candle => (candle.time * 1000) < until)
    }
    
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
   * @param symbol - Trading pair symbol
   * @param indicator - Indicator name
   * @param timeframe - Candle timeframe
   * @param until - Optional timestamp to filter candles before this time
   */
  async getIndicatorValue(
    symbol: string,
    indicator: string,
    timeframe: Timeframe,
    until?: number
  ): Promise<number | null> {
    try {
      const candles = await this.fetchCandles(symbol, timeframe, until)
      
      if (!candles || candles.length === 0) {
        return null
      }

      switch (indicator) {
        case "Price":
          return candles[candles.length - 1].close

        case "RSI(14)":
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
   * @param symbol - Trading pair symbol
   * @param indicator - Indicator name
   * @param timeframe - Candle timeframe
   * @param until - Optional timestamp to filter candles before this time
   */
  async getPreviousIndicatorValue(
    symbol: string,
    indicator: string,
    timeframe: Timeframe,
    until?: number
  ): Promise<number | null> {
    try {
      const candles = await this.fetchCandles(symbol, timeframe, until)
      
      if (!candles || candles.length < 2) {
        return null
      }

      // Use all candles except the last one to get previous value
      const previousCandles = candles.slice(0, -1)

      switch (indicator) {
        case "Price":
          return previousCandles[previousCandles.length - 1].close

        case "RSI(14)": {
          const rsiValues = indicatorsService.calculateRSI(previousCandles, 14)
          return rsiValues[rsiValues.length - 1]
        }

        case "RSI(7)": {
          const rsiValues = indicatorsService.calculateRSI(previousCandles, 7)
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
   * @param symbol - Trading pair symbol
   * @param condition - Condition to evaluate
   * @param conditionIndex - Index of the condition
   * @param until - Optional timestamp to filter candles before this time
   */
  async evaluateCondition(
    symbol: string,
    condition: any,
    conditionIndex: number,
    until?: number
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
          const indicator = condition.indicator1 as string
          const timeframe = condition.timeframe1 as Timeframe
          const targetPercentage = Number(condition.value) || 0

          const currentValue = await this.getIndicatorValue(symbol, indicator, timeframe, until)
          const previousValue = await this.getPreviousIndicatorValue(symbol, indicator, timeframe, until)

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
          const indicator1 = condition.indicator1 as string
          const timeframe1 = condition.timeframe1 as Timeframe
          const indicator2 = condition.indicator2 as string

          const value1 = await this.getIndicatorValue(symbol, indicator1, timeframe1, until)
          
          // Handle "Value" indicator2 - use the value field directly
          let value2: number | null
          if (indicator2 === "Value") {
            value2 = condition.value !== undefined ? Number(condition.value) : null
          } else {
            const timeframe2 = condition.timeframe2 as Timeframe
            value2 = await this.getIndicatorValue(symbol, indicator2, timeframe2, until)
          }

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
          const indicator1 = condition.indicator1 as string
          const timeframe1 = condition.timeframe1 as Timeframe
          const indicator2 = condition.indicator2 as string

          const currentValue1 = await this.getIndicatorValue(symbol, indicator1, timeframe1, until)
          const previousValue1 = await this.getPreviousIndicatorValue(symbol, indicator1, timeframe1, until)
          
          // Handle "Value" indicator2 - use the value field directly (static value, no previous)
          let currentValue2: number | null
          let previousValue2: number | null
          if (indicator2 === "Value") {
            const staticValue = condition.value !== undefined ? Number(condition.value) : null
            currentValue2 = staticValue
            previousValue2 = staticValue // Static value doesn't change
          } else {
            const timeframe2 = condition.timeframe2 as Timeframe
            currentValue2 = await this.getIndicatorValue(symbol, indicator2, timeframe2, until)
            previousValue2 = await this.getPreviousIndicatorValue(symbol, indicator2, timeframe2, until)
          }

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
   * @param symbol - Trading pair symbol
   * @param rule - Rule to evaluate
   * @param ruleIndex - Index of the rule
   * @param until - Optional timestamp to filter candles before this time
   */
  async evaluateRule(
    symbol: string,
    rule: { name: string; conditions: any[]; actions: any[] },
    ruleIndex: number,
    until?: number
  ): Promise<RuleEvaluation> {
    const conditionResults: ConditionEvaluation[] = []

    for (let i = 0; i < rule.conditions.length; i++) {
      const conditionResult = await this.evaluateCondition(symbol, rule.conditions[i], i, until)
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
   * @param strategy - Strategy to evaluate
   * @param symbol - Trading pair symbol
   * @param until - Optional timestamp to filter candles before this time
   */
  async evaluateStrategy(
    strategy: SavedStrategy,
    symbol: string,
    until?: number
  ): Promise<StrategyEvaluation> {
    // Clear cache before evaluation to get fresh data
    this.clearCache()

    const ruleEvaluations: RuleEvaluation[] = []

    for (let i = 0; i < strategy.rules.length; i++) {
      const ruleResult = await this.evaluateRule(symbol, strategy.rules[i], i, until)
      ruleEvaluations.push(ruleResult)
    }

    const triggeredRules = ruleEvaluations.filter((r) => r.allConditionsMet)

    return {
      strategyName: strategy.strategyName,
      symbol,
      evaluatedAt: until ? new Date(until) : new Date(),
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
      const result = await this.evaluateStrategy(strategy, symbol)
      results.push(result)
    }

    return results
  }

  /**
   * Analyze a strategy by running multiple historical evaluations
   * @param strategy - Strategy to analyze
   * @param testCycles - Number of evaluation cycles to run
   * @param symbol - Trading pair symbol
   * @returns Array of strategy evaluations at different points in time
   */
  async analyzeStrategy(
    strategy: SavedStrategy,
    testCycles: number,
    symbol: string
  ): Promise<StrategyEvaluation[]> {
    // Get interval from strategy or default to 15 minutes
    const intervalMinutes = strategy.executionOptions?.runIntervalMinutes ?? 15
    const intervalMs = intervalMinutes * 60 * 1000

    // Calculate starting time: now - (cycles * intervalMinutes)
    const now = Date.now()
    const startTime = now - (testCycles * intervalMs)

    const results: StrategyEvaluation[] = []

    const lastRuleTriggerTimes: Map<number, number> = new Map()

    // Run evaluations for each cycle
    for (let i = 0; i < testCycles; i++) {
      const until = startTime + (i * intervalMs)
      const result = await this.evaluateStrategy(strategy, symbol, until);

      // if intervalBetweenExecutionsMinutes is set, skip evaluations for rules that were recently triggered
      if (strategy.executionOptions?.intervalBetweenExecutionsMinutes) {
        const intervalBetweenExecutionsMs = strategy.executionOptions.intervalBetweenExecutionsMinutes * 60 * 1000

        // Skip evaluations for rules that were recently triggered
        result.triggeredRules = result.triggeredRules.filter((ruleEval) => {
          const lastTriggerTime = lastRuleTriggerTimes.get(ruleEval.ruleIndex);
          return !lastTriggerTime || (until - lastTriggerTime) >= intervalBetweenExecutionsMs;
        });
      }

      // Update last trigger times for rules
      result.triggeredRules.forEach((ruleEval) => {
        lastRuleTriggerTimes.set(ruleEval.ruleIndex, until)
      });

      results.push(result)
    }

    return results
  }
}

// Export singleton instance
export const strategyRunner = new StrategyRunner()
