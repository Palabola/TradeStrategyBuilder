"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockTrades } from "@/lib/mock-data"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function RecentTrades() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTrades.slice(0, 5).map((trade) => (
            <div key={trade.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    trade.type === "buy" ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  {trade.type === "buy" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{trade.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {trade.amount} @ ${trade.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${trade.total.toLocaleString()}</p>
                <Badge variant={trade.status === "completed" ? "secondary" : "outline"} className="text-xs">
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
