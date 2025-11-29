"use client"

import type React from "react"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { BlockConfig, Parameter } from "./block-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, X, ChevronDown, ChevronUp } from "lucide-react"

interface CanvasBlockProps {
  id: string
  config: BlockConfig
  values: Record<string, string | number>
  onRemove: () => void
  onValueChange: (name: string, value: string | number) => void
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
            {indicator2} ({candles2})
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
            {indicator2} ({candles2})
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
            {indicator2} ({candles2})
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
            {indicator2} ({candles2})
          </span>
        </>
      )
    case "open-position":
      return (
        <>
          <span className="font-bold">Open Position</span>{" "}
          <span className="italic text-muted-foreground">
            {amount} {unit}
          </span>
        </>
      )
    case "close-position":
      return (
        <>
          <span className="font-bold">Close Position</span>{" "}
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

export function CanvasBlock({ id, config, values, onRemove, onValueChange }: CanvasBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = config.icon

  const renderParameter = (param: Parameter) => {
    const value = values[param.name] ?? param.default ?? ""

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

          <div className={`py-2 font-semibold ${config.color}`}>{conditionLabel}</div>

          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Target Indicator</Label>
              {indicator2Param && renderParameter(indicator2Param)}
            </div>
            <div className="space-y-2">
              <Label>Candles</Label>
              {candles2Param && renderParameter(candles2Param)}
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderActionParameters = () => {
    if (config.type === "open-position") {
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

    if (config.type === "close-position") {
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

        <div className={`py-2 font-semibold ${config.color}`}>{crossingLabel}</div>

        {/* Second indicator row */}
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Target Indicator</Label>
            {indicator2Param && renderParameter(indicator2Param)}
          </div>
          <div className="space-y-2">
            <Label>Candles</Label>
            {candles2Param && renderParameter(candles2Param)}
          </div>
        </div>
      </div>
    )
  }

  const isCrossingBlock = config.type === "crossing-above" || config.type === "crossing-below"
  const isIncreasedDecreased = config.type === "increased-by" || config.type === "decreased-by"
  const isGreaterLower = config.type === "greater-than" || config.type === "lower-than"
  const isActionBlock =
    config.type === "open-position" || config.type === "close-position" || config.type === "notify-me"

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => e.stopPropagation()} className={`relative rounded-lg border-2 ${config.bgColor} bg-card shadow-sm`}>
      <div className={`flex items-center justify-between p-3 border-b border-border rounded-t-md ${config.bgColor}`}>
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${config.bgColor} ${config.color}`}>
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
