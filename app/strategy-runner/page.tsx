import { Header } from "@/components/header"
import { StrategyRunner } from "@/components/strategy-runner/strategy-runner"

export default function StrategyRunnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StrategyRunner />
    </div>
  )
}
