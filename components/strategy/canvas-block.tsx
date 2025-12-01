"use client"

import type React from "react"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { BlockConfig, Parameter, IndicatorOption, CustomTheme } from "./block-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, X, ChevronDown, ChevronUp } from "lucide-react"

interface CanvasBlockProps {
  id: string
  config: BlockConfig
  values: Record<string, string | number>
  onRemove: () => void
  onValueChange: (name: string, value: string | number) => void
  themeOverride?: CustomTheme
}

function generateDynamicTitle(config: BlockConfig, values: Record<string, string | number>): React.ReactNode {
  const indicator = values.indicator ?? config.parameters.find((p) => p.name === "indicator")?.default ?? ""
  const value = values.value ?? config.parameters.find((p) => p.name === "value")?.default ?? ""
  const candles = values.candles ?? config.parameters.find((p) => p.name === "candles")?.default ?? ""

  const indicator1 = values.indicator1 ?? config.parameters.find((p) => p.name === "indicator1")?.default ?? ""
  const candles1 = values.candles1 ?? config.parameters.find((p) => p.name === "candles1")?.default ?? ""
  const indicator2 = values.indicator2 ?? config.parameters.find((p) => p.name === "indicator2")?.default ?? ""
  const candles2 = values.candles2 ?? config.parameters.find((p) => p.name === "candles2")?.default ?? ""

  const amount = values.amount ?? config.parameters.find((p) => p.name === "amount")?.default ?? ""
  const unit = values.unit ?? config.parameters.find((p) => p.name === "unit")?.default ?? ""
  const message = values.message ?? config.parameters.find((p) => p.name === "message")?.default ?? ""
  const channel = values.channel ?? config.parameters.find((p) => p.name === "channel")?.default ?? ""

  // Position fields
  const side = values.side ?? config.parameters.find((p) => p.name === "side")?.default ?? ""
  const leverage = values.leverage ?? config.parameters.find((p) => p.name === "leverage")?.default ?? ""
  const stopLoss = values.stopLoss ?? config.parameters.find((p) => p.name === "stopLoss")?.default ?? 0
  const takeProfit = values.takeProfit ?? config.parameters.find((p) => p.name === "takeProfit")?.default ?? 0

  switch (config.type) {
    case "increased-by":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator} ({candles})
          </span>{" "}
          <span className="font-bold">Increased by</span> <span className="italic text-muted-foreground">{value}%</span>
        </>
      )
    case "decreased-by":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator} ({candles})
          </span>{" "}
          <span className="font-bold">Decreased by</span> <span className="italic text-muted-foreground">{value}%</span>
        </>
      )
    case "greater-than":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator1} ({candles1})
          </span>{" "}
          <span className="font-bold">Greater than</span>{" "}
          <span className="italic text-muted-foreground">
            {indicator2 === "Value" ? value : `${indicator2} (${candles2})`}
          </span>
        </>
      )
    case "lower-than":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator1} ({candles1})
          </span>{" "}
          <span className="font-bold">Lower than</span>{" "}
          <span className="italic text-muted-foreground">
            {indicator2 === "Value" ? value : `${indicator2} (${candles2})`}
          </span>
        </>
      )
    case "crossing-above":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator1} ({candles1})
          </span>{" "}
          <span className="font-bold">Crossing above</span>{" "}
          <span className="italic text-muted-foreground">
            {indicator2 === "Value" ? value : `${indicator2} (${candles2})`}
          </span>
        </>
      )
    case "crossing-below":
      return (
        <>
          <span className="italic text-muted-foreground">
            {indicator1} ({candles1})
          </span>{" "}
          <span className="font-bold">Crossing below</span>{" "}
          <span className="italic text-muted-foreground">
            {indicator2 === "Value" ? value : `${indicator2} (${candles2})`}
          </span>
        </>
      )
    case "open-position":
      return (
        <>
          <span className="font-bold">Open {side}</span>{" "}
          <span className="italic text-muted-foreground">
            {amount} {unit}
          </span>
          {leverage && leverage !== "No" && (
            <span className="italic text-muted-foreground"> @ {leverage}</span>
          )}
          {(Number(stopLoss) > 0 || Number(takeProfit) > 0) && (
            <span className="italic text-muted-foreground">
              {Number(stopLoss) > 0 && ` SL:${stopLoss}%`}
              {Number(takeProfit) > 0 && ` TP:${takeProfit}%`}
            </span>
          )}
        </>
      )
    case "close-position":
      return (
        <>
          <span className="font-bold">Close All Positions</span>
        </>
      )
    case "buy":
      return (
        <>
          <span className="font-bold">Buy</span>{" "}
          <span className="italic text-muted-foreground">
            {amount} {unit}
          </span>
        </>
      )
    case "sell":
      return (
        <>
          <span className="font-bold">Sell</span>{" "}
          <span className="italic text-muted-foreground">
            {amount} {unit}
          </span>
        </>
      )
    case "notify-me":
      return (
        <>
          <span className="font-bold">Notify Me</span>{" "}
          <span className="italic text-muted-foreground">via {channel}</span>
        </>
      )
    default:
      return <span className="font-bold">{config.label}</span>
  }
}

export function CanvasBlock({ id, config, values, onRemove, onValueChange, themeOverride }: CanvasBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = config.icon

  // Get effective colors (themeOverride takes precedence)
  const blockTheme = themeOverride?.blocks?.[config.type]
  const effectiveColor = blockTheme?.color ?? config.color
  const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor

  // Helper to get category label for display
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case "price": return "Price-based"
      case "oscillator": return "Oscillators"
      case "volume": return "Volume"
      case "volatility": return "Volatility"
      default: return category
    }
  }

  // Helper to group indicator options by category
  const groupIndicatorsByCategory = (indicators: IndicatorOption[]) => {
    return indicators.reduce((acc, ind) => {
      if (!acc[ind.category]) {
        acc[ind.category] = []
      }
      acc[ind.category].push(ind)
      return acc
    }, {} as Record<string, IndicatorOption[]>)
  }

  // Render indicator select with category grouping
  const renderIndicatorSelect = (param: Parameter, filteredOptions?: IndicatorOption[]) => {
    const value = values[param.name] ?? param.default ?? ""
    const indicators = filteredOptions ?? param.indicatorOptions ?? []
    const grouped = groupIndicatorsByCategory(indicators)

    return (
      <Select value={String(value)} onValueChange={(v) => onValueChange(param.name, v)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${param.label}`} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(grouped).map(([category, options]) => (
            <SelectGroup key={category}>
              <SelectLabel>{getCategoryLabel(category)}</SelectLabel>
              {options.map((ind) => (
                <SelectItem key={ind.name} value={ind.name}>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const renderParameter = (param: Parameter) => {
    const value = values[param.name] ?? param.default ?? ""

    // Handle indicator parameters specially
    if (param.indicatorOptions && param.indicatorOptions.length > 0) {
      return renderIndicatorSelect(param)
    }

    switch (param.type) {
      case "select":
        return (
          <Select value={String(value)} onValueChange={(v) => onValueChange(param.name, v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${param.label}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onValueChange(param.name, Number(e.target.value))}
            placeholder={param.placeholder}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => onValueChange(param.name, e.target.value)}
            placeholder={param.placeholder}
            rows={3}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={String(value)}
            onChange={(e) => onValueChange(param.name, e.target.value)}
            placeholder={param.placeholder}
          />
        )
    }
  }

  const renderConditionParameters = () => {
    const isIncreasedDecreased = config.type === "increased-by" || config.type === "decreased-by"
    const isGreaterLower = config.type === "greater-than" || config.type === "lower-than"

    if (isIncreasedDecreased) {
      const indicatorParam = config.parameters.find((p) => p.name === "indicator")
      const candlesParam = config.parameters.find((p) => p.name === "candles")
      const valueParam = config.parameters.find((p) => p.name === "value")

      return (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Indicator</Label>
              {indicatorParam && renderParameter(indicatorParam)}
            </div>
            <div className="space-y-2">
              <Label>Candles</Label>
              {candlesParam && renderParameter(candlesParam)}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{valueParam?.label}</Label>
            {valueParam && renderParameter(valueParam)}
          </div>
        </div>
      )
    }

    if (isGreaterLower) {
      const indicator1Param = config.parameters.find((p) => p.name === "indicator1")
      const candles1Param = config.parameters.find((p) => p.name === "candles1")
      const indicator2Param = config.parameters.find((p) => p.name === "indicator2")
      const candles2Param = config.parameters.find((p) => p.name === "candles2")

      const conditionLabel = config.type === "greater-than" ? "Greater Than" : "Lower Than"

      // Get selected indicator1 value and find its category
      const indicator1Value = values.indicator1 ?? indicator1Param?.default ?? ""
      const indicator1Option = indicator1Param?.indicatorOptions?.find((ind) => ind.name === indicator1Value)
      const indicator1Category = indicator1Option?.category

      // Filter indicator2 options to match the same category as indicator1
      const filteredIndicator2Options = indicator1Category && indicator2Param?.indicatorOptions
        ? indicator2Param.indicatorOptions.filter((ind) => ind.category === indicator1Category)
        : indicator2Param?.indicatorOptions

      // Check if indicator2 is "Value" - show numeric input instead
      const indicator2Value = values.indicator2 ?? indicator2Param?.default ?? ""
      const isValueSelected = indicator2Value === "Value"

      return (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Indicator</Label>
              {indicator1Param && renderParameter(indicator1Param)}
            </div>
            <div className="space-y-2">
              <Label>Candles</Label>
              {candles1Param && renderParameter(candles1Param)}
            </div>
          </div>

          <div className={`py-2 font-semibold ${effectiveColor}`}>{conditionLabel}</div>

          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Target Indicator</Label>
              {indicator2Param && renderIndicatorSelect(indicator2Param, filteredIndicator2Options)}
            </div>
            {isValueSelected ? (
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={values.value ?? ""}
                  onChange={(e) => onValueChange("value", parseFloat(e.target.value) || 0)}
                  placeholder="Enter value"
                  className="w-24"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Candles</Label>
                {candles2Param && renderParameter(candles2Param)}
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  const renderActionParameters = () => {
    if (config.type === "open-position") {
      const sideParam = config.parameters.find((p) => p.name === "side")
      const amountParam = config.parameters.find((p) => p.name === "amount")
      const unitParam = config.parameters.find((p) => p.name === "unit")
      const leverageParam = config.parameters.find((p) => p.name === "leverage")
      const stopLossParam = config.parameters.find((p) => p.name === "stopLoss")
      const takeProfitParam = config.parameters.find((p) => p.name === "takeProfit")

      return (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Side</Label>
              {sideParam && renderParameter(sideParam)}
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              {amountParam && renderParameter(amountParam)}
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              {unitParam && renderParameter(unitParam)}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Leverage</Label>
              {leverageParam && renderParameter(leverageParam)}
            </div>
            <div className="space-y-2">
              <Label>Stop Loss (%)</Label> 
              {stopLossParam && renderParameter(stopLossParam)}
            </div>
            <div className="space-y-2">
              <Label>Take Profit (%)</Label>
              {takeProfitParam && renderParameter(takeProfitParam)}
            </div>
          </div>
        </div>
      )
    }

    if (config.type === "close-position") {
      // No parameters for close-position
      return null
    }

    if (config.type === "buy" || config.type === "sell") {
      const amountParam = config.parameters.find((p) => p.name === "amount")
      const unitParam = config.parameters.find((p) => p.name === "unit")

      return (
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Amount</Label>
            {amountParam && renderParameter(amountParam)}
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            {unitParam && renderParameter(unitParam)}
          </div>
        </div>
      )
    }

    if (config.type === "notify-me") {
      const channelParam = config.parameters.find((p) => p.name === "channel")
      const messageParam = config.parameters.find((p) => p.name === "message")
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            {channelParam && renderParameter(channelParam)}
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            {messageParam && renderParameter(messageParam)}
          </div>
        </div>
      )
    }

    return null
  }

  const renderCrossingParameters = () => {
    const isCrossingBlock = config.type === "crossing-above" || config.type === "crossing-below"
    if (!isCrossingBlock) return null

    const indicator1Param = config.parameters.find((p) => p.name === "indicator1")
    const candles1Param = config.parameters.find((p) => p.name === "candles1")
    const indicator2Param = config.parameters.find((p) => p.name === "indicator2")
    const candles2Param = config.parameters.find((p) => p.name === "candles2")

    const crossingLabel = config.type === "crossing-above" ? "Crossing Above" : "Crossing Below"

    // Get selected indicator1 value and find its category
    const indicator1Value = values.indicator1 ?? indicator1Param?.default ?? ""
    const indicator1Option = indicator1Param?.indicatorOptions?.find((ind) => ind.name === indicator1Value)
    const indicator1Category = indicator1Option?.category

    // Filter indicator2 options to match the same category as indicator1
    const filteredIndicator2Options = indicator1Category && indicator2Param?.indicatorOptions
      ? indicator2Param.indicatorOptions.filter((ind) => ind.category === indicator1Category)
      : indicator2Param?.indicatorOptions

    // Check if indicator2 is "Value" - show numeric input instead
    const indicator2Value = values.indicator2 ?? indicator2Param?.default ?? ""
    const isValueSelected = indicator2Value === "Value"

    return (
      <div className="space-y-4">
        {/* First indicator row */}
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Indicator</Label>
            {indicator1Param && renderParameter(indicator1Param)}
          </div>
          <div className="space-y-2">
            <Label>Candles</Label>
            {candles1Param && renderParameter(candles1Param)}
          </div>
        </div>

        <div className={`py-2 font-semibold ${effectiveColor}`}>{crossingLabel}</div>

        {/* Second indicator row */}
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Target Indicator</Label>
            {indicator2Param && renderIndicatorSelect(indicator2Param, filteredIndicator2Options)}
          </div>
          {isValueSelected ? (
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="number"
                value={values.value ?? ""}
                onChange={(e) => onValueChange("value", parseFloat(e.target.value) || 0)}
                placeholder="Enter value"
                className="w-24"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Candles</Label>
              {candles2Param && renderParameter(candles2Param)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const isCrossingBlock = config.type === "crossing-above" || config.type === "crossing-below"
  const isIncreasedDecreased = config.type === "increased-by" || config.type === "decreased-by"
  const isGreaterLower = config.type === "greater-than" || config.type === "lower-than"
  const isActionBlock =
    config.type === "open-position" || config.type === "close-position" || config.type === "notify-me" || config.type === "buy" || config.type === "sell"

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => e.stopPropagation()} className={`relative rounded-lg border-2 ${effectiveBgColor} bg-card shadow-sm`}>
      <div className={`flex items-center justify-between p-3 border-b border-border rounded-t-md ${effectiveBgColor}`}>
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${effectiveBgColor} ${effectiveColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm">{generateDynamicTitle(config, values)}</span>
        </div>
        <div className="flex items-center gap-2">
          {config.parameters.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && config.parameters.length > 0 && (
        <div className="p-4 bg-card/50">
          {isActionBlock ? (
            renderActionParameters()
          ) : isCrossingBlock ? (
            renderCrossingParameters()
          ) : isIncreasedDecreased || isGreaterLower ? (
            renderConditionParameters()
          ) : (
            <div className="space-y-4">
              {config.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <Label>{param.label}</Label>
                  {renderParameter(param)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
