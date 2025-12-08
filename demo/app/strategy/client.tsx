"use client"

import { useState, useMemo, useCallback } from "react"
import { StrategyBuilder } from "@/components/strategy/strategy-builder"
import { saveStrategyToStorage, type SavedStrategy } from "@/lib/strategy-storage"
import type { IndicatorOption, CustomTheme, BlockType } from "@/components/strategy/block-types"
import { blockConfigs, candleOptions as defaultCandleOptions, indicatorOptions as defaultIndicatorOptions } from "@/components/strategy/block-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, X, BarChart3, AlertCircle, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { agentService, supportedModels } from "../../lib/agent-service"
import { strategyRunner } from "../../lib/strategy-runner"
import { predefinedStrategies } from "../../lib/predefined-strategies"

type ThemeOption = "none" | "grayscale" | "colored"

// Pre-compute themes at module level for stability
const GRAYSCALE_THEME: CustomTheme = (() => {
  const blocks: CustomTheme["blocks"] = {}
  const blockTypes = Object.keys(blockConfigs) as BlockType[]
  
  for (const blockType of blockTypes) {
    blocks[blockType] = {
      color: "text-gray-500",
      bgColor: "bg-gray-500/10 border-gray-500/30",
    }
  }
  
  return { blocks }
})()

const COLORED_THEME: CustomTheme = (() => {
  const blocks: CustomTheme["blocks"] = {}
  const blockTypes = Object.keys(blockConfigs) as BlockType[]
  
  for (const blockType of blockTypes) {
    const config = blockConfigs[blockType]
    blocks[blockType] = {
      color: config.color,
      bgColor: config.bgColor,
    }
  }
  
  return { blocks }
})()

// Available indicator categories
const indicatorCategories = ["price", "oscillator", "volume", "volatility"]

interface StrategyPageClientProps {
  strategyId?: string
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  channelOptions?: string[]
  themeOverride?: CustomTheme | null
}

export function StrategyPageClient({
  strategyId,
  candleOptions: initialCandleOptions,
  indicatorOptions: initialIndicatorOptions,
  unitOptions,
  channelOptions,
  themeOverride: initialThemeOverride,
}: StrategyPageClientProps) {
  const [themeOption, setThemeOption] = useState<ThemeOption>("none")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Candle options state
  const [candleOptions, setCandleOptions] = useState<string[]>(initialCandleOptions ?? defaultCandleOptions)
  const [newCandle, setNewCandle] = useState("")
  
  // Indicator options state
  const [indicatorOptions, setIndicatorOptions] = useState<IndicatorOption[]>(initialIndicatorOptions ?? defaultIndicatorOptions)
  const [newIndicatorName, setNewIndicatorName] = useState("")
  const [newIndicatorCategory, setNewIndicatorCategory] = useState("price")

  // Strategy Analytics state
  const [deployedStrategy, setDeployedStrategy] = useState<SavedStrategy | null>(null)
  const [selectedAnalyticsPair, setSelectedAnalyticsPair] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<{
    totalExecutions: number
    ruleExecutions: { ruleName: string; triggeredCount: number }[]
    triggeredEvents: { ruleName: string; timestamp: Date }[]
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSave = useCallback((strategy: Omit<SavedStrategy, "createdAt" | "updatedAt">) => {
    const savedStrategy = saveStrategyToStorage(strategy)
    setDeployedStrategy(savedStrategy)
    // Set default analytics pair to first trading pair
    if (savedStrategy.symbols.length > 0) {
      setSelectedAnalyticsPair(savedStrategy.symbols[0])
    }
  }, [])

  // AI function wrapper - delegates to agentService.callAI
  const handleCallAI = useCallback(async (systemPrompt: string, userPrompts: string[], model: string): Promise<string> => {
    return await agentService.callAI(systemPrompt, userPrompts, model)
  }, [])

  // Compute the actual theme based on selection
  const computedTheme = useMemo((): CustomTheme | undefined => {
    switch (themeOption) {
      case "grayscale":
        return GRAYSCALE_THEME
      case "colored":
        return COLORED_THEME
      case "none":
      default:
        return initialThemeOverride ?? undefined
    }
  }, [themeOption, initialThemeOverride])

  // Generate a key that changes when options change to force StrategyBuilder to re-mount
  const builderKey = useMemo(() => {
    return `${themeOption}-${candleOptions.join(",")}-${indicatorOptions.map(i => `${i.name}:${i.category}`).join(",")}`
  }, [themeOption, candleOptions, indicatorOptions])

  // Candle options handlers
  const addCandleOption = () => {
    if (newCandle.trim() && !candleOptions.includes(newCandle.trim())) {
      setCandleOptions([...candleOptions, newCandle.trim()])
      setNewCandle("")
    }
  }

  const removeCandleOption = (candle: string) => {
    setCandleOptions(candleOptions.filter(c => c !== candle))
  }

  const resetCandleOptions = () => {
    setCandleOptions(defaultCandleOptions)
  }

  // Indicator options handlers
  const addIndicatorOption = () => {
    if (newIndicatorName.trim() && !indicatorOptions.some(i => i.name === newIndicatorName.trim())) {
      setIndicatorOptions([...indicatorOptions, { name: newIndicatorName.trim(), category: newIndicatorCategory }])
      setNewIndicatorName("")
    }
  }

  const removeIndicatorOption = (name: string) => {
    setIndicatorOptions(indicatorOptions.filter(i => i.name !== name))
  }

  const resetIndicatorOptions = () => {
    setIndicatorOptions(defaultIndicatorOptions)
  }

  // Analytics handler
  const handleAnalyze = async () => {
    if (!deployedStrategy || !selectedAnalyticsPair) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      const response = await strategyRunner.analyzeStrategy(deployedStrategy, 50, selectedAnalyticsPair)
      console.log("Analysis Result:", response)
      
      // Calculate summary: triggered count per rule
      const ruleTriggeredCounts: Record<string, number> = {}
      
      // Initialize counts for all rules
      for (const rule of deployedStrategy.rules) {
        ruleTriggeredCounts[rule.name] = 0
      }
      
      // Count how many times each rule was triggered across all evaluations
      // Also collect triggered events with timestamps
      const triggeredEvents: { ruleName: string; timestamp: Date }[] = []
      
      for (const evaluation of response) {
        for (const triggeredRule of evaluation.triggeredRules) {
          ruleTriggeredCounts[triggeredRule.ruleName] = (ruleTriggeredCounts[triggeredRule.ruleName] || 0) + 1
          triggeredEvents.push({
            ruleName: triggeredRule.ruleName,
            timestamp: evaluation.evaluatedAt,
          })
        }
      }
      
      // Convert to array format
      const ruleExecutions = Object.entries(ruleTriggeredCounts).map(([ruleName, triggeredCount]) => ({
        ruleName,
        triggeredCount,
      }))
      
      setAnalysisResult({
        totalExecutions: response.length,
        ruleExecutions,
        triggeredEvents,
      })
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <div className="absolute right-0 -top-16 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Options
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Strategy Builder Options</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Theme Override Section */}
              <div className="grid gap-2">
                <Label htmlFor="theme-select">Theme Override</Label>
                <Select value={themeOption} onValueChange={(value: ThemeOption) => setThemeOption(value)}>
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Default)</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="colored">Colored</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {themeOption === "none" && "Use default block colors"}
                  {themeOption === "grayscale" && "All blocks displayed in grayscale"}
                  {themeOption === "colored" && "Use vibrant colors from block configurations"}
                </p>
              </div>

              {/* Candle Options Section */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Candle Options</Label>
                  <Button variant="ghost" size="sm" onClick={resetCandleOptions} className="h-7 text-xs">
                    Reset to Default
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candleOptions.map((candle) => (
                    <Badge key={candle} variant="secondary" className="gap-1 pr-1">
                      {candle}
                      <button
                        onClick={() => removeCandleOption(candle)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 2h, 3d"
                    value={newCandle}
                    onChange={(e) => setNewCandle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCandleOption()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addCandleOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Indicator Options Section */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Indicator Options</Label>
                  <Button variant="ghost" size="sm" onClick={resetIndicatorOptions} className="h-7 text-xs">
                    Reset to Default
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {indicatorOptions.map((indicator) => (
                    <Badge key={indicator.name} variant="secondary" className="gap-1 pr-1">
                      <span>{indicator.name}</span>
                      <span className="text-xs text-muted-foreground">({indicator.category})</span>
                      <button
                        onClick={() => removeIndicatorOption(indicator.name)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Indicator name"
                    value={newIndicatorName}
                    onChange={(e) => setNewIndicatorName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addIndicatorOption()}
                    className="flex-1"
                  />
                  <Select value={newIndicatorCategory} onValueChange={setNewIndicatorCategory}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indicatorCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={addIndicatorOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 w-full">
      <StrategyBuilder
        key={builderKey}
        strategyId={strategyId}
        candleOptions={candleOptions}
        indicatorOptions={indicatorOptions}
        unitOptions={unitOptions}
        channelOptions={channelOptions}
        predefinedStrategies={predefinedStrategies}
        onSave={handleSave}
        themeOverride={computedTheme}
        supportedAIModels={supportedModels}
        callAIFunction={handleCallAI}
      />
      
      {/* Analytics Panel */}
      <div className="w-full max-w-[320px] hidden lg:block">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyze Strategy
            </CardTitle>
            {deployedStrategy ? ( <CardDescription> {deployedStrategy.strategyName} </CardDescription> ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {!deployedStrategy ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Deploy your strategy to run analytics.
                </p>
                <p className="text-xs text-muted-foreground">
                  Your strategy will be analyzed on a time series to test its performance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analytics-pair" className="text-sm font-medium">Trading Pair</Label>
                  <Select 
                    value={selectedAnalyticsPair} 
                    onValueChange={setSelectedAnalyticsPair}
                  >
                    <SelectTrigger id="analytics-pair" className="w-full">
                      <SelectValue placeholder="Select a pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {deployedStrategy.symbols.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedAnalyticsPair || isAnalyzing}
                  className="w-full gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="text-sm font-medium">Results Summary</div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Executions</span>
                      <Badge variant="secondary">{analysisResult.totalExecutions}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Rules Triggered</div>
                      {analysisResult.ruleExecutions.map((rule) => (
                        <div key={rule.ruleName} className="flex justify-between items-center text-sm">
                          <span className="truncate pr-2">{rule.ruleName}</span>
                          <Badge variant={rule.triggeredCount > 0 ? "default" : "outline"}>
                            {rule.triggeredCount}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Triggered Events Timeline */}
                    {analysisResult.triggeredEvents.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs text-muted-foreground">Event Timeline</div>
                        <div className="overflow-y-auto space-y-2">
                          {analysisResult.triggeredEvents.map((event, index) => (
                            <div key={index} className="flex justify-between items-center text-xs py-1 px-2 bg-muted/50 rounded">
                              <span className="truncate pr-2 font-medium">{event.ruleName}</span>
                              <span className="text-muted-foreground whitespace-nowrap">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
