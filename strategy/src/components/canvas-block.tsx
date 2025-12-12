"use client"

import type React from "react"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { BlockConfig, BlockType, CustomTheme, IndicatorOption, Parameter } from "../types"

interface CanvasBlockProps {
  id: string
  blockType: BlockType
  config: BlockConfig
  values: Record<string, string | number>
  onRemove: () => void
  onValueChange: (name: string, value: string | number) => void
  themeOverride?: CustomTheme
}

function generateDynamicTitle(config: BlockConfig, values: Record<string, string | number>): React.ReactNode {
  // Build complete values object with defaults (flatten 2D array)
  const completeValues: Record<string, string | number> = {}
  for (const row of config.parameters) {
    for (const param of row) {
      completeValues[param.name] = values[param.name] ?? param.default ?? ""
    }
  }

  return (
    <>
      {config.labelPrefixFunction && (
        <span className="italic text-muted-foreground">
          {config.labelPrefixFunction(completeValues)}
        </span>
      )}
      {config.labelPrefixFunction && " "}
      <span className="font-bold">{config.label}</span>
      {config.labelPostfixFunction && " "}
      {config.labelPostfixFunction && (
        <span className="italic text-muted-foreground">
          {config.labelPostfixFunction(completeValues)}
        </span>
      )}
    </>
  )
}

// Helper to find a parameter by name in the 2D array
function findParameter(parameters: Parameter[][], name: string): Parameter | undefined {
  for (const row of parameters) {
    const found = row.find((p) => p.name === name)
    if (found) return found
  }
  return undefined
}

export function CanvasBlock({ id, blockType, config, values, onRemove, onValueChange, themeOverride }: CanvasBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const { setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = config.icon

  // Get effective colors (themeOverride takes precedence)
  const blockTheme = themeOverride?.blocks?.[blockType]
  const effectiveColor = blockTheme?.color ?? config.color
  const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor

  // Helper to get category label for display
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case "price": return "Price-based"
      case "oscillator": return "Oscillators"
      case "volume": return "Volume"
      case "volatility": return "Volatility"
      default: return category.replaceAll("-", " ").replace(/\b\w/g, c => c.toUpperCase())
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
        <SelectTrigger className="min-w-[100px]">
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

  // Check if a parameter should be visible based on showWhen/hideWhen conditions
  const isParameterVisible = (param: Parameter): boolean => {
    if (param.showWhen) {
      const dependentValue = values[param.showWhen.param]
      if (dependentValue !== param.showWhen.equals) {
        return false
      }
    }
    if (param.hideWhen) {
      const dependentValue = values[param.hideWhen.param]
      if (dependentValue === param.hideWhen.equals) {
        return false
      }
    }
    return true
  }

  // Get filtered indicator options based on filterByIndicator
  const getFilteredIndicatorOptions = (param: Parameter): IndicatorOption[] => {
    if (!param.indicatorOptions) return []
    
    if (param.filterByIndicator) {
      const sourceParam = findParameter(config.parameters, param.filterByIndicator)
      const sourceValue = values[param.filterByIndicator] ?? sourceParam?.default ?? ""
      const sourceOption = sourceParam?.indicatorOptions?.find((ind) => ind.name === sourceValue)
      const sourceCategory = sourceOption?.category
      
      if (sourceCategory) {
        return param.indicatorOptions.filter((ind) => ind.category === sourceCategory)
      }
    }
    
    return param.indicatorOptions
  }

  const renderParameter = (param: Parameter): React.ReactNode => {
    const value = values[param.name] ?? param.default ?? ""

    switch (param.type) {
      case "label":
        return (
          <div className={`py-2 font-semibold ${effectiveColor}`}>
            {param.label}
          </div>
        )
      case "indicator":
        const filteredOptions = getFilteredIndicatorOptions(param)
        return renderIndicatorSelect(param, filteredOptions)
      case "select":
        return (
          <Select value={String(value)} onValueChange={(v) => onValueChange(param.name, v)}>
            <SelectTrigger className="min-w-[216px] w-full">
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
      case "text":
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

  // Generic function to render all parameter rows
  const renderParameterRows = () => {
    return (
      <div className="space-y-4">
        {config.parameters.map((row, rowIndex) => {
          // Filter visible parameters in this row
          const visibleParams = row.filter(isParameterVisible)
          if (visibleParams.length === 0) return null

          // Check if any param in the row is a "label" type
          const hasOnlyLabel = visibleParams.length === 1 && visibleParams[0].type === "label"
          
          if (hasOnlyLabel) {
            // Render label without flex container
            return (
              <div key={rowIndex}>
                {renderParameter(visibleParams[0])}
              </div>
            )
          }

          // Render as flex row
          return (
            <div key={rowIndex} className="flex flex-col md:flex-row gap-3">
              {visibleParams.map((param) => (
                <div key={param.name} className="space-y-2">
                  {param.type !== "label" && <Label>{param.label}</Label>}
                  {renderParameter(param)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => e.stopPropagation()} className={`relative rounded-lg border-2 ${effectiveBgColor} bg-card shadow-sm`}>
      <div className={`flex items-center justify-between p-3 border-b border-border rounded-t-md ${effectiveBgColor}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 min-w-8 items-center justify-center rounded-md ${effectiveBgColor} ${effectiveColor}`}>
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
          {renderParameterRows()}
        </div>
      )}
    </div>
  )
}
