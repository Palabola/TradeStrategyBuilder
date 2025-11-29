import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockTrades } from "@/lib/mock-data"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trade History</h1>
          <p className="text-muted-foreground">View all your past and pending trades</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Pair</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Total</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div
                          className={`flex items-center gap-2 ${trade.type === "buy" ? "text-success" : "text-destructive"}`}
                        >
                          {trade.type === "buy" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          <span className="capitalize font-medium">{trade.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{trade.symbol}</td>
                      <td className="py-4 px-4">{trade.amount}</td>
                      <td className="py-4 px-4">${trade.price.toLocaleString()}</td>
                      <td className="py-4 px-4 font-medium">${trade.total.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <Badge variant={trade.status === "completed" ? "secondary" : "outline"}>{trade.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{trade.timestamp.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
