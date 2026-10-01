export type TransactionType = 'buy' | 'sell'

export interface Transaction {
  id: string
  coinId: string
  coinName: string
  symbol: string
  image: string
  type: TransactionType
  quantity: number
  /** Always stored in USD so the portfolio stays consistent when the display currency changes. */
  pricePerCoinUsd: number
  /** ISO date string (yyyy-mm-dd) */
  date: string
  notes: string
  createdAt: number
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

export interface Holding {
  coinId: string
  coinName: string
  symbol: string
  image: string
  quantity: number
  /** Cost basis of the coins still held, in USD */
  costBasisUsd: number
  averageBuyPriceUsd: number
  realizedPnlUsd: number
}

export interface HoldingWithValue extends Holding {
  currentPriceUsd: number
  valueUsd: number
  unrealizedPnlUsd: number
  unrealizedPnlPercent: number
  change24h: number | null
}

export interface PortfolioSummary {
  totalValueUsd: number
  totalCostUsd: number
  unrealizedPnlUsd: number
  unrealizedPnlPercent: number
  realizedPnlUsd: number
  change24hUsd: number
}
