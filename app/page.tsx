import { Header } from "@/components/header"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { StrategiesList } from "@/components/dashboard/strategies-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Manage your automated trading strategies</p>
            </div>
            <div className="flex gap-3">
              <Link href="/strategy">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  New Strategy
                </Button>
              </Link>
              <Link href="/strategy">
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Trade
                </Button>
              </Link>
            </div>
          </div>

          {/* Balance Cards */}
          <BalanceCard />

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            <StrategiesList />
            <RecentTrades />
          </div>
        </div>
      </main>
    </div>
  )
}
