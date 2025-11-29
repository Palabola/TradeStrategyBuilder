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
} from "recharts"
import { format } from "date-fns"
import type { Candle } from "@/lib/candle-service"

interface OHLCChartProps {
  data: Candle[]
  isLoading?: boolean
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
}

export function OHLCChart({ data, isLoading = false }: OHLCChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      // Take only the last 100 candles
      const lastCandles = data.slice(-100)
      
      const formattedData: ChartDataPoint[] = lastCandles.map((candle) => {
        const isGreen = candle.close >= candle.open
        return {
          time: candle.time * 1000, // Convert to milliseconds
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
          fill: isGreen ? "#22c55e" : "#ef4444", // green-500 : red-500
          candleData: [candle.low, candle.open, candle.close, candle.high],
        }
      })
      setChartData(formattedData)
    }
  }, [data])

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
          <div className="space-y-1 text-sm">
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
            <div className="flex justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-medium">{data.volume.toFixed(2)}</span>
            </div>
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

  // Custom candlestick shape component
  const Candlestick = (props: any) => {
    const { x, width, payload, background } = props
    
    if (!payload || !payload.candleData || !background) return null
    
    const [low, open, close, high] = payload.candleData
    const fill = payload.fill
    
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
      </g>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(new Date(time), "MMM dd HH:mm")}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
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
