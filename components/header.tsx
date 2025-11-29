"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Activity } from "lucide-react"

export function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setWalletAddress("0x1234...5678")
    setIsConnected(true)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  const copyAddress = () => {
    navigator.clipboard.writeText("0x1234567890abcdef1234567890abcdef12345678")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">KrakenTrader</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link
              href="/strategy"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Strategy Builder
            </Link>
            <Link
              href="/strategy-runner"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Strategy Runner
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              History
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="font-mono text-sm">{walletAddress}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={copyAddress} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnectWallet} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={connectWallet} className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
