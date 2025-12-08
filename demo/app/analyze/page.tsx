import { Header } from "@/components/header"
import { AnalyzePageClient } from "./client"

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ strategy?: string }>
}) {
  const { strategy: strategyId } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategy Analyzer</h1>
          <p className="text-muted-foreground">Backtest your trading strategies on historical data</p>
        </div>

        <AnalyzePageClient strategyId={strategyId} />
      </main>
    </div>
  )
}
