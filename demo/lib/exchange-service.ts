/**
 * Exchange Service - Mock exchange API
 * Simulates order management for trading strategies
 */

// Order types
export type OrderType = 
  | "market" 
  | "limit" 
  | "stop-loss" 
  | "take-profit" 
  | "stop-loss-limit" 
  | "take-profit-limit" 
  | "trailing-stop" 
  | "trailing-stop-limit"

export type OrderSide = "buy" | "sell"

export type OrderStatus = "completed" | "canceled"

// Base order interface
export interface BaseOrder {
  id: string
  type: OrderSide
  orderType: OrderType
  pair: string
  volume: number
  price: number
  leverage?: number
  entryPrice: number
  triggerPrice: number | null
  trailingDistance: number | null
}

// Open order
export interface OpenOrder extends BaseOrder {
  createdAt: number
}

// Pending order (child of an open order)
export interface PendingOrder extends BaseOrder {
  parentId: string
  createdAt: number
}

// Closed order
export interface ClosedOrder extends BaseOrder {
  closePrice: number
  status: OrderStatus
  closedAt: number
  createdAt: number
}

// Add order parameters
export interface AddOrderParams {
  orderType: OrderType
  type: OrderSide
  volume: number
  pair: string
  price?: number
  leverage?: number
  priceSL?: number
  priceTP?: number
  trailingDistance?: number
}

// Order update result
export interface OrderUpdateResult {
  triggeredOrders: ClosedOrder[]
  activatedPendingOrders: OpenOrder[]
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

class ExchangeService {
  private openOrders: Map<string, OpenOrder> = new Map()
  private pendingOrders: Map<string, PendingOrder> = new Map()
  private closedOrders: Map<string, ClosedOrder> = new Map()
  private accountBalances: Map<string, number> = new Map()

  /**
   * Reset all stored data
   */
  reset(): void {
    this.openOrders.clear()
    this.pendingOrders.clear()
    this.closedOrders.clear()
    this.accountBalances.clear()
  }

  /**
   * Get all open orders
   */
  getOpenOrders(): OpenOrder[] {
    return Array.from(this.openOrders.values())
  }

  /**
   * Get all pending orders
   */
  getPendingOrders(): PendingOrder[] {
    return Array.from(this.pendingOrders.values())
  }

  /**
   * Get all closed orders
   */
  getClosedOrders(): ClosedOrder[] {
    return Array.from(this.closedOrders.values())
  }

  /**
   * Get open orders for a specific pair
   */
  getOpenOrdersByPair(pair: string): OpenOrder[] {
    return Array.from(this.openOrders.values()).filter(order => order.pair === pair)
  }

  /**
   * Update orders based on current price
   * - Check if trigger prices are hit
   * - Update trailing stop trigger prices
   * - Activate pending orders when parent completes
   */
  updateOrders(timestamp: number, price: number, pair?: string): OrderUpdateResult {
    const result: OrderUpdateResult = {
      triggeredOrders: [],
      activatedPendingOrders: [],
    }

    // Process open orders
    const ordersToProcess = pair 
      ? this.getOpenOrdersByPair(pair)
      : this.getOpenOrders()

    for (const order of ordersToProcess) {
      // Update trailing stop trigger price
      if (order.trailingDistance !== null && order.triggerPrice !== null) {
        if (order.type === "buy") {
          // For buy trailing stop, trigger price moves up with price
          const newTriggerPrice = price - order.trailingDistance
          if (newTriggerPrice > order.triggerPrice) {
            order.triggerPrice = newTriggerPrice
            this.openOrders.set(order.id, order)
          }
        } else {
          // For sell trailing stop, trigger price moves down with price
          const newTriggerPrice = price + order.trailingDistance
          if (newTriggerPrice < order.triggerPrice) {
            order.triggerPrice = newTriggerPrice
            this.openOrders.set(order.id, order)
          }
        }
      }

      // Check if trigger price is hit
      const isTriggered = this.checkTrigger(order, price)

      if (isTriggered) {
        // Close the order
        const closedOrder = this.closeOrder(order, price, timestamp, "completed")
        result.triggeredOrders.push(closedOrder)

        // Activate pending orders for this parent
        const activatedOrders = this.activatePendingOrders(order.id, timestamp)
        result.activatedPendingOrders.push(...activatedOrders)
      }
    }

    return result
  }

  /**
   * Check if an order's trigger condition is met
   */
  private checkTrigger(order: OpenOrder | PendingOrder, price: number): boolean {
    if (order.triggerPrice === null) {
      // Market orders trigger immediately
      return order.orderType === "market"
    }

    switch (order.orderType) {
      case "limit":
        // Buy limit triggers when price <= trigger, Sell limit when price >= trigger
        return order.type === "buy" 
          ? price <= order.triggerPrice 
          : price >= order.triggerPrice

      case "stop-loss":
      case "stop-loss-limit":
        // Buy stop-loss triggers when price >= trigger (price going up against short)
        // Sell stop-loss triggers when price <= trigger (price going down against long)
        return order.type === "buy"
          ? price >= order.triggerPrice
          : price <= order.triggerPrice

      case "take-profit":
      case "take-profit-limit":
        // Buy take-profit triggers when price <= trigger (price going down, close short)
        // Sell take-profit triggers when price >= trigger (price going up, close long)
        return order.type === "buy"
          ? price <= order.triggerPrice
          : price >= order.triggerPrice

      case "trailing-stop":
      case "trailing-stop-limit":
        // Trailing stop: buy triggers when price >= trigger, sell when price <= trigger
        return order.type === "buy"
          ? price >= order.triggerPrice
          : price <= order.triggerPrice

      case "market":
        return true

      default:
        return false
    }
  }

  /**
   * Close an order and move it to closed orders
   */
  private closeOrder(
    order: OpenOrder | PendingOrder,
    closePrice: number,
    timestamp: number,
    status: OrderStatus
  ): ClosedOrder {
    const closedOrder: ClosedOrder = {
      id: order.id,
      type: order.type,
      orderType: order.orderType,
      pair: order.pair,
      volume: order.volume,
      price: order.price,
      leverage: order.leverage,
      entryPrice: order.entryPrice,
      triggerPrice: order.triggerPrice,
      trailingDistance: order.trailingDistance,
      closePrice,
      status,
      closedAt: timestamp,
      createdAt: order.createdAt,
    }

    this.openOrders.delete(order.id)
    this.closedOrders.set(order.id, closedOrder)

    return closedOrder
  }

  /**
   * Activate pending orders when parent order completes
   */
  private activatePendingOrders(parentId: string, timestamp: number): OpenOrder[] {
    const activatedOrders: OpenOrder[] = []

    for (const [id, pendingOrder] of this.pendingOrders) {
      if (pendingOrder.parentId === parentId) {
        const openOrder: OpenOrder = {
          id: pendingOrder.id,
          type: pendingOrder.type,
          orderType: pendingOrder.orderType,
          pair: pendingOrder.pair,
          volume: pendingOrder.volume,
          price: pendingOrder.price,
          leverage: pendingOrder.leverage,
          entryPrice: pendingOrder.entryPrice,
          triggerPrice: pendingOrder.triggerPrice,
          trailingDistance: pendingOrder.trailingDistance,
          createdAt: timestamp,
        }

        this.openOrders.set(id, openOrder)
        this.pendingOrders.delete(id)
        activatedOrders.push(openOrder)
      }
    }

    return activatedOrders
  }

  /**
   * Add a new order
   * If priceSL, priceTP, or trailingDistance is set, create pending child orders
   */
  addOrder(params: AddOrderParams): OpenOrder {
    const orderId = generateId()
    const timestamp = Date.now()

    // For market orders, price is not required. For other orders, it should be provided
    const orderPrice = params.price || 0

    // Calculate trigger price based on order type
    let triggerPrice: number | null = null
    if (params.orderType !== "market") {
      triggerPrice = orderPrice
    }

    // Calculate trailing distance trigger price
    let trailingDistance: number | null = null
    if (params.trailingDistance) {
      trailingDistance = params.trailingDistance
      // Set initial trigger price for trailing stop
      if (params.orderType === "trailing-stop" || params.orderType === "trailing-stop-limit") {
        triggerPrice = params.type === "buy"
          ? orderPrice + params.trailingDistance
          : orderPrice - params.trailingDistance
      }
    }

    const openOrder: OpenOrder = {
      id: orderId,
      type: params.type,
      orderType: params.orderType,
      pair: params.pair,
      volume: params.volume,
      price: orderPrice,
      leverage: params.leverage,
      entryPrice: orderPrice,
      triggerPrice,
      trailingDistance,
      createdAt: timestamp,
    }

    this.openOrders.set(orderId, openOrder)

    // Create pending stop-loss order if priceSL is set
    if (params.priceSL) {
      const slOrderId = generateId()
      const slOrder: PendingOrder = {
        id: slOrderId,
        parentId: orderId,
        type: params.type === "buy" ? "sell" : "buy", // Opposite side to close position
        orderType: "stop-loss",
        pair: params.pair,
        volume: params.volume,
        price: params.priceSL,
        leverage: params.leverage,
        entryPrice: params.priceSL,
        triggerPrice: params.priceSL,
        trailingDistance: null,
        createdAt: timestamp,
      }
      this.pendingOrders.set(slOrderId, slOrder)
    }

    // Create pending take-profit order (with optional trailing) if priceTP is set
    if (params.priceTP) {
      const tpOrderId = generateId()
      const tpOrderType: OrderType = params.trailingDistance 
        ? "trailing-stop" 
        : "take-profit"
      
      let tpTriggerPrice = params.priceTP
      if (params.trailingDistance) {
        // For trailing take-profit, set initial trigger based on TP price
        tpTriggerPrice = params.type === "buy"
          ? params.priceTP - params.trailingDistance
          : params.priceTP + params.trailingDistance
      }

      const tpOrder: PendingOrder = {
        id: tpOrderId,
        parentId: orderId,
        type: params.type === "buy" ? "sell" : "buy", // Opposite side to close position
        orderType: tpOrderType,
        pair: params.pair,
        volume: params.volume,
        price: params.priceTP,
        leverage: params.leverage,
        entryPrice: params.priceTP,
        triggerPrice: tpTriggerPrice,
        trailingDistance: params.trailingDistance || null,
        createdAt: timestamp,
      }
      this.pendingOrders.set(tpOrderId, tpOrder)
    }

    return openOrder
  }

  /**
   * Close all orders for a specific pair
   */
  closeAllOrders(pair: string, timestamp?: number): ClosedOrder[] {
    const closeTime = timestamp || Date.now()
    const closedOrders: ClosedOrder[] = []

    // Close all open orders for the pair
    for (const [id, order] of this.openOrders) {
      if (order.pair === pair) {
        const closedOrder: ClosedOrder = {
          ...order,
          closePrice: order.price,
          status: "canceled",
          closedAt: closeTime,
        }
        this.closedOrders.set(id, closedOrder)
        this.openOrders.delete(id)
        closedOrders.push(closedOrder)
      }
    }

    // Cancel all pending orders for the pair
    for (const [id, order] of this.pendingOrders) {
      if (order.pair === pair) {
        const closedOrder: ClosedOrder = {
          id: order.id,
          type: order.type,
          orderType: order.orderType,
          pair: order.pair,
          volume: order.volume,
          price: order.price,
          leverage: order.leverage,
          entryPrice: order.entryPrice,
          triggerPrice: order.triggerPrice,
          trailingDistance: order.trailingDistance,
          closePrice: order.price,
          status: "canceled",
          closedAt: closeTime,
          createdAt: order.createdAt,
        }
        this.closedOrders.set(id, closedOrder)
        this.pendingOrders.delete(id)
        closedOrders.push(closedOrder)
      }
    }

    return closedOrders
  }

  /**
   * Cancel a specific order by ID
   */
  cancelOrder(orderId: string, timestamp?: number): ClosedOrder | null {
    const closeTime = timestamp || Date.now()

    // Check open orders
    const openOrder = this.openOrders.get(orderId)
    if (openOrder) {
      const closedOrder: ClosedOrder = {
        ...openOrder,
        closePrice: openOrder.price,
        status: "canceled",
        closedAt: closeTime,
      }
      this.closedOrders.set(orderId, closedOrder)
      this.openOrders.delete(orderId)

      // Also cancel any pending child orders
      for (const [id, pending] of this.pendingOrders) {
        if (pending.parentId === orderId) {
          this.pendingOrders.delete(id)
        }
      }

      return closedOrder
    }

    // Check pending orders
    const pendingOrder = this.pendingOrders.get(orderId)
    if (pendingOrder) {
      const closedOrder: ClosedOrder = {
        id: pendingOrder.id,
        type: pendingOrder.type,
        orderType: pendingOrder.orderType,
        pair: pendingOrder.pair,
        volume: pendingOrder.volume,
        price: pendingOrder.price,
        leverage: pendingOrder.leverage,
        entryPrice: pendingOrder.entryPrice,
        triggerPrice: pendingOrder.triggerPrice,
        trailingDistance: pendingOrder.trailingDistance,
        closePrice: pendingOrder.price,
        status: "canceled",
        closedAt: closeTime,
        createdAt: pendingOrder.createdAt,
      }
      this.closedOrders.set(orderId, closedOrder)
      this.pendingOrders.delete(orderId)
      return closedOrder
    }

    return null
  }

  /**
   * Get order by ID (searches all order types)
   */
  getOrderById(orderId: string): OpenOrder | PendingOrder | ClosedOrder | null {
    return (
      this.openOrders.get(orderId) ||
      this.pendingOrders.get(orderId) ||
      this.closedOrders.get(orderId) ||
      null
    )
  }

  /**
   * Set account balance for a specific symbol
   */
  setAccountBalance(symbol: string, amount: number): void {
    this.accountBalances.set(symbol, amount)
  }

  /**
   * Get account balance for a specific symbol
   */
  getAccountBalance(symbol: string): number {
    return this.accountBalances.get(symbol) || 0
  }

  /**
   * Reset all account balances
   */
  resetBalance(): void {
    this.accountBalances.clear()
  }

  /**
   * Get all account balances
   */
  getAllBalances(): Record<string, number> {
    const balances: Record<string, number> = {}
    for (const [symbol, amount] of this.accountBalances) {
      balances[symbol] = amount
    }
    return balances
  }
}

// Export singleton instance
export const exchangeService = new ExchangeService()

// Also export the class for testing purposes
export { ExchangeService }
