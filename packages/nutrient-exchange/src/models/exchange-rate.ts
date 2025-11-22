/**
 * Exchange Rate Model for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially model dynamic exchange rates between
 * different resource types and credits, enabling a market-based pricing
 * system for decentralized resource sharing.
 *
 * INSPIRATIONS:
 * - Automated Market Makers (AMMs): Uniswap, Balancer pricing curves
 * - Electricity Markets: Real-time pricing based on supply/demand
 * - Cloud Spot Pricing: Dynamic compute pricing (AWS Spot)
 * - Bandwidth Markets: Transit pricing mechanisms
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/models
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { ResourceType } from '../types';

/**
 * Exchange rate between a resource type and credits.
 *
 * THEORETICAL: Rates could fluctuate based on supply, demand,
 * and network conditions.
 */
export interface ExchangeRate {
  /** Resource type */
  readonly resourceType: ResourceType;

  /** Credits per unit of resource */
  creditsPerUnit: number;

  /** Current bid price (consumers willing to pay) */
  bidPrice: number;

  /** Current ask price (providers willing to accept) */
  askPrice: number;

  /** Spread (ask - bid) */
  spread: number;

  /** 24-hour high */
  high24h: number;

  /** 24-hour low */
  low24h: number;

  /** 24-hour volume */
  volume24h: number;

  /** Price change percentage (24h) */
  change24h: number;

  /** Last update timestamp */
  lastUpdated: number;
}

/**
 * Historical price point.
 */
export interface PricePoint {
  /** Timestamp */
  readonly timestamp: number;

  /** Price at this point */
  readonly price: number;

  /** Volume at this point */
  readonly volume: number;

  /** Open price */
  readonly open: number;

  /** Close price */
  readonly close: number;

  /** High price */
  readonly high: number;

  /** Low price */
  readonly low: number;
}

/**
 * Market order for resources.
 */
export interface MarketOrder {
  /** Unique order identifier */
  readonly id: string;

  /** Order type */
  readonly type: 'buy' | 'sell';

  /** Resource type */
  readonly resourceType: ResourceType;

  /** Order creator */
  readonly creator: NodeId;

  /** Amount of resource */
  readonly amount: number;

  /** Limit price (0 for market order) */
  readonly limitPrice: number;

  /** Order status */
  status: OrderStatus;

  /** Amount filled */
  filled: number;

  /** Average fill price */
  avgFillPrice: number;

  /** Creation timestamp */
  readonly createdAt: number;

  /** Expiration timestamp (0 for GTC) */
  readonly expiresAt: number;
}

/**
 * Order status values.
 */
export type OrderStatus =
  | 'pending'     // Awaiting match
  | 'partial'    // Partially filled
  | 'filled'     // Fully filled
  | 'cancelled'  // Cancelled
  | 'expired';   // Expired without fill

/**
 * A trade/match between orders.
 */
export interface Trade {
  /** Unique trade identifier */
  readonly id: string;

  /** Resource type traded */
  readonly resourceType: ResourceType;

  /** Buy order ID */
  readonly buyOrderId: string;

  /** Sell order ID */
  readonly sellOrderId: string;

  /** Buyer node */
  readonly buyer: NodeId;

  /** Seller node */
  readonly seller: NodeId;

  /** Amount traded */
  readonly amount: number;

  /** Trade price */
  readonly price: number;

  /** Total credits exchanged */
  readonly totalCredits: number;

  /** Trade timestamp */
  readonly timestamp: number;
}

/**
 * Order book for a resource type.
 */
export interface OrderBook {
  /** Resource type */
  readonly resourceType: ResourceType;

  /** Buy orders (sorted by price descending) */
  bids: OrderBookEntry[];

  /** Sell orders (sorted by price ascending) */
  asks: OrderBookEntry[];

  /** Last trade price */
  lastPrice: number;

  /** Last trade timestamp */
  lastTradeAt: number;
}

/**
 * Entry in the order book.
 */
export interface OrderBookEntry {
  /** Price level */
  readonly price: number;

  /** Total amount at this price */
  amount: number;

  /** Number of orders at this price */
  orderCount: number;
}

/**
 * Configuration for the exchange rate system.
 */
export interface ExchangeRateConfig {
  /** Minimum order size */
  minOrderSize: number;

  /** Maximum order size */
  maxOrderSize: number;

  /** Trading fee percentage */
  tradingFeePct: number;

  /** Price impact threshold for warnings */
  priceImpactThreshold: number;

  /** Order book depth to maintain */
  orderBookDepth: number;

  /** Price history retention (ms) */
  priceHistoryRetention: number;

  /** Base rates for resources */
  baseRates: Record<ResourceType, number>;

  /** Price smoothing factor (0-1) */
  smoothingFactor: number;
}

/**
 * Events emitted by the exchange rate system.
 */
export interface ExchangeRateEvents {
  'rate:updated': (resourceType: ResourceType, rate: ExchangeRate) => void;
  'order:placed': (order: MarketOrder) => void;
  'order:matched': (trade: Trade) => void;
  'order:cancelled': (orderId: string) => void;
  'order:expired': (orderId: string) => void;
  'price:alert': (resourceType: ResourceType, oldPrice: number, newPrice: number) => void;
  'liquidity:low': (resourceType: ResourceType, side: 'bid' | 'ask') => void;
}

/**
 * Default configuration values.
 */
export const DEFAULT_EXCHANGE_CONFIG: ExchangeRateConfig = {
  minOrderSize: 1,
  maxOrderSize: 1e12,
  tradingFeePct: 0.003, // 0.3%
  priceImpactThreshold: 0.05, // 5%
  orderBookDepth: 50,
  priceHistoryRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
  baseRates: {
    bandwidth: 0.001,    // credits per byte per second
    storage: 0.0001,     // credits per byte per hour
    compute: 0.01,       // credits per compute unit
    connectivity: 0.005, // credits per connection
  },
  smoothingFactor: 0.2,
};

/**
 * ExchangeRateManager - THEORETICAL market-based pricing system.
 *
 * This class might potentially implement a dynamic pricing system
 * for network resources based on supply and demand, similar to
 * automated market makers in DeFi.
 *
 * DISCLAIMER: This is a conceptual implementation for educational purposes.
 * A real system would require sophisticated market microstructure,
 * anti-manipulation measures, and economic modeling.
 *
 * @example
 * ```typescript
 * // THEORETICAL usage example
 * const exchange = new ExchangeRateManager();
 *
 * // Get current rate for bandwidth
 * const rate = exchange.getRate('bandwidth');
 * console.log(`Current bandwidth rate: ${rate.creditsPerUnit} credits/byte`);
 *
 * // Place a buy order
 * const order = await exchange.placeBuyOrder({
 *   resourceType: 'bandwidth',
 *   creator: 'node-123',
 *   amount: 1024 * 1024 * 100, // 100 MB
 *   limitPrice: 0.002, // Max 0.002 credits/byte
 * });
 *
 * // Get order book
 * const book = exchange.getOrderBook('bandwidth');
 * console.log(`Top bid: ${book.bids[0]?.price}, Top ask: ${book.asks[0]?.price}`);
 * ```
 */
export class ExchangeRateManager extends EventEmitter<ExchangeRateEvents> {
  private readonly config: ExchangeRateConfig;
  private readonly rates: Map<ResourceType, ExchangeRate> = new Map();
  private readonly orderBooks: Map<ResourceType, OrderBook> = new Map();
  private readonly orders: Map<string, MarketOrder> = new Map();
  private readonly trades: Map<string, Trade> = new Map();
  private readonly priceHistory: Map<ResourceType, PricePoint[]> = new Map();
  private readonly supplyDemand: Map<ResourceType, { supply: number; demand: number }> = new Map();

  /**
   * Creates a new ExchangeRateManager instance.
   *
   * @param config - Configuration options
   */
  constructor(config: Partial<ExchangeRateConfig> = {}) {
    super();
    this.config = { ...DEFAULT_EXCHANGE_CONFIG, ...config };

    // Initialize for all resource types
    this.initializeMarkets();
  }

  /**
   * Initializes markets for all resource types.
   */
  private initializeMarkets(): void {
    const resourceTypes: ResourceType[] = ['bandwidth', 'storage', 'compute', 'connectivity'];

    for (const type of resourceTypes) {
      const baseRate = this.config.baseRates[type];

      const rate: ExchangeRate = {
        resourceType: type,
        creditsPerUnit: baseRate,
        bidPrice: baseRate * 0.99,
        askPrice: baseRate * 1.01,
        spread: baseRate * 0.02,
        high24h: baseRate,
        low24h: baseRate,
        volume24h: 0,
        change24h: 0,
        lastUpdated: Date.now(),
      };

      this.rates.set(type, rate);

      const orderBook: OrderBook = {
        resourceType: type,
        bids: [],
        asks: [],
        lastPrice: baseRate,
        lastTradeAt: 0,
      };

      this.orderBooks.set(type, orderBook);
      this.priceHistory.set(type, []);
      this.supplyDemand.set(type, { supply: 1000, demand: 1000 });
    }
  }

  /**
   * Gets the current exchange rate for a resource type.
   *
   * @param resourceType - Resource type to query
   * @returns Current exchange rate
   */
  getRate(resourceType: ResourceType): ExchangeRate {
    const rate = this.rates.get(resourceType);
    if (!rate) {
      throw new Error('Unknown resource type');
    }
    return { ...rate };
  }

  /**
   * Gets all current rates.
   *
   * @returns All exchange rates
   */
  getAllRates(): ExchangeRate[] {
    return Array.from(this.rates.values());
  }

  /**
   * Updates supply and demand metrics, recalculating rates.
   *
   * THEORETICAL: This could adjust prices based on network conditions,
   * similar to how electricity markets respond to grid conditions.
   *
   * @param resourceType - Resource type to update
   * @param supply - Current supply level
   * @param demand - Current demand level
   */
  updateSupplyDemand(resourceType: ResourceType, supply: number, demand: number): void {
    const rate = this.rates.get(resourceType);
    if (!rate) return;

    this.supplyDemand.set(resourceType, { supply, demand });

    // THEORETICAL: Calculate new price based on supply/demand ratio
    const baseRate = this.config.baseRates[resourceType];
    const ratio = demand / (supply + 1); // Avoid division by zero

    // Price adjustment formula (simplified)
    // When demand > supply, price increases
    // When supply > demand, price decreases
    const priceMultiplier = Math.pow(ratio, 0.5); // Square root for dampening
    const rawNewPrice = baseRate * priceMultiplier;

    // Apply smoothing
    const oldPrice = rate.creditsPerUnit;
    const newPrice = oldPrice * (1 - this.config.smoothingFactor) +
                     rawNewPrice * this.config.smoothingFactor;

    // Update rate
    this.updateRate(resourceType, newPrice);
  }

  /**
   * Places a buy order (consumer wants to acquire resources).
   *
   * THEORETICAL: Orders could be matched using a continuous double
   * auction mechanism similar to financial exchanges.
   *
   * @param params - Order parameters
   * @returns The placed order
   */
  async placeBuyOrder(params: {
    resourceType: ResourceType;
    creator: NodeId;
    amount: number;
    limitPrice?: number;
    expiresAt?: number;
  }): Promise<MarketOrder> {
    return this.placeOrder('buy', params);
  }

  /**
   * Places a sell order (provider wants to offer resources).
   *
   * @param params - Order parameters
   * @returns The placed order
   */
  async placeSellOrder(params: {
    resourceType: ResourceType;
    creator: NodeId;
    amount: number;
    limitPrice?: number;
    expiresAt?: number;
  }): Promise<MarketOrder> {
    return this.placeOrder('sell', params);
  }

  /**
   * Places an order.
   *
   * @param type - Order type
   * @param params - Order parameters
   * @returns The placed order
   */
  private async placeOrder(
    type: 'buy' | 'sell',
    params: {
      resourceType: ResourceType;
      creator: NodeId;
      amount: number;
      limitPrice?: number;
      expiresAt?: number;
    }
  ): Promise<MarketOrder> {
    const { resourceType, creator, amount, limitPrice = 0, expiresAt = 0 } = params;

    // Validate order
    if (amount < this.config.minOrderSize || amount > this.config.maxOrderSize) {
      throw new Error('Order size outside allowed range');
    }

    const rate = this.rates.get(resourceType);
    if (!rate) {
      throw new Error('Unknown resource type');
    }

    const order: MarketOrder = {
      id: this.generateOrderId(),
      type,
      resourceType,
      creator,
      amount,
      limitPrice,
      status: 'pending',
      filled: 0,
      avgFillPrice: 0,
      createdAt: Date.now(),
      expiresAt,
    };

    this.orders.set(order.id, order);
    this.emit('order:placed', order);

    // Try to match the order
    await this.matchOrder(order);

    // If not fully filled, add to order book
    if (order.status !== 'filled') {
      this.addToOrderBook(order);
    }

    return order;
  }

  /**
   * Attempts to match an order against the order book.
   *
   * @param order - Order to match
   */
  private async matchOrder(order: MarketOrder): Promise<void> {
    const book = this.orderBooks.get(order.resourceType);
    if (!book) return;

    const isMarketOrder = order.limitPrice === 0;
    const counterSide = order.type === 'buy' ? book.asks : book.bids;

    let remaining = order.amount - order.filled;
    let totalCredits = 0;
    let totalFilled = 0;

    // Match against counter orders
    while (remaining > 0 && counterSide.length > 0) {
      const best = counterSide[0];

      // Check if price is acceptable
      if (!isMarketOrder) {
        if (order.type === 'buy' && best.price > order.limitPrice) break;
        if (order.type === 'sell' && best.price < order.limitPrice) break;
      }

      // Calculate fill amount
      const fillAmount = Math.min(remaining, best.amount);
      const fillPrice = best.price;

      // Execute trade
      const trade = await this.executeTrade(order, fillAmount, fillPrice);

      totalCredits += fillPrice * fillAmount;
      totalFilled += fillAmount;
      remaining -= fillAmount;

      // Update counter order book entry
      best.amount -= fillAmount;
      best.orderCount--;

      if (best.amount <= 0) {
        counterSide.shift();
      }
    }

    // Update order
    if (totalFilled > 0) {
      order.filled += totalFilled;
      order.avgFillPrice = (order.avgFillPrice * (order.filled - totalFilled) + totalCredits) / order.filled;

      if (order.filled >= order.amount) {
        order.status = 'filled';
      } else {
        order.status = 'partial';
      }
    }
  }

  /**
   * Executes a trade between two orders.
   *
   * @param order - Initiating order
   * @param amount - Trade amount
   * @param price - Trade price
   * @returns The executed trade
   */
  private async executeTrade(
    order: MarketOrder,
    amount: number,
    price: number
  ): Promise<Trade> {
    const trade: Trade = {
      id: this.generateTradeId(),
      resourceType: order.resourceType,
      buyOrderId: order.type === 'buy' ? order.id : 'book',
      sellOrderId: order.type === 'sell' ? order.id : 'book',
      buyer: order.type === 'buy' ? order.creator : 'book' as NodeId,
      seller: order.type === 'sell' ? order.creator : 'book' as NodeId,
      amount,
      price,
      totalCredits: price * amount,
      timestamp: Date.now(),
    };

    this.trades.set(trade.id, trade);
    this.emit('order:matched', trade);

    // Update market data
    this.updateRate(order.resourceType, price);
    this.recordPriceHistory(order.resourceType, price, amount);

    return trade;
  }

  /**
   * Adds an unfilled order to the order book.
   *
   * @param order - Order to add
   */
  private addToOrderBook(order: MarketOrder): void {
    if (order.limitPrice === 0) return; // Market orders don't rest on book

    const book = this.orderBooks.get(order.resourceType);
    if (!book) return;

    const side = order.type === 'buy' ? book.bids : book.asks;
    const remainingAmount = order.amount - order.filled;

    // Find or create price level
    let entry = side.find(e => e.price === order.limitPrice);

    if (entry) {
      entry.amount += remainingAmount;
      entry.orderCount++;
    } else {
      entry = {
        price: order.limitPrice,
        amount: remainingAmount,
        orderCount: 1,
      };
      side.push(entry);

      // Sort: bids descending, asks ascending
      if (order.type === 'buy') {
        side.sort((a, b) => b.price - a.price);
      } else {
        side.sort((a, b) => a.price - b.price);
      }

      // Trim to max depth
      while (side.length > this.config.orderBookDepth) {
        side.pop();
      }
    }
  }

  /**
   * Updates the exchange rate after a trade.
   *
   * @param resourceType - Resource type
   * @param newPrice - New price from trade
   */
  private updateRate(resourceType: ResourceType, newPrice: number): void {
    const rate = this.rates.get(resourceType);
    if (!rate) return;

    const oldPrice = rate.creditsPerUnit;
    const now = Date.now();

    // Update 24h metrics
    const isNew24hPeriod = now - rate.lastUpdated > 24 * 60 * 60 * 1000;

    rate.creditsPerUnit = newPrice;
    rate.lastUpdated = now;

    if (isNew24hPeriod) {
      rate.high24h = newPrice;
      rate.low24h = newPrice;
    } else {
      rate.high24h = Math.max(rate.high24h, newPrice);
      rate.low24h = Math.min(rate.low24h, newPrice);
    }

    rate.change24h = ((newPrice - oldPrice) / oldPrice) * 100;

    // Update bid/ask based on order book
    const book = this.orderBooks.get(resourceType);
    if (book) {
      rate.bidPrice = book.bids[0]?.price ?? newPrice * 0.99;
      rate.askPrice = book.asks[0]?.price ?? newPrice * 1.01;
      rate.spread = rate.askPrice - rate.bidPrice;
      book.lastPrice = newPrice;
      book.lastTradeAt = now;
    }

    this.emit('rate:updated', resourceType, rate);

    // Check for significant price movement
    if (Math.abs(rate.change24h) > this.config.priceImpactThreshold * 100) {
      this.emit('price:alert', resourceType, oldPrice, newPrice);
    }
  }

  /**
   * Records a price point in history.
   *
   * @param resourceType - Resource type
   * @param price - Trade price
   * @param volume - Trade volume
   */
  private recordPriceHistory(resourceType: ResourceType, price: number, volume: number): void {
    const history = this.priceHistory.get(resourceType);
    if (!history) return;

    const now = Date.now();

    // Create new price point or update existing one for current period
    const periodMs = 60 * 1000; // 1 minute periods
    const currentPeriod = Math.floor(now / periodMs) * periodMs;

    let current = history.find(p => p.timestamp === currentPeriod);

    if (!current) {
      const prevClose = history.length > 0 ? history[history.length - 1].close : price;

      current = {
        timestamp: currentPeriod,
        price,
        volume,
        open: prevClose,
        close: price,
        high: price,
        low: price,
      };
      history.push(current);
    } else {
      // Update existing period (cast to mutable)
      const mutable = current as { high: number; low: number; close: number; volume: number };
      mutable.high = Math.max(current.high, price);
      mutable.low = Math.min(current.low, price);
      mutable.close = price;
      mutable.volume += volume;
    }

    // Update rate volume
    const rate = this.rates.get(resourceType);
    if (rate) {
      rate.volume24h += volume;
    }

    // Clean old history
    const cutoff = now - this.config.priceHistoryRetention;
    while (history.length > 0 && history[0].timestamp < cutoff) {
      history.shift();
    }
  }

  /**
   * Gets the order book for a resource type.
   *
   * @param resourceType - Resource type
   * @param depth - Number of levels to return
   * @returns Order book
   */
  getOrderBook(resourceType: ResourceType, depth?: number): OrderBook {
    const book = this.orderBooks.get(resourceType);
    if (!book) {
      throw new Error('Unknown resource type');
    }

    const d = depth ?? this.config.orderBookDepth;

    return {
      ...book,
      bids: book.bids.slice(0, d),
      asks: book.asks.slice(0, d),
    };
  }

  /**
   * Gets price history for a resource type.
   *
   * @param resourceType - Resource type
   * @param since - Start timestamp
   * @returns Price history
   */
  getPriceHistory(resourceType: ResourceType, since?: number): PricePoint[] {
    const history = this.priceHistory.get(resourceType);
    if (!history) return [];

    const s = since ?? 0;
    return history.filter(p => p.timestamp >= s);
  }

  /**
   * Estimates the price impact of a large order.
   *
   * THEORETICAL: Price impact calculation could help users understand
   * the cost of large orders in low-liquidity markets.
   *
   * @param resourceType - Resource type
   * @param orderType - Buy or sell
   * @param amount - Order amount
   * @returns Estimated price impact
   */
  estimatePriceImpact(
    resourceType: ResourceType,
    orderType: 'buy' | 'sell',
    amount: number
  ): PriceImpactEstimate {
    const book = this.orderBooks.get(resourceType);
    const rate = this.rates.get(resourceType);

    if (!book || !rate) {
      throw new Error('Unknown resource type');
    }

    const side = orderType === 'buy' ? book.asks : book.bids;

    let remaining = amount;
    let totalCost = 0;
    let worstPrice = orderType === 'buy' ? 0 : Infinity;

    for (const level of side) {
      if (remaining <= 0) break;

      const fillAmount = Math.min(remaining, level.amount);
      totalCost += fillAmount * level.price;

      if (orderType === 'buy') {
        worstPrice = Math.max(worstPrice, level.price);
      } else {
        worstPrice = Math.min(worstPrice, level.price);
      }

      remaining -= fillAmount;
    }

    const avgPrice = totalCost / (amount - remaining);
    const midPrice = (rate.bidPrice + rate.askPrice) / 2;
    const priceImpact = Math.abs((avgPrice - midPrice) / midPrice);

    return {
      avgPrice,
      worstPrice: remaining > 0 ? NaN : worstPrice,
      priceImpact,
      totalCost: totalCost + (totalCost * this.config.tradingFeePct),
      unfillable: remaining,
      warning: priceImpact > this.config.priceImpactThreshold
        ? `High price impact: ${(priceImpact * 100).toFixed(2)}%`
        : undefined,
    };
  }

  /**
   * Cancels an order.
   *
   * @param orderId - Order to cancel
   */
  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'filled' || order.status === 'cancelled') {
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';

    // Remove from order book
    const book = this.orderBooks.get(order.resourceType);
    if (book) {
      const side = order.type === 'buy' ? book.bids : book.asks;
      const entry = side.find(e => e.price === order.limitPrice);

      if (entry) {
        const remaining = order.amount - order.filled;
        entry.amount -= remaining;
        entry.orderCount--;

        if (entry.amount <= 0) {
          const idx = side.indexOf(entry);
          if (idx !== -1) side.splice(idx, 1);
        }
      }
    }

    this.emit('order:cancelled', orderId);
  }

  /**
   * Gets recent trades.
   *
   * @param resourceType - Resource type to filter by
   * @param limit - Maximum trades to return
   * @returns Recent trades
   */
  getRecentTrades(resourceType?: ResourceType, limit = 100): Trade[] {
    let trades = Array.from(this.trades.values());

    if (resourceType) {
      trades = trades.filter(t => t.resourceType === resourceType);
    }

    return trades
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Private helper methods

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private generateTradeId(): string {
    return `trade-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Price impact estimate for a large order.
 */
export interface PriceImpactEstimate {
  /** Average execution price */
  avgPrice: number;

  /** Worst price level hit */
  worstPrice: number;

  /** Price impact percentage (0-1) */
  priceImpact: number;

  /** Total cost including fees */
  totalCost: number;

  /** Amount that couldn't be filled from order book */
  unfillable: number;

  /** Warning message if high impact */
  warning?: string;
}
