"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  BarChart3, 
  Play, 
  Loader2, 
  ChevronDown, 
  ChevronRight
} from "lucide-react"
import { StrategyTemplate } from "@palabola86/trade-strategy-builder"
import { strategyRunner, type StrategyEvaluation } from "@/lib/strategy-runner"
import { ResultsPanel } from "@/components/results-panel"

const iterationCycleOptions = [
  { label: "10 cycles", value: 10 },
  { label: "25 cycles", value: 25 },
  { label: "50 cycles", value: 50 },
  { label: "100 cycles", value: 100 },
  { label: "200 cycles", value: 200 },
]

interface AnalysisResult {
  totalExecutions: number
  ruleExecutions: { ruleName: string; triggeredCount: number }[]
  triggeredEvents: { ruleName: string; timestamp: Date }[]
  fullResults: StrategyEvaluation[]
}

interface AnalysisPanelProps {
  selectedStrategy: StrategyTemplate | null
  /** Layout mode: 'column' for vertical stacking, 'grid' for multi-column layout */
  layout?: 'column' | 'grid'
  /** Optional description to show in the configuration card header */
  configDescription?: string
  /** Whether to show the empty state message when no strategy is selected */
  showEmptyState?: boolean
  /** Custom empty state message */
  emptyStateMessage?: string
}

export function AnalysisPanel({ 
  selectedStrategy, 
  layout = 'column',
  configDescription,
  showEmptyState = true,
  emptyStateMessage = "Select a strategy to run analysis"
}: AnalysisPanelProps) {
  // Analysis configuration state
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    selectedStrategy?.symbols?.[0] || ""
  )
  const [selectedCycles, setSelectedCycles] = useState<number>(50)
  const [initialUSD, setInitialUSD] = useState<string>("10000")
  const [initialCoin, setInitialCoin] = useState<string>("0")
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  
  // Expanded state for detailed results
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())
  
  // Collapsible state for configuration card
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false)

  // Update selected symbol when strategy changes
  const currentSymbol = selectedStrategy?.symbols?.includes(selectedSymbol) 
    ? selectedSymbol 
    : selectedStrategy?.symbols?.[0] || ""

  // Analytics handler
  const handleAnalyze = async () => {
    if (!selectedStrategy || !currentSymbol) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setExpandedResults(new Set())
    
    const coinSymbol = currentSymbol.split("/")[0]
    const balances = [
      { currency: "USD", balance: parseFloat(initialUSD) },
      { currency: coinSymbol, balance: parseFloat(initialCoin) },
    ]

    try {
      const response = await strategyRunner.analyzeStrategy(
        selectedStrategy, 
        selectedCycles, 
        currentSymbol,
        balances
      )
      
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
      
      // Collapse the configuration card after successful analysis
      setIsConfigCollapsed(true)
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

  // Configuration Panel Component
  const ConfigurationPanel = (
    <Collapsible open={!isConfigCollapsed} onOpenChange={(open) => setIsConfigCollapsed(!open)}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Configuration
              </div>
              {isConfigCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
            {configDescription && (
              <CardDescription>{configDescription}</CardDescription>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CardContent className="space-y-4">
          <CollapsibleContent className="space-y-4">
            {selectedStrategy && (
              <>
                {/* Symbol Selector */}
                <div className="space-y-2">
                  <Label htmlFor="symbol-select" className="text-sm font-medium">Trading Pair</Label>
                  <Select 
                    value={currentSymbol} 
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

                {/* Initial Portfolio */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Initial Portfolio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="initial-usd" className="text-xs text-muted-foreground">USD</Label>
                      <Input
                        id="initial-usd"
                        type="number"
                        min="0"
                        step="100"
                        value={initialUSD}
                        onChange={(e) => setInitialUSD(e.target.value)}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="initial-coin" className="text-xs text-muted-foreground">Coin</Label>
                      <Input
                        id="initial-coin"
                        type="number"
                        min="0"
                        step="0.001"
                        value={initialCoin}
                        onChange={(e) => setInitialCoin(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {!selectedStrategy && showEmptyState && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {emptyStateMessage}
                </p>
              </div>
            )}
          </CollapsibleContent>

          {/* Analyze Button - Always visible */}
          {selectedStrategy && (
            <Button 
              onClick={handleAnalyze}
              disabled={!currentSymbol || isAnalyzing}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Collapsible>
  )

  // Grid layout (for /analyze page - 3 columns)
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {ConfigurationPanel}
        </div>

        <ResultsPanel
          analysisResult={analysisResult}
          expandedResults={expandedResults}
          onToggleResultExpanded={toggleResultExpanded}
        />
      </div>
    )
  }

  // Column layout (for /strategy page - vertical stacking)
  return (
    <div className="space-y-6">
      {ConfigurationPanel}

      {analysisResult && (
        <ResultsPanel
          analysisResult={analysisResult}
          expandedResults={expandedResults}
          onToggleResultExpanded={toggleResultExpanded}
        />
      )}
    </div>
  )
}
