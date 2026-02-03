"use client"

import { ReactNode, ErrorInfo } from "react"
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * Fallback component displayed when an error is caught.
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
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
            onClick={resetErrorBoundary} 
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

/**
 * Logs errors to console (and optionally to external services).
 */
function logError(error: unknown, info: ErrorInfo) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error("[App Error]", errorMessage)
  if (info.componentStack) {
    console.error("Component stack:", info.componentStack)
  }
  // TODO: Log to external service in production (e.g., Sentry, LogRocket)
}

interface ErrorBoundaryProps {
  children: ReactNode
}

/**
 * Global Error Boundary component that catches JavaScript errors anywhere in the app.
 * Uses react-error-boundary library for robust error handling.
 */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset any state that may have caused the error
        // This is called when resetErrorBoundary is invoked
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
