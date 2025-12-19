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
  LogOut,
  Target,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { StrategyEvaluation } from "@/lib/strategy-runner"
import { ClosedOrder, OpenOrder } from "@/lib/exchange-service"

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
    <div>
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

function TradesSummary({ analysisResult }: TradesSummaryProps) {
  // Aggregate all orders from the analysis results
  const orderData = useMemo(() => {
    const allTriggeredOrders: (ClosedOrder & { timestamp: Date })[] = []
    const allClosedOrders: (ClosedOrder & { timestamp: Date })[] = []
    const allOpenedOrders: (OpenOrder & { timestamp: Date })[] = []
    const allActivatedPendingOrders: (OpenOrder & { timestamp: Date })[] = []

    for (const evaluation of analysisResult.fullResults) {
      const timestamp = evaluation.evaluatedAt

      // Triggered Orders (SL/TP orders that executed)
      if (evaluation.triggeredOrders) {
        for (const order of evaluation.triggeredOrders) {
          allTriggeredOrders.push({ ...order, timestamp })
        }
      }

      // Closed/Cancelled Orders
      if (evaluation.closedOrders) {
        for (const order of evaluation.closedOrders) {
          allClosedOrders.push({ ...order, timestamp })
        }
      }

      // Opened Orders (new conditional orders created)
      if (evaluation.openedOrders) {
        for (const order of evaluation.openedOrders) {
          allOpenedOrders.push({ ...order, timestamp })
        }
      }

      // Activated Pending Orders (SL/TP pending orders activated)
      if (evaluation.activatedPendingOrders) {
        for (const order of evaluation.activatedPendingOrders) {
          allActivatedPendingOrders.push({ ...order, timestamp })
        }
      }
    }

    return {
      triggeredOrders: allTriggeredOrders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      closedOrders: allClosedOrders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      openedOrders: allOpenedOrders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      activatedPendingOrders: allActivatedPendingOrders.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    }
  }, [analysisResult])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const stats = {
      totalTriggeredOrders: orderData.triggeredOrders.length,
      totalClosedOrders: orderData.closedOrders.length,
      totalOpenedOrders: orderData.openedOrders.length,
      totalActivatedPendingOrders: orderData.activatedPendingOrders.length,
      buyTriggered: orderData.triggeredOrders.filter(o => o.type === "buy").length,
      sellTriggered: orderData.triggeredOrders.filter(o => o.type === "sell").length,
      slTriggered: orderData.triggeredOrders.filter(o => o.orderType === "stop-loss").length,
      tpTriggered: orderData.triggeredOrders.filter(o => o.orderType === "take-profit").length,
    }
    return stats
  }, [orderData])

  const hasNoOrders = 
    orderData.triggeredOrders.length === 0 && 
    orderData.closedOrders.length === 0 && 
    orderData.openedOrders.length === 0 &&
    orderData.activatedPendingOrders.length === 0

  if (hasNoOrders) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">
          No trade orders were executed during this analysis.
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
            <span className="text-sm font-medium">Triggered Orders</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.totalTriggeredOrders}</div>
          {(summary.slTriggered > 0 || summary.tpTriggered > 0) && (
            <div className="text-xs text-muted-foreground mt-1">
              Buy {summary.buyTriggered} / Sell {summary.sellTriggered}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Opened Orders</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalOpenedOrders}</div>
        
        </div>

        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">SL/TP Activated</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.totalActivatedPendingOrders}</div>
        </div>

        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Closed Orders</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.totalClosedOrders}</div>
        </div>
      </div>

      {/* Triggered Orders Section */}
      {orderData.triggeredOrders.length > 0 && (
        <OrderSection
          title="Triggered Orders"
          description="Orders that hit their trigger conditions (SL/TP executed)"
          orders={orderData.triggeredOrders}
          type="triggered"
        />
      )}

      {/* Opened Orders Section */}
      {orderData.openedOrders.length > 0 && (
        <OrderSection
          title="Opened Orders"
          description="New conditional orders created by strategy rules"
          orders={orderData.openedOrders}
          type="opened"
        />
      )}

      {/* Activated Pending Orders Section */}
      {orderData.activatedPendingOrders.length > 0 && (
        <OrderSection
          title="Activated Pending Orders"
          description="Stop Loss / Take Profit orders that became active"
          orders={orderData.activatedPendingOrders}
          type="pending"
        />
      )}

      {/* Closed Orders Section */}
      {orderData.closedOrders.length > 0 && (
        <OrderSection
          title="Closed Orders"
          description="Orders that were cancelled or closed"
          orders={orderData.closedOrders}
          type="closed"
        />
      )}
    </div>
  )
}

// Order Section Component
interface OrderSectionProps {
  title: string
  description: string
  orders: ((ClosedOrder | OpenOrder) & { timestamp: Date })[]
  type: "triggered" | "opened" | "pending" | "closed"
}

function OrderSection({ title, description, orders, type }: OrderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getOrderTypeLabel = (order: ClosedOrder | OpenOrder) => {
    const labels: Record<string, string> = {
      "market": "Market",
      "limit": "Limit",
      "stop-loss": "Stop Loss",
      "take-profit": "Take Profit",
      "trailing-stop": "Trailing Stop",
    }
    return labels[order.orderType] || order.orderType
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <h4 className="text-sm font-medium">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant="secondary">{orders.length}</Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
          {orders.map((order, index) => {
            const isBuy = order.type === "buy"
            const isClosedOrder = "closePrice" in order && order.closePrice
            const isStopLossOrTakeProfit = order.orderType === "stop-loss" || order.orderType === "take-profit"
            
            // Calculate profit percentage for completed SL/TP orders
            let profitPercent: number | null = null
            if (isClosedOrder && isStopLossOrTakeProfit && order.entryPrice && order.closePrice) {
              profitPercent = ((order.closePrice - order.entryPrice) / order.entryPrice) * 100
            }

            return (
              <div
                key={order.id || index}
                className={`flex items-center justify-between p-3 rounded-lg border`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span>
                        {order.type.toUpperCase()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getOrderTypeLabel(order)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.pair} • Vol: {order.volume.toFixed(6)}
                      {order.leverage && order.leverage > 1 && ` • ${order.leverage}x`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isClosedOrder ? (
                    // For closed orders, show closePrice as default
                    <div className="text-sm font-medium">
                      ${order.closePrice!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  ) : (
                    // For open/pending orders, show entry price
                    <div className="text-sm font-medium">
                      ${order.entryPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                    </div>
                  )}
                  
                  {/* Show profit percentage for completed SL/TP orders */}
                  {profitPercent !== null && (
                    <div className={`text-xs ${profitPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}