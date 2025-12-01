import { Header } from "@/components/header"
import { candleOptions, channelOptions, indicatorOptions, unitOptions } from "../../components/strategy/block-types"
import { StrategyPageClient } from "./client"
import { supportedIndicators, supportedTimeframes } from "../../lib/strategy-runner"

export default async function StrategyPage({
  searchParams,
}: {
  searchParams: Promise<{ strategyId?: string }>
}) {
  const { strategyId } = await searchParams

  const candleOptionsOverride = supportedTimeframes;
  const indicatorOptionsOverride = supportedIndicators;
  const unitOptionsOverride = unitOptions;
  const channelOptionsOverride = channelOptions;
  const themeOverride = null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategy Builder</h1>
          <p className="text-muted-foreground">Create automated trading strategies with drag-and-drop blocks</p>
        </div>

        <StrategyPageClient
          strategyId={strategyId}
          candleOptions={candleOptionsOverride}
          indicatorOptions={indicatorOptionsOverride}
          unitOptions={unitOptionsOverride}
          channelOptions={channelOptionsOverride}
          themeOverride={themeOverride}
        />
      </main>
    </div>
  )
}
