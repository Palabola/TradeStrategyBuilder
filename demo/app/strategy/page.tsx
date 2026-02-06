"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { StrategyPageClient } from "./client"
import { supportedIndicators, supportedTimeframes } from "../../lib/strategy-runner"
import { useStrategyDraftStore } from "@/lib/stores/strategy-draft-store"
import { useSavedStrategiesStore } from "../../lib/stores/saved-strategies-store"

function StrategyContent() {
  const searchParams = useSearchParams()
  const strategyId = searchParams.get("strategyId") ?? undefined
  const { draft } = useStrategyDraftStore()
  const { getStrategyById } = useSavedStrategiesStore()

  const candleOptionsOverride = supportedTimeframes;
  const indicatorOptionsOverride = supportedIndicators;
  const unitOptionsOverride = ["USD", "%", "Coin"];
  const channelOptionsOverride = ["Telemgram", "Email", "Notification"];
  const themeOverride = null;

  return (
    <StrategyPageClient
      initialStrategy={strategyId ? getStrategyById(strategyId) : (draft || undefined)}
      candleOptions={candleOptionsOverride}
      indicatorOptions={indicatorOptionsOverride}
      unitOptions={unitOptionsOverride}
      channelOptions={channelOptionsOverride}
      themeOverride={themeOverride}
    />
  )
}

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategy Builder</h1>
          <p className="text-muted-foreground hidden lg:flex">Click on options to configure parameters</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <StrategyContent />
        </Suspense>
      </main>
    </div>
  )
}
