"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStrategyById, getSavedStrategies, type SavedStrategy } from "@/lib/strategy-storage"
import { strategyRunner, type StrategyEvaluation } from "@/lib/strategy-runner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  BarChart3, 
  AlertCircle, 
  Play, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"

const iterationCycleOptions = [
  { label: "25 cycles", value: 25 },
  { label: "50 cycles", value: 50 },
  { label: "100 cycles", value: 100 },
  { label: "200 cycles", value: 200 },
]

interface AnalyzePageClientProps {
  strategyId?: string
}

export function AnalyzePageClient({ strategyId }: AnalyzePageClientProps) {
  const router = useRouter()
  
  // Strategy state
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<SavedStrategy | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const [selectedCycles, setSelectedCycles] = useState<number>(50)
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    totalExecutions: number
    ruleExecutions: { ruleName: string; triggeredCount: number }[]
    triggeredEvents: { ruleName: string; timestamp: Date }[]
    fullResults: StrategyEvaluation[]
  } | null>(null)
  
  // Expanded state for detailed results
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())

  // Load saved strategies on mount
  useEffect(() => {
    const strategies = getSavedStrategies()
    setSavedStrategies(strategies)
    
    // If strategyId is provided in URL, load that strategy
    if (strategyId) {
      const strategy = strategies.find(s => s.strategyId === strategyId)
      if (strategy) {
        setSelectedStrategy(strategy)
        if (strategy.symbols.length > 0) {
          setSelectedSymbol(strategy.symbols[0])
        }
      }
    }
  }, [strategyId])

  // Handle strategy selection change
  const handleStrategyChange = (strategyId: string) => {
    const strategy = savedStrategies.find(s => s.strategyId === strategyId)
    if (strategy) {
      setSelectedStrategy(strategy)
      setSelectedSymbol(strategy.symbols[0] || "")
      setAnalysisResult(null)
      // Update URL with strategy parameter
      router.push(`/analyze?strategy=${strategyId}`, { scroll: false })
    }
  }

  // Analytics handler
  const handleAnalyze = async () => {
    if (!selectedStrategy || !selectedSymbol) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setExpandedResults(new Set())
    
    try {
      const response = await strategyRunner.analyzeStrategy(
        selectedStrategy, 
        selectedCycles, 
        selectedSymbol
      )
      console.log("Analysis Result:", response)
      
      // Calculate summary: triggered count per rule
      const ruleTriggeredCounts: Record<string, number> = {}
      
      // Initialize counts for all rules
      for (const rule of selectedStrategy.rules) {
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
        fullResults: response,
      })
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleResultExpanded = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Configuration
            </CardTitle>
            <CardDescription>
              Select a strategy and configure analysis parameters
            </CardDescription>
           
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strategy Selector */}
            <div className="space-y-2">
              <Label htmlFor="strategy-select" className="text-sm font-medium">Strategy</Label>
              <Select 
                value={selectedStrategy?.strategyId || ""} 
                onValueChange={handleStrategyChange}
              >
                <SelectTrigger id="strategy-select" className="w-full">
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {savedStrategies.length === 0 ? (
                    <SelectItem value="none" disabled>No saved strategies</SelectItem>
                  ) : (
                    savedStrategies.map((strategy) => (
                      <SelectItem key={strategy.strategyId || strategy.strategyName} value={strategy.strategyId || ""}>
                        {strategy.strategyName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedStrategy && (
              <>
                {/* Symbol Selector */}
                <div className="space-y-2">
                  <Label htmlFor="symbol-select" className="text-sm font-medium">Trading Pair</Label>
                  <Select 
                    value={selectedSymbol} 
                    onValueChange={setSelectedSymbol}
                  >
                    <SelectTrigger id="symbol-select" className="w-full">
                      <SelectValue placeholder="Select a pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedStrategy.symbols.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Iteration Cycles Selector */}
                <div className="space-y-2">
                  <Label htmlFor="cycles-select" className="text-sm font-medium">Iteration Cycles</Label>
                  <Select 
                    value={selectedCycles.toString()} 
                    onValueChange={(val) => setSelectedCycles(Number(val))}
                  >
                    <SelectTrigger id="cycles-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iterationCycleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analyze Button */}
                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedSymbol || isAnalyzing}
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </Button>
              </>
            )}

            {!selectedStrategy && savedStrategies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  No saved strategies found.
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and save a strategy in the Strategy Builder first.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Panel */}
        {analysisResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Executions</span>
                <Badge variant="secondary">{analysisResult.totalExecutions}</Badge>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">Rules Triggered</div>
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
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs text-muted-foreground font-medium">Event Timeline</div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Results Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Results</CardTitle>
            <CardDescription>
              {analysisResult 
                ? `${analysisResult.fullResults.length} evaluation cycles completed`
                : "Run an analysis to see detailed results"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Select a strategy and run analysis to see detailed results.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {analysisResult.fullResults.map((evaluation, index) => {
                  const isExpanded = expandedResults.has(index)
                  const hasTriggeredRules = evaluation.triggeredRules.length > 0
                  
                  return (
                    <Collapsible 
                      key={index} 
                      open={isExpanded}
                      onOpenChange={() => toggleResultExpanded(index)}
                    >
                      <CollapsibleTrigger asChild>
                        <div 
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            hasTriggeredRules 
                              ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30' 
                              : 'bg-muted/50 hover:bg-muted border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {new Date(evaluation.evaluatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasTriggeredRules ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <Badge variant="default" className="bg-green-500">
                                  {evaluation.triggeredRules.length} triggered
                                </Badge>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">No triggers</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 ml-7 space-y-3 pb-3">
                          {evaluation.rules.map((rule, ruleIndex) => (
                            <div 
                              key={ruleIndex}
                              className={`p-3 rounded-lg border ${
                                rule.allConditionsMet 
                                  ? 'bg-green-500/5 border-green-500/30' 
                                  : 'bg-muted/30 border-muted'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{rule.ruleName}</span>
                                <Badge variant={rule.allConditionsMet ? "default" : "outline"}>
                                  {rule.allConditionsMet ? "Triggered" : "Not Triggered"}
                                </Badge>
                              </div>
                              
                              {/* Conditions */}
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground font-medium">Conditions:</div>
                                {rule.conditions.map((condition, condIndex) => (
                                  <div 
                                    key={condIndex}
                                    className={`text-xs p-2 rounded flex items-start gap-2 ${
                                      condition.result 
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                    }`}
                                  >
                                    {condition.result ? (
                                      <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <div>
                                        <span className="font-medium">{condition.condition?.indicator1}</span>
                                        {condition.condition?.timeframe1 && (
                                          <span className="text-muted-foreground ml-1">({condition.condition.timeframe1})</span>
                                        )}
                                        <span className="mx-1">{condition.condition?.type?.replace(/-/g, ' ')}</span>
                                        <span className="font-medium">{condition.condition?.indicator2 || condition.condition?.value}</span>
                                        {condition.condition?.timeframe2 && (
                                          <span className="text-muted-foreground ml-1">({condition.condition.timeframe2})</span>
                                        )}
                                      </div>
                                      <div className="text-muted-foreground mt-1">
                                        Current: {condition.currentValue?.toFixed(4) ?? 'N/A'}
                                        {condition.comparisonValue !== undefined && (
                                          <> | Compare: {condition.comparisonValue?.toFixed(4) ?? 'N/A'}</>
                                        )}
                                        {condition.previousValue !== undefined && (
                                          <> | Previous: {condition.previousValue?.toFixed(4) ?? 'N/A'}</>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Actions (if triggered) */}
                              {rule.allConditionsMet && rule.actions.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-green-500/20">
                                  <div className="text-xs text-muted-foreground font-medium mb-1">Actions:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {rule.actions.map((action, actionIndex) => (
                                      <Badge key={actionIndex} variant="secondary" className="text-xs">
                                        {action.type}: {action.amount} {action.unit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
