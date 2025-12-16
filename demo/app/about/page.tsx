"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Blocks, 
  BarChart3, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Github, 
  ExternalLink, 
  Package,
  AlertTriangle,
  Sparkles,
  LayoutTemplate,
  Upload
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Trade Strategy Builder</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive trading strategy management and analysis application for building, 
            testing, and validating trading strategies.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">Strategy Builder</Badge>
            <Badge variant="secondary" className="text-sm">Backtesting</Badge>
            <Badge variant="secondary" className="text-sm">AI-Powered</Badge>
            <Badge variant="secondary" className="text-sm">Open Source</Badge>
          </div>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5" />
              About This Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is a trade strategy manager and analyzer application that utilizes the{" "}
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground text-sm">
                @palabola86/trade-strategy-builder
              </code>{" "}
              component library to create and manage trading strategies. The application provides 
              a visual, drag-and-drop interface for building complex trading rules without writing code.
            </p>
            <p className="text-muted-foreground">
              Whether you're a beginner learning about trading strategies or an experienced trader 
              looking to prototype ideas quickly, this tool helps you design, visualize, and validate 
              your trading logic before implementing it in a live environment.
            </p>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Application Features</CardTitle>
            <CardDescription>Explore the different pages and capabilities of this demo application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dashboard */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Dashboard (Landing Page)</h3>
                <p className="text-sm text-muted-foreground">
                  The home page displays a dashboard of all your saved strategies. Quickly view, 
                  manage, and access your strategies with options to edit, analyze, or delete them.
                </p>
              </div>
            </div>

            {/* Strategy Builder */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Blocks className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Strategy Builder</h3>
                <p className="text-sm text-muted-foreground">
                  The main strategy builder page where you can create trading strategies from scratch 
                  using a visual drag-and-drop interface. Features include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                  <li className="flex items-center gap-2">
                    <Blocks className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Visual block-based strategy building</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Pre-built strategy templates to get started quickly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>AI-powered strategy generation from natural language</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Import/export strategies as JSON</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Quick analysis panel for real-time strategy validation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analysis Page */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-info" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Strategy Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze your saved strategies with historical data. Configure analysis parameters, 
                  set initial portfolio balances, and visualize results with OHLC charts showing 
                  trade markers and rule trigger points.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Technical Implementation
            </CardTitle>
            <CardDescription>
              Core services that power the strategy evaluation engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The application implements comprehensive services to emulate real-world-like 
              evaluation of trading strategies:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">Indicator Evaluation</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculates technical indicators (RSI, EMA, MACD, etc.) using real market data
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <h4 className="font-medium text-sm">Strategy Rule Evaluation</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Evaluates conditions and determines when rules are triggered
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Blocks className="h-4 w-4 text-info" />
                  <h4 className="font-medium text-sm">Action Processing</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Executes strategy actions like buy, sell, and position management
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-warning" />
                  <h4 className="font-medium text-sm">Trade Order Handling</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manages orders including stop-loss, take-profit, and trailing stops
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Rule evaluation and trade simulation are only emulations 
              of real-world-like scenarios.</strong> The results shown in this application are based on 
              historical data and simplified market conditions. There is <strong className="text-foreground">
              no guarantee</strong> that running the same strategy on real trading systems will result 
              in the same outcome.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Actual trading involves risks including but not limited to: market volatility, slippage, 
              execution delays, liquidity issues, and exchange-specific behaviors. Always perform 
              thorough due diligence and consider consulting with a financial advisor before trading 
              with real funds.
            </p>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Links to the project repository, documentation, and packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link 
                href="https://github.com/Palabola/TradeStrategyBuilder" 
                target="_blank"
                className="group"
              >
                <div className="p-4 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-colors h-full">
                  <div className="flex items-center gap-3">
                    <Github className="h-8 w-8" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">GitHub Repository</h4>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </div>
              </Link>
              <Link 
                href="https://palabola.github.io/TradeStrategyBuilder/" 
                target="_blank"
                className="group"
              >
                <div className="p-4 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-colors h-full">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">Demo Site</h4>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </div>
              </Link>
              <Link 
                href="https://www.npmjs.com/package/@palabola86/trade-strategy-builder" 
                target="_blank"
                className="group"
              >
                <div className="p-4 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">NPM Package</h4>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild variant="outline">
            <Link href="/">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/strategy">
              <Blocks className="h-4 w-4 mr-2" />
              Build a Strategy
            </Link>
          </Button>
        </div>
      </div>
      </div>
    </>
  )
}
