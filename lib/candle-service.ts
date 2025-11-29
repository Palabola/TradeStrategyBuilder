// Kraken OHLC API interval values
export type KrakenInterval = 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600

// Map our timeframe strings to Kraken interval values
export const timeframeToInterval: Record<string, KrakenInterval> = {
  "1min": 1,
  "5min": 5,
  "15min": 15,
  "30min": 30,
  "1h": 60,
  "4h": 240,
  "24h": 1440,
  "1w": 10080,
}

// Candle data structure from Kraken API
// [time, open, high, low, close, vwap, volume, count]
export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  vwap: number
  volume: number
  count: number
}

export interface KrakenOHLCResponse {
  error: string[]
  result: {
    [pair: string]: Array<[number, string, string, string, string, string, string, number]>
    last?: number
  }
}

export class CandleService {
  private baseUrl = "https://api.kraken.com/0/public/OHLC"

  /**
   * Fetches candle data from Kraken API
   * @param symbol - Trading pair symbol (e.g., 'BTCUSD', 'ETHUSD')
   * @param timeframe - Candle timeframe (e.g., '5min', '1h', '4h')
   * @param since - Optional: Return committed OHLC data since given timestamp
   * @returns Array of Candle objects
   */
  async fetchCandles(symbol: string, timeframe: string, since?: number): Promise<Candle[]> {
    const interval = timeframeToInterval[timeframe]

    if (!interval) {
      throw new Error(`Unsupported timeframe: ${timeframe}. Supported: ${Object.keys(timeframeToInterval).join(", ")}`)
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      pair: symbol,
      interval: interval.toString(),
    })

    if (since) {
      params.append("since", since.toString())
    }

    const url = `${this.baseUrl}?${params.toString()}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Kraken API error: ${response.status} ${response.statusText}`)
      }

      const data: KrakenOHLCResponse = await response.json()

      // Check for API errors
      if (data.error && data.error.length > 0) {
        throw new Error(`Kraken API error: ${data.error.join(", ")}`)
      }

      // Extract candles from result
      // The result contains the pair data and a 'last' timestamp
      const pairKey = Object.keys(data.result).find((key) => key !== "last")

      if (!pairKey) {
        return []
      }

      const rawCandles = data.result[pairKey] as Array<[number, string, string, string, string, string, string, number]>

      // Transform raw data to Candle objects
      const candles: Candle[] = rawCandles.map((candle) => ({
        time: candle[0],
        open: Number.parseFloat(candle[1]),
        high: Number.parseFloat(candle[2]),
        low: Number.parseFloat(candle[3]),
        close: Number.parseFloat(candle[4]),
        vwap: Number.parseFloat(candle[5]),
        volume: Number.parseFloat(candle[6]),
        count: candle[7],
      }))

      return candles
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch candles: ${error.message}`)
      }
      throw new Error("Failed to fetch candles: Unknown error")
    }
  }

 
}

// Export singleton instance
export const candleService = new CandleService()
