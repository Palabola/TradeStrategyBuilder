"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Global Error Boundary component that catches JavaScript errors anywhere in the app.
 * Provides a fallback UI and prevents the entire app from crashing.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    console.error("[App Error]", error.message)
    console.error("Component stack:", errorInfo.componentStack)
    
    // TODO: Log to external service in production (e.g., Sentry, LogRocket)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center max-w-md w-full p-8 bg-card rounded-lg border border-destructive/20 shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Something went wrong
            </h1>
            
            <p className="text-muted-foreground text-center mb-8">
              An unexpected error occurred. Please try again or return to the dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={this.handleReset} 
                variant="outline" 
                className="flex-1 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
