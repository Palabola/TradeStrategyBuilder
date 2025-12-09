"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { AnalyzePageClient } from "./client"

function AnalyzeContent() {
  const searchParams = useSearchParams()
  const strategyId = searchParams.get("strategy") ?? undefined

  return <AnalyzePageClient strategyId={strategyId} />
}

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Strategy Analyzer</h1>
          <p className="text-muted-foreground">Backtest your trading strategies on historical data</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <AnalyzeContent />
        </Suspense>
      </main>
    </div>
  )
}
