import type { SimplePriceResponse } from '@/api/types'
import type { Holding, HoldingWithValue, PortfolioSummary, Transaction } from './types'

const EPSILON = 1e-10

/** Oldest first; same-day transactions keep the order they were entered in. */
function sortChronologically(transactions: Transaction[]) {
  return [...transactions].sort((a, b) =>
    a.date === b.date ? a.createdAt - b.createdAt : a.date.localeCompare(b.date),
  )
}

/**
 * Replays transactions using the average-cost method:
 * - buy:  quantity and cost basis increase
 * - sell: quantity decreases, cost basis drops by (sold qty x average cost),
 *         and the difference to the sell price is realised profit/loss.
 */
export function computeHoldings(transactions: Transaction[]): Holding[] {
  const map = new Map<string, Holding>()

  for (const tx of sortChronologically(transactions)) {
    const holding = map.get(tx.coinId) ?? {
      coinId: tx.coinId,
      coinName: tx.coinName,
      symbol: tx.symbol,
      image: tx.image,
      quantity: 0,
      costBasisUsd: 0,
      averageBuyPriceUsd: 0,
      realizedPnlUsd: 0,
    }

    if (tx.type === 'buy') {
      holding.quantity += tx.quantity
      holding.costBasisUsd += tx.quantity * tx.pricePerCoinUsd
    } else {
      const sellQuantity = Math.min(tx.quantity, holding.quantity)
      const averageCost = holding.quantity > 0 ? holding.costBasisUsd / holding.quantity : 0
      holding.realizedPnlUsd += sellQuantity * (tx.pricePerCoinUsd - averageCost)
      holding.quantity -= sellQuantity
      holding.costBasisUsd -= sellQuantity * averageCost
    }

    if (holding.quantity < EPSILON) {
      holding.quantity = 0
      holding.costBasisUsd = 0
    }
    holding.averageBuyPriceUsd = holding.quantity > 0 ? holding.costBasisUsd / holding.quantity : 0
    map.set(tx.coinId, holding)
  }

  return Array.from(map.values())
}

/** Quantity currently held for each coin, used to validate sell transactions. */
export function getHeldQuantities(transactions: Transaction[]): Record<string, number> {
  return Object.fromEntries(computeHoldings(transactions).map((h) => [h.coinId, h.quantity]))
}

export function valueHoldings(
  holdings: Holding[],
  prices: SimplePriceResponse,
): HoldingWithValue[] {
  return holdings
    .filter((h) => h.quantity > 0)
    .map((h) => {
      const currentPriceUsd = prices[h.coinId]?.usd ?? 0
      const valueUsd = h.quantity * currentPriceUsd
      const unrealizedPnlUsd = valueUsd - h.costBasisUsd
      return {
        ...h,
        currentPriceUsd,
        valueUsd,
        unrealizedPnlUsd,
        unrealizedPnlPercent: h.costBasisUsd > 0 ? (unrealizedPnlUsd / h.costBasisUsd) * 100 : 0,
        change24h: prices[h.coinId]?.usd_24h_change ?? null,
      }
    })
    .sort((a, b) => b.valueUsd - a.valueUsd)
}

export function summarizePortfolio(
  holdings: HoldingWithValue[],
  allHoldings: Holding[] = holdings,
): PortfolioSummary {
  const totalValueUsd = holdings.reduce((sum, h) => sum + h.valueUsd, 0)
  const totalCostUsd = holdings.reduce((sum, h) => sum + h.costBasisUsd, 0)
  const unrealizedPnlUsd = totalValueUsd - totalCostUsd
  const realizedPnlUsd = allHoldings.reduce((sum, h) => sum + h.realizedPnlUsd, 0)

  // Value 24h ago = value / (1 + change%), so the 24h change in money is the difference
  const change24hUsd = holdings.reduce((sum, h) => {
    if (h.change24h === null) return sum
    const valueYesterday = h.valueUsd / (1 + h.change24h / 100)
    return sum + (h.valueUsd - valueYesterday)
  }, 0)

  return {
    totalValueUsd,
    totalCostUsd,
    unrealizedPnlUsd,
    unrealizedPnlPercent: totalCostUsd > 0 ? (unrealizedPnlUsd / totalCostUsd) * 100 : 0,
    realizedPnlUsd,
    change24hUsd,
  }
}

/** USD → INR rate derived from bitcoin's price in both currencies. */
export function getUsdToInrRate(prices: SimplePriceResponse | undefined): number {
  const btc = prices?.bitcoin
  if (!btc?.usd || !btc?.inr) return 0
  return btc.inr / btc.usd
}
