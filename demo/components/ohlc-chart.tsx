"use client"

import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  ReferenceDot,
} from "recharts"
import { format } from "date-fns"
import type { Candle } from "@/lib/candle-service"

// Trade marker for displaying on chart
export interface TradeMarker {
  timestamp: number // Unix timestamp in milliseconds
  price: number
  type: "buy" | "sell"
  orderType: string
  volume: number
}

interface OHLCChartProps {
  data: Candle[]
  isLoading?: boolean
  tradeMarkers?: TradeMarker[]
  ruleMarkers?: any[]
}

interface ChartDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  fill: string
  candleData: [number, number, number, number] // [low, open, close, high]
  // Trade marker data (if any trade occurred at this candle)
  tradeMarker?: TradeMarker
  // Rule markers (triggered rules at this candle)
  ruleMarkers?: any[]
}

export function OHLCChart({ data, isLoading = false, tradeMarkers = [], ruleMarkers = [] }: OHLCChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      // Take only the last 100 candles
      const lastCandles = data.slice(-100)
      
      const formattedData: ChartDataPoint[] = lastCandles.map((candle) => {
        const isGreen = candle.close >= candle.open
        const candleTime = candle.time * 1000 // Convert to milliseconds
        
        // Find trade marker for this candle (within the candle's time range)
        const marker = tradeMarkers.find(m => {
          // Check if the trade timestamp falls within this candle's time period
          return m.timestamp >= candleTime && m.timestamp < candleTime + getTimeframeMs(data)
        })
        
        // Find rule markers for this candle (within the candle's time range)
        const candleRuleMarkers = ruleMarkers.filter(m => {
          // Check if the rule trigger timestamp falls within this candle's time period
          return m.timestamp >= candleTime && m.timestamp < candleTime + getTimeframeMs(data)
        })
        
        return {
          time: candleTime,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
          fill: isGreen ? "#22c55e" : "#ef4444", // green-500 : red-500
          candleData: [candle.low, candle.open, candle.close, candle.high],
          tradeMarker: marker,
          ruleMarkers: candleRuleMarkers,
        }
      })
      setChartData(formattedData)
    }
  }, [data, tradeMarkers, ruleMarkers])
  
  // Helper to estimate timeframe in ms from candle data
  function getTimeframeMs(candles: Candle[]): number {
    if (candles.length < 2) return 60000 // Default to 1 minute
    return (candles[1].time - candles[0].time) * 1000
  }

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">
            {format(new Date(data.time), "MMM dd, yyyy HH:mm")}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-medium">${data.open.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">High:</span>
              <span className="font-medium text-success">${data.high.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-medium text-destructive">${data.low.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Close:</span>
              <span className="font-medium">${data.close.toLocaleString()}</span>
            </div>
            {data.tradeMarker && 
              <div className="pt-1 border-t border-border space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Trade:</span>
                  <span className={`font-medium ${data.tradeMarker.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                    {data.tradeMarker.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-sm">{data.tradeMarker.volume.toFixed(6)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{data.tradeMarker.orderType}</span>
                </div>
              </div>
            }
            {data.ruleMarkers && data.ruleMarkers.length > 0 && 
              <div className="pt-1 border-t border-border space-y-1">
                {data.ruleMarkers.map((rule: any, index: number) => (
                  <div key={index} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Rule:</span>
                    <span className="font-medium">{rule.ruleName}</span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate Y-axis domain with some padding
  const allLows = chartData.map((d) => d.low)
  const allHighs = chartData.map((d) => d.high)
  const minPrice = Math.min(...allLows) * 0.995
  const maxPrice = Math.max(...allHighs) * 1.005
  const yDomain: [number, number] = [minPrice, maxPrice]

  // Custom candlestick shape component with trade markers
  const Candlestick = (props: any) => {
    const { x, width, payload, background } = props
    
    if (!payload || !payload.candleData || !background) return null
    
    const [low, open, close, high] = payload.candleData
    const fill = payload.fill
    const tradeMarker = payload.tradeMarker as TradeMarker | undefined
    
    // Use background to get the full chart area dimensions
    const chartTop = background.y
    const chartHeight = background.height
    
    // Create a linear scale function
    const priceToY = (price: number) => {
      const ratio = (price - minPrice) / (maxPrice - minPrice)
      // Invert because SVG y increases downward
      return chartTop + chartHeight * (1 - ratio)
    }
    
    // Calculate Y positions using our scale
    const highY = priceToY(high)
    const lowY = priceToY(low)
    const openY = priceToY(open)
    const closeY = priceToY(close)
    
    const bodyTop = Math.min(openY, closeY)
    const bodyBottom = Math.max(openY, closeY)
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1)
    
    const wickX = x + width / 2
    const ruleMarkersArray = payload.ruleMarkers as any[] | undefined
    
    // Trade marker rendering
    const renderTradeMarker = () => {
      if (!tradeMarker) return null
      
      const markerY = priceToY(tradeMarker.price)
      const isBuy = tradeMarker.type === "buy"
      const markerColor = isBuy ? "#22c55e" : "#ef4444" // green for buy, red for sell
      const markerSize = 6
      
      // Triangle pointing up for buy, down for sell
      if (isBuy) {
        // Buy marker - triangle pointing up below the candle
        const triangleY = lowY + markerSize + 4
        return (
          <g>
            <polygon
              points={`${wickX},${triangleY - markerSize} ${wickX - markerSize},${triangleY + markerSize} ${wickX + markerSize},${triangleY + markerSize}`}
              fill={markerColor}
              stroke={markerColor}
              strokeWidth={1}
            />
          </g>
        )
      } else {
        // Sell marker - triangle pointing down above the candle
        const triangleY = highY - markerSize - 4
        return (
          <g>
            <polygon
              points={`${wickX},${triangleY + markerSize} ${wickX - markerSize},${triangleY - markerSize} ${wickX + markerSize},${triangleY - markerSize}`}
              fill={markerColor}
              stroke={markerColor}
              strokeWidth={1}
            />
          </g>
        )
      }
    }
    
    // Rule marker rendering - displayed at bottom of chart
    const renderRuleMarker = () => {
      if (!ruleMarkersArray || ruleMarkersArray.length === 0) return null
      
      // Position at the bottom of the chart
      const markerY = chartTop + chartHeight - 10
      const markerColor = "#3b82f6" // blue-500
      const markerSize = 5
      const markerCount = ruleMarkersArray.length
      
      return (
        <g>
          {/* Diamond shape for rule marker */}
          <polygon
            points={`${wickX},${markerY - markerSize} ${wickX + markerSize},${markerY} ${wickX},${markerY + markerSize} ${wickX - markerSize},${markerY}`}
            fill={markerColor}
            stroke={markerColor}
            strokeWidth={1}
          />
          {/* Display count if multiple rules triggered */}
          {markerCount > 1 && (
            <text
              x={wickX}
              y={markerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
            >
              {markerCount}
            </text>
          )}
        </g>
      )
    }
    
    return (
      <g>
        {/* Wick line */}
        <line
          x1={wickX}
          y1={highY}
          x2={wickX}
          y2={lowY}
          stroke={fill}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={x}
          y={bodyTop}
          width={width}
          height={bodyHeight}
          fill={fill}
          stroke={fill}
          strokeWidth={1}
        />
        {/* Trade marker */}
        {renderTradeMarker()}
        {/* Rule marker */}
        {renderRuleMarker()}
      </g>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(new Date(time), "MMM dd HH:mm")}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: "var(--muted-foreground)" }}
            style={{ fill: "var(--muted-foreground)" }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={(value) => `$${value.toFixed(1)}`}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: "var(--muted-foreground)" }}
            style={{ fill: "var(--muted-foreground)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="high"
            shape={<Candlestick />}
            fill="#8884d8"
            background={{ fill: "transparent" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
