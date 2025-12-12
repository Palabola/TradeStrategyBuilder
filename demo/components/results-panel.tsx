"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  LogOut
} from "lucide-react"
import { StrategyEvaluation } from "@/lib/strategy-runner"

interface AnalysisResult {
  totalExecutions: number
  ruleExecutions: { ruleName: string; triggeredCount: number }[]
  triggeredEvents: { ruleName: string; timestamp: Date }[]
  fullResults: StrategyEvaluation[]
}

interface ResultsPanelProps {
  analysisResult: AnalysisResult | null
  expandedResults: Set<number>
  onToggleResultExpanded: (index: number) => void
}

export function ResultsPanel({ analysisResult, expandedResults, onToggleResultExpanded }: ResultsPanelProps) {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Results</CardTitle>
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
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="results">Detailed Results</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary">
                <div className="space-y-4 py-2">
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
                </div>
              </TabsContent>

              {/* Detailed Results Tab */}
              <TabsContent value="results">
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {analysisResult.fullResults.map((evaluation, index) => {
                    const isExpanded = expandedResults.has(index)
                    const hasTriggeredRules = evaluation.triggeredRules.length > 0

                    return (
                      <Collapsible
                        key={index}
                        open={isExpanded}
                        onOpenChange={() => onToggleResultExpanded(index)}
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
                                      {rule.actions.map((action, actionIndex) => {
                                        const actionType = action.action
                                        const opts = action.options || {}

                                        let actionLabel: string = actionType
                                        if (actionType === "open-position" || actionType === "close-position") {
                                          actionLabel = `${actionType} ${opts.side || ''} ${opts.amount || ''} ${opts.unit || ''}`
                                          if (opts.leverage && opts.leverage !== "No") actionLabel += ` @ ${opts.leverage}`
                                        } else if (actionType === "buy" || actionType === "sell") {
                                          actionLabel = `${actionType} ${opts.amount || ''} ${opts.unit || ''}`
                                        } else if (actionType === "notify-me") {
                                          actionLabel = `notify via ${opts.channel || 'N/A'}`
                                        }

                                        return (
                                          <Badge key={actionIndex} variant="secondary" className="text-xs">
                                            {actionLabel.trim()}
                                          </Badge>
                                        )
                                      })}
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
              </TabsContent>

              {/* Trades Tab */}
              <TabsContent value="trades">
                <TradesSummary analysisResult={analysisResult} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Trades Summary Component
interface TradesSummaryProps {
  analysisResult: AnalysisResult
}

interface TradeAction {
  timestamp: Date
  ruleName: string
  actionType: "buy" | "sell" | "open-position" | "close-position"
  side?: string
  amount?: number
  unit?: string
  leverage?: string
  priceUSD?: number | null
}

function TradesSummary({ analysisResult }: TradesSummaryProps) {
  // Extract all trade actions from the analysis results
  const trades = useMemo(() => {
    const tradeActions: TradeAction[] = []

    for (const evaluation of analysisResult.fullResults) {
      for (const triggeredRule of evaluation.triggeredRules) {
        for (const action of triggeredRule.actions) {
          const actionType = action.action
          if (actionType === "buy" || actionType === "sell" || actionType === "open-position" || actionType === "close-position") {
            tradeActions.push({
              timestamp: evaluation.evaluatedAt,
              ruleName: triggeredRule.ruleName,
              actionType: actionType as "buy" | "sell" | "open-position" | "close-position",
              side: action.options?.side,
              amount: action.options?.amount,
              unit: action.options?.unit,
              leverage: action.options?.leverage,
              priceUSD: evaluation.priceUSD,
            })
          }
        }
      }
    }

    return tradeActions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [analysisResult])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const stats = {
      totalTrades: trades.length,
      buyCount: 0,
      sellCount: 0,
      openLongCount: 0,
      openShortCount: 0,
      closeCount: 0,
      totalBuyAmount: 0,
      totalSellAmount: 0,
    }

    for (const trade of trades) {
      switch (trade.actionType) {
        case "buy":
          stats.buyCount++
          if (trade.amount && trade.unit === "USD") {
            stats.totalBuyAmount += trade.amount
          }
          break
        case "sell":
          stats.sellCount++
          if (trade.amount && trade.unit === "USD") {
            stats.totalSellAmount += trade.amount
          }
          break
        case "open-position":
          if (trade.side === "LONG") {
            stats.openLongCount++
          } else if (trade.side === "SHORT") {
            stats.openShortCount++
          }
          break
        case "close-position":
          stats.closeCount++
          break
      }
    }

    return stats
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">
          No trade actions were triggered during this analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Buy Orders</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.buyCount}</div>
          {summary.totalBuyAmount > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Total: ${summary.totalBuyAmount.toLocaleString()}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">Sell Orders</span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.sellCount}</div>
          {summary.totalSellAmount > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Total: ${summary.totalSellAmount.toLocaleString()}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Open Positions</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.openLongCount + summary.openShortCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {summary.openLongCount} Long / {summary.openShortCount} Short
          </div>
        </div>

        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <LogOut className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Close Positions</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.closeCount}</div>
        </div>
      </div>

      {/* Trade History */}
      <div>
        <h4 className="text-sm font-medium mb-3">Trade History</h4>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {trades.map((trade, index) => {
            const isBuyOrLong = trade.actionType === "buy" || (trade.actionType === "open-position" && trade.side === "LONG")
            const isSellOrShort = trade.actionType === "sell" || (trade.actionType === "open-position" && trade.side === "SHORT")
            const isClose = trade.actionType === "close-position"

            let bgColor = "bg-muted/50"
            let borderColor = "border-transparent"
            let icon = <DollarSign className="h-4 w-4" />

            if (isBuyOrLong) {
              bgColor = "bg-green-500/10"
              borderColor = "border-green-500/30"
              icon = <ArrowUpCircle className="h-4 w-4 text-green-500" />
            } else if (isSellOrShort) {
              bgColor = "bg-red-500/10"
              borderColor = "border-red-500/30"
              icon = <ArrowDownCircle className="h-4 w-4 text-red-500" />
            } else if (isClose) {
              bgColor = "bg-orange-500/10"
              borderColor = "border-orange-500/30"
              icon = <LogOut className="h-4 w-4 text-orange-500" />
            }

            let tradeLabel: string = trade.actionType
            if (trade.actionType === "open-position") {
              tradeLabel = `OPEN ${trade.side}`
            }
            if (trade.amount && trade.unit) {
              tradeLabel += ` ${trade.amount} ${trade.unit}`
            }
            if (trade.leverage && trade.leverage !== "No" && trade.leverage !== "1") {
              tradeLabel += ` @ ${trade.leverage}`
            }

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${bgColor} ${borderColor}`}
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <div className="text-sm font-medium">{tradeLabel}</div>
                    <div className="text-xs text-muted-foreground">{trade.ruleName}</div>
                  </div>
                </div>
                <div className="text-right">
                  {trade.priceUSD && (
                    <div className="text-sm font-medium">${trade.priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}