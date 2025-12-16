"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getSavedStrategies, removeStrategyFromStorage } from "@/lib/strategy-storage"
import { Plus, Play, Edit, Trash2, FileText, Sparkles } from "lucide-react"
import { StrategyTemplate } from "@palabola86/trade-strategy-builder"
import { predefinedStrategies } from "@/lib/predefined-strategies"
import { useRouter } from "next/navigation"

export function StrategiesList() {
  const [strategies, setStrategies] = useState<StrategyTemplate[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [strategyToDelete, setStrategyToDelete] = useState<StrategyTemplate | null>(null)
  const router = useRouter()

  useEffect(() => {
    setStrategies(getSavedStrategies())
  }, [])

  const handleDeleteClick = (strategy: StrategyTemplate) => {
    setStrategyToDelete(strategy)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (strategyToDelete?.strategyId) {
      removeStrategyFromStorage(strategyToDelete.strategyId)
      setStrategies(getSavedStrategies())
    }
    setDeleteDialogOpen(false)
    setStrategyToDelete(null)
  }

  const handleSelectPredefinedStrategy = (strategy: StrategyTemplate) => {
    try {
      localStorage.setItem('strategy-draft', JSON.stringify(strategy))
      router.push('/strategy')
    } catch (error) {
      console.warn('Failed to save strategy draft to localStorage:', error)
    }
  }

  const handleBlankStrategyClick = () => {
    try {
      localStorage.removeItem('strategy-draft')
      router.push('/strategy')
    } catch (error) {
      console.warn('Failed to clear strategy draft from localStorage:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trading Strategies</CardTitle>
        <Button size="sm" className="gap-2" onClick={handleBlankStrategyClick}>
          <Plus className="h-4 w-4" />
          New Strategy
        </Button>
      </CardHeader>
      <CardContent>
        {strategies.length === 0 ? (
          <div className="py-12">
            <div className="xl:max-w-[1200px] mx-auto">
              <h3 className="text-lg font-semibold mb-2">Choose your first strategy</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Blank Strategy Card */}
                <div
                  onClick={handleBlankStrategyClick}
                  className="p-6 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="min-w-5 h-5 w-5 text-primary" />
                    <h4 className="font-medium">Blank</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Start from scratch and build your own custom trading strategy.</p>
                </div>

                {/* Predefined Strategy Cards */}
                {predefinedStrategies.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectPredefinedStrategy(template.strategy)}
                    className="p-6 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="min-w-5 h-5 w-5 text-primary" />
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.strategyId}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{strategy.strategyName}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {strategy.symbols.map((symbol) => (
                      <Badge key={symbol} variant="secondary" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                    <span className="text-sm text-muted-foreground">
                      {strategy.rules.length} {strategy.rules.length === 1 ? "rule" : "rules"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/analyze?strategy=${strategy.strategyId}`}>
                    <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" title="Run strategy">
                      <Play className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/strategy?strategyId=${strategy.strategyId}`}>
                    <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" title="Edit strategy">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 bg-transparent text-destructive hover:text-destructive"
                    title="Delete strategy"
                    onClick={() => handleDeleteClick(strategy)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{strategyToDelete?.strategyName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
