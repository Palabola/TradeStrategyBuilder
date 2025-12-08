export interface Trade {
  id: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  timestamp: Date
  status: "completed" | "pending" | "failed"
}

export interface Strategy {
  id: string
  name: string
  symbol: string
  status: "active" | "paused" | "draft"
  pnl: number
  pnlPercent: number
  trades: number
  createdAt: Date
}

export const mockTrades: Trade[] = [
  {
    id: "1",
    symbol: "BTC/USD",
    type: "buy",
    amount: 0.05,
    price: 67234.5,
    total: 3361.73,
    timestamp: new Date("2024-01-15T10:30:00"),
    status: "completed",
  },
  {
    id: "2",
    symbol: "ETH/USD",
    type: "sell",
    amount: 1.2,
    price: 3456.78,
    total: 4148.14,
    timestamp: new Date("2024-01-15T09:15:00"),
    status: "completed",
  },
  {
    id: "3",
    symbol: "SOL/USD",
    type: "buy",
    amount: 25,
    price: 98.45,
    total: 2461.25,
    timestamp: new Date("2024-01-14T16:45:00"),
    status: "completed",
  },
  {
    id: "4",
    symbol: "BTC/USD",
    type: "sell",
    amount: 0.02,
    price: 66890.0,
    total: 1337.8,
    timestamp: new Date("2024-01-14T14:20:00"),
    status: "completed",
  },
  {
    id: "5",
    symbol: "ETH/USD",
    type: "buy",
    amount: 0.8,
    price: 3421.0,
    total: 2736.8,
    timestamp: new Date("2024-01-14T11:00:00"),
    status: "pending",
  },
]

export const mockStrategies: Strategy[] = [
  {
    id: "1",
    name: "BTC RSI Momentum",
    symbol: "BTC/USD",
    status: "active",
    pnl: 2456.78,
    pnlPercent: 12.5,
    trades: 45,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "ETH DCA Bot",
    symbol: "ETH/USD",
    status: "active",
    pnl: 890.34,
    pnlPercent: 8.2,
    trades: 120,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "3",
    name: "SOL Breakout",
    symbol: "SOL/USD",
    status: "paused",
    pnl: -234.56,
    pnlPercent: -3.4,
    trades: 23,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "4",
    name: "Multi-Asset AI",
    symbol: "MULTI",
    status: "draft",
    pnl: 0,
    pnlPercent: 0,
    trades: 0,
    createdAt: new Date("2024-01-15"),
  },
]

export const portfolioBalance = {
  total: 54789.23,
  available: 12456.78,
  inStrategies: 42332.45,
  change24h: 3.45,
}
