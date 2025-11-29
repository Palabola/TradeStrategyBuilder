"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getSavedStrategies, type SavedStrategy } from "@/lib/strategy-storage"
import { Play, Check, X } from "lucide-react"

interface ConditionStatus {
  [ruleIndex: number]: {
    [conditionIndex: number]: boolean
  }
}

export function StrategyRunner() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USD")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1h")
  const [loadedStrategy, setLoadedStrategy] = useState<SavedStrategy | null>(null)
  const [conditionStatuses, setConditionStatuses] = useState<ConditionStatus>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const savedStrategies = getSavedStrategies()

  const handleLoadStrategy = (strategy: SavedStrategy) => {
    setLoadedStrategy(strategy)
    setConditionStatuses({})
    setIsDialogOpen(false)
  }

  const handleRunTest = () => {
    if (!loadedStrategy) return

    // Generate random true/false for each condition
    const newStatuses: ConditionStatus = {}
    loadedStrategy.rules.forEach((rule, ruleIndex) => {
      newStatuses[ruleIndex] = {}
      rule.conditions.forEach((_, conditionIndex) => {
        newStatuses[ruleIndex][conditionIndex] = Math.random() > 0.5
      })
    })
    setConditionStatuses(newStatuses)
  }

  const getRuleSummary = (ruleIndex: number) => {
    if (!conditionStatuses[ruleIndex]) return null

    const conditions = loadedStrategy?.rules[ruleIndex].conditions || []
    const statuses = conditionStatuses[ruleIndex]

    const satisfied = conditions.filter((_, idx) => statuses[idx] === true).length
    const unsatisfied = conditions.filter((_, idx) => statuses[idx] === false).length

    return { satisfied, unsatisfied }
  }

  const getConditionLabel = (condition: any) => {
    switch (condition.type) {
      case "increased-by":
        return `${condition.indicator1} (${condition.timeframe1}) increased by ${condition.value}%`
      case "decreased-by":
        return `${condition.indicator1} (${condition.timeframe1}) decreased by ${condition.value}%`
      case "greater-than":
        return `${condition.indicator1} (${condition.timeframe1}) greater than ${condition.indicator2} (${condition.timeframe2})`
      case "lower-than":
        return `${condition.indicator1} (${condition.timeframe1}) lower than ${condition.indicator2} (${condition.timeframe2})`
      case "crossing-above":
        return `${condition.indicator1} (${condition.timeframe1}) crossing above ${condition.indicator2} (${condition.timeframe2})`
      case "crossing-below":
        return `${condition.indicator1} (${condition.timeframe1}) crossing below ${condition.indicator2} (${condition.timeframe2})`
      default:
        return "Unknown condition"
    }
  }

  const getActionSummary = (actions: any[]) => {
    return actions
      .map((action) => {
        if (action.action === "BUY") {
          return `Buy ${action.options.amount}${action.options.unit}`
        } else if (action.action === "SELL") {
          return `Sell ${action.options.amount} ${action.options.unit}`
        } else if (action.action === "NOTIFY") {
          return "Notify"
        }
        return ""
      })
      .join(", ")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6 max-w-screen-2xl">
        {/* OHLC Chart Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>Real-time OHLC chart for testing strategies</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                    <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                    <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                    <SelectItem value="DOGE/USD">DOGE/USD</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">5min</SelectItem>
                    <SelectItem value="15min">15min</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="4h">4h</SelectItem>
                    <SelectItem value="6h">6h</SelectItem>
                    <SelectItem value="24h">24h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[400px] bg-muted/20 rounded-lg flex items-center justify-center border border-border">
              <p className="text-muted-foreground">OHLC Chart placeholder - Integration coming soon</p>
            </div>
            {loadedStrategy && (
              <Button onClick={handleRunTest} className="w-full gap-2">
                <Play className="h-4 w-4" />
                Run Test
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Strategy Testing Section - Removed sidebar card, now single card layout */}
        {loadedStrategy && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{loadedStrategy.strategyName}</CardTitle>
                  <CardDescription>
                    {loadedStrategy.symbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="inline-block bg-primary/10 text-primary px-2 py-1 rounded mr-2 text-xs"
                      >
                        {symbol}
                      </span>
                    ))}
                    • {loadedStrategy.rules.length} rule{loadedStrategy.rules.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Load Strategy</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Strategy</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedStrategies.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No saved strategies found</p>
                      ) : (
                        savedStrategies.map((strategy) => (
                          <button
                            key={strategy.strategyId}
                            onClick={() => handleLoadStrategy(strategy)}
                            className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                          >
                            <div className="font-semibold">{strategy.strategyName}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {strategy.symbols.join(", ")} • {strategy.rules.length} rule
                              {strategy.rules.length !== 1 ? "s" : ""}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadedStrategy.rules.map((rule, ruleIndex) => {
                  const summary = getRuleSummary(ruleIndex)

                  return (
                    <Card key={ruleIndex}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{rule.name}</CardTitle>
                            <CardDescription>{getActionSummary(rule.actions)}</CardDescription>
                          </div>
                          {summary && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1 text-success">
                                <Check className="h-4 w-4" />
                                {summary.satisfied}
                              </span>
                              <span className="flex items-center gap-1 text-destructive">
                                <X className="h-4 w-4" />
                                {summary.unsatisfied}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {rule.conditions.map((condition, conditionIndex) => {
                          const status = conditionStatuses[ruleIndex]?.[conditionIndex]
                          const hasStatus = status !== undefined

                          return (
                            <div
                              key={conditionIndex}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <span className="text-sm">{getConditionLabel(condition)}</span>
                              {hasStatus && (
                                <div
                                  className={`flex items-center justify-center h-6 w-6 rounded-full ${
                                    status ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                                  }`}
                                >
                                  {status ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!loadedStrategy && (
          <Card>
            <CardContent className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-muted-foreground">Load a strategy to begin testing</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Load Strategy</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Strategy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {savedStrategies.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No saved strategies found</p>
                    ) : (
                      savedStrategies.map((strategy) => (
                        <button
                          key={strategy.strategyId}
                          onClick={() => handleLoadStrategy(strategy)}
                          className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                        >
                          <div className="font-semibold">{strategy.strategyName}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {strategy.symbols.join(", ")} • {strategy.rules.length} rule
                            {strategy.rules.length !== 1 ? "s" : ""}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
