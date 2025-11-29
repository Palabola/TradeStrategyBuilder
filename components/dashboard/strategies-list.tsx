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
import { getSavedStrategies, removeStrategyFromStorage, type SavedStrategy } from "@/lib/strategy-storage"
import { Plus, Play, Edit, Trash2 } from "lucide-react"

export function StrategiesList() {
  const [strategies, setStrategies] = useState<SavedStrategy[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [strategyToDelete, setStrategyToDelete] = useState<SavedStrategy | null>(null)

  useEffect(() => {
    setStrategies(getSavedStrategies())
  }, [])

  const handleDeleteClick = (strategy: SavedStrategy) => {
    setStrategyToDelete(strategy)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (strategyToDelete) {
      removeStrategyFromStorage(strategyToDelete.strategyId)
      setStrategies(getSavedStrategies())
    }
    setDeleteDialogOpen(false)
    setStrategyToDelete(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trading Strategies</CardTitle>
        <Link href="/strategy">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Strategy
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {strategies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No strategies yet.</p>
            <p className="text-sm">Create your first trading strategy to get started.</p>
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
                  <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent" title="Run strategy">
                    <Play className="h-4 w-4" />
                  </Button>
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
