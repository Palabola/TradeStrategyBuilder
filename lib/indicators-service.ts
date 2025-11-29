import { CandleService, type Candle } from "./candle-service"

export class IndicatorsService {
  private candleService: CandleService

  constructor(candleService?: CandleService) {
    this.candleService = candleService || new CandleService()
  }

  /**
   * Calculate Exponential Moving Average (EMA) for a given period
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param period - The EMA period (e.g., 20 for EMA-20, 50 for EMA-50)
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns Array of EMA values (same length as input, with null for initial values)
   */
  calculateEMA(
    candles: Candle[],
    period: number,
    priceKey: "open" | "high" | "low" | "close" = "close",
  ): (number | null)[] {
    if (!candles || candles.length === 0) {
      return []
    }

    if (period <= 0) {
      throw new Error("Period must be greater than 0")
    }

    if (candles.length < period) {
      throw new Error(`Not enough data points. Need at least ${period} candles for EMA-${period}`)
    }

    const multiplier = 2 / (period + 1)
    const emaValues: (number | null)[] = []

    // Calculate SMA for the first EMA value
    let sum = 0
    for (let i = 0; i < period; i++) {
      emaValues.push(null)
      sum += candles[i][priceKey]
    }

    // First EMA value is the SMA of the first 'period' candles
    const firstEMA = sum / period
    emaValues[period - 1] = firstEMA

    // Calculate subsequent EMA values
    let previousEMA = firstEMA
    for (let i = period; i < candles.length; i++) {
      const currentPrice = candles[i][priceKey]
      const currentEMA = (currentPrice - previousEMA) * multiplier + previousEMA
      emaValues.push(currentEMA)
      previousEMA = currentEMA
    }

    return emaValues
  }

   /**
   * Get the latest EMA value for a given period
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param period - The EMA period
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns The latest EMA value or null if not enough data
   */
   getLatestEMA(
    candles: Candle[],
    period: number,
    priceKey: 'open' | 'high' | 'low' | 'close' = 'close',
  ): number | null {
    const emaValues = this.calculateEMA(candles, period, priceKey);
    return emaValues.length > 0 ? emaValues[emaValues.length - 1] : null;
  }


  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param fastPeriod - Fast EMA period (default: 12)
   * @param slowPeriod - Slow EMA period (default: 26)
   * @param signalPeriod - Signal line EMA period (default: 9)
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns Object containing MACD line, signal line, and histogram arrays
   *
   * Positive MACD: Bullish signal (price trending up)
   * Negative MACD: Bearish signal (price trending down)
   * Histogram > 0: MACD above signal line (bullish)
   * Histogram < 0: MACD below signal line (bearish)
   * MACD crosses above signal: Buy signal
   * MACD crosses below signal: Sell signal
   *
   */
  calculateMACD(
    candles: Candle[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    priceKey: 'open' | 'high' | 'low' | 'close' = 'close',
  ): {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  } {
    if (!candles || candles.length === 0) {
      return { macd: [], signal: [], histogram: [] };
    }

    const minLength = slowPeriod + signalPeriod - 1;
    if (candles.length < minLength) {
      throw new Error(
        `Not enough data points. Need at least ${minLength} candles for MACD(${fastPeriod},${slowPeriod},${signalPeriod})`,
      );
    }

    // Calculate fast and slow EMAs
    const fastEMA = this.calculateEMA(candles, fastPeriod, priceKey);
    const slowEMA = this.calculateEMA(candles, slowPeriod, priceKey);

    // Calculate MACD line (fast EMA - slow EMA)
    const macdLine: (number | null)[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (fastEMA[i] === null || slowEMA[i] === null) {
        macdLine.push(null);
      } else {
        macdLine.push(fastEMA[i]! - slowEMA[i]!);
      }
    }

    // Create virtual candles for signal line calculation
    // We need to calculate EMA of the MACD line values
    const macdCandles: Candlestick[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (macdLine[i] !== null) {
        macdCandles.push({
          ...candles[i],
          close: macdLine[i]!,
          open: macdLine[i]!,
          high: macdLine[i]!,
          low: macdLine[i]!,
        });
      }
    }

    // Calculate signal line (9-period EMA of MACD line)
    let signalLine: (number | null)[] = [];
    if (macdCandles.length >= signalPeriod) {
      signalLine = this.calculateEMA(macdCandles, signalPeriod, 'close');

      // Pad with nulls at the beginning to match original length
      const paddingLength = candles.length - macdCandles.length;
      signalLine = (Array(paddingLength).fill(null) as (number | null)[]).concat(signalLine);
    } else {
      signalLine = Array(candles.length).fill(null) as (number | null)[];
    }

    // Calculate histogram (MACD line - signal line)
    const histogram: (number | null)[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (macdLine[i] === null || signalLine[i] === null) {
        histogram.push(null);
      } else {
        histogram.push(macdLine[i]! - signalLine[i]!);
      }
    }

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
    };
  }

  /**
   * Get the latest MACD values
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param fastPeriod - Fast EMA period (default: 12)
   * @param slowPeriod - Slow EMA period (default: 26)
   * @param signalPeriod - Signal line EMA period (default: 9)
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns Object containing latest MACD, signal, and histogram values
   */
  getLatestMACD(
    candles: Candle[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    priceKey: 'open' | 'high' | 'low' | 'close' = 'close',
  ): {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  } {
    const result = this.calculateMACD(candles, fastPeriod, slowPeriod, signalPeriod, priceKey);

    return {
      macd: result.macd.length > 0 ? result.macd[result.macd.length - 1] : null,
      signal: result.signal.length > 0 ? result.signal[result.signal.length - 1] : null,
      histogram: result.histogram.length > 0 ? result.histogram[result.histogram.length - 1] : null,
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param period - The RSI period (default: 14)
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns Array of RSI values (same length as input, with null for initial values)
   */
  calculateRSI(
    candles: Candle[],
    period: number = 14,
    priceKey: 'open' | 'high' | 'low' | 'close' = 'close',
  ): (number | null)[] {
    if (!candles || candles.length === 0) {
      return [];
    }

    if (period <= 0) {
      throw new Error('Period must be greater than 0');
    }

    if (candles.length < period + 1) {
      throw new Error(`Not enough data points. Need at least ${period + 1} candles for RSI-${period}`);
    }

    const rsiValues: (number | null)[] = [null]; // First value is always null (no previous price)

    // Calculate price changes
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const change = candles[i][priceKey] - candles[i - 1][priceKey];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate initial average gain and loss (SMA for first period)
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
      avgGain += gains[i];
      avgLoss += losses[i];
      rsiValues.push(null); // Not enough data yet
    }

    avgGain = avgGain / period;
    avgLoss = avgLoss / period;

    // Calculate first RSI value
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues[period] = rsi;

    // Calculate subsequent RSI values using smoothed averages
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const currentRsi = 100 - 100 / (1 + currentRs);
      rsiValues.push(currentRsi);
    }

    return rsiValues;
  }

  /**
   * Get the latest RSI value for a given period
   * @param candles - Array of candlesticks (must be sorted from oldest to newest)
   * @param period - The RSI period
   * @param priceKey - Which price to use for calculation (default: 'close')
   * @returns The latest RSI value or null if not enough data
   */
  getLatestRSI(
    candles: Candle[],
    period: number = 14,
    priceKey: 'open' | 'high' | 'low' | 'close' = 'close',
  ): number | null {
    const rsiValues = this.calculateRSI(candles, period, priceKey);
    return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
  }
}

export const indicatorsService = new IndicatorsService()
