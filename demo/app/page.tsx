import { Header } from "@/components/header"
import { StrategiesList } from "@/components/dashboard/strategies-list"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            </div>
          </div>
          {/* Main Content */}
          <div className="grid gap-6">
            <StrategiesList />
          </div>
        </div>
      </main>
    </div>
  )
}
