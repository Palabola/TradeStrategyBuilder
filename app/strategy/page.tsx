import { Header } from "@/components/header"
import { StrategyBuilder } from "@/components/strategy/strategy-builder"

export default async function StrategyPage({
  searchParams,
}: {
  searchParams: Promise<{ strategyId?: string }>
}) {
  const { strategyId } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategy Builder</h1>
          <p className="text-muted-foreground">Create automated trading strategies with drag-and-drop blocks</p>
        </div>

        <StrategyBuilder strategyId={strategyId} />
      </main>
    </div>
  )
}
