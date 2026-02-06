"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  AlertCircle
} from "lucide-react"
import { StrategyTemplate } from "@palabola86/trade-strategy-builder"
import { AnalysisPanel } from "@/components/analysis-panel"
import { useSavedStrategiesStore } from "@/lib/stores/saved-strategies-store"

interface AnalyzePageClientProps {
  strategyId?: string
}

export function AnalyzePageClient({ strategyId }: AnalyzePageClientProps) {
  const router = useRouter()
  const savedStrategies = useSavedStrategiesStore((state) => state.strategies)
  
  // Strategy state
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyTemplate | null>(null)

  // Load saved strategies on mount
  useEffect(() => {
    // If strategyId is provided in URL, load that strategy
    if (strategyId) {
      const strategy = savedStrategies.find(s => s.strategyId === strategyId)
      if (strategy) {
        setSelectedStrategy(strategy)
      }
    }
  }, [strategyId, savedStrategies])

  // Handle strategy selection change
  const handleStrategyChange = (strategyId: string) => {
    const strategy = savedStrategies.find(s => s.strategyId === strategyId)
    if (strategy) {
      setSelectedStrategy(strategy)
      // Update URL with strategy parameter
      router.push(`/analyze?strategy=${strategyId}`, { scroll: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* Strategy Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Select Strategy
          </CardTitle>
          <CardDescription>
            Choose a saved strategy to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Analysis Panel - only show when a strategy is selected */}
      {selectedStrategy && (
        <AnalysisPanel 
          selectedStrategy={selectedStrategy}
          layout="grid"
          configDescription="Configure analysis parameters"
        />
      )}
    </div>
  )
}
