"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {Activity } from "lucide-react"
import { DarkModeToggle } from "./dark-mode-toggle"

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className=" flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TradeStrategyBuilder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/strategy"
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/strategy") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Strategy Builder
            </Link>
            <Link
              href="/analyze"
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/analyze") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Strategy Analyzer
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                pathname.includes("/about") 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              About
            </Link>
          </nav>
        </div>
        <DarkModeToggle />
      </div>
    </header>
  )
}
