import {
  computeHoldings,
  getHeldQuantities,
  getUsdToInrRate,
  summarizePortfolio,
  valueHoldings,
} from './holdings'
import type { Transaction } from './types'

let nextId = 1
function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: String(nextId++),
    coinId: 'bitcoin',
    coinName: 'Bitcoin',
    symbol: 'btc',
    image: '',
    type: 'buy',
    quantity: 1,
    pricePerCoinUsd: 100,
    date: '2026-01-01',
    notes: '',
    createdAt: nextId,
    ...overrides,
  }
}

describe('computeHoldings', () => {
  it('averages the cost of multiple buys', () => {
    const [holding] = computeHoldings([
      tx({ quantity: 1, pricePerCoinUsd: 100, date: '2026-01-01' }),
      tx({ quantity: 1, pricePerCoinUsd: 200, date: '2026-01-02' }),
    ])

    expect(holding.quantity).toBe(2)
    expect(holding.costBasisUsd).toBe(300)
    expect(holding.averageBuyPriceUsd).toBe(150)
  })

  it('realises profit on a sell using the average cost', () => {
    const [holding] = computeHoldings([
      tx({ quantity: 2, pricePerCoinUsd: 100, date: '2026-01-01' }),
      tx({ type: 'sell', quantity: 1, pricePerCoinUsd: 250, date: '2026-02-01' }),
    ])

    expect(holding.quantity).toBe(1)
    expect(holding.costBasisUsd).toBe(100)
    expect(holding.realizedPnlUsd).toBe(150)
  })

  it('replays transactions in date order, not entry order', () => {
    // The sell was entered first but happened after the buy
    const [holding] = computeHoldings([
      tx({ type: 'sell', quantity: 1, pricePerCoinUsd: 300, date: '2026-03-01' }),
      tx({ quantity: 1, pricePerCoinUsd: 100, date: '2026-01-01' }),
    ])

    expect(holding.quantity).toBe(0)
    expect(holding.realizedPnlUsd).toBe(200)
  })

  it('tracks each coin separately', () => {
    const quantities = getHeldQuantities([
      tx({ coinId: 'bitcoin', quantity: 0.5 }),
      tx({ coinId: 'ethereum', coinName: 'Ethereum', symbol: 'eth', quantity: 3 }),
    ])

    expect(quantities).toEqual({ bitcoin: 0.5, ethereum: 3 })
  })
})

describe('valueHoldings + summarizePortfolio', () => {
  const prices = {
    bitcoin: { usd: 200, inr: 16000, usd_24h_change: 0 },
    ethereum: { usd: 50, inr: 4000, usd_24h_change: 0 },
  }

  it('calculates current value and unrealised profit', () => {
    const holdings = computeHoldings([
      tx({ coinId: 'bitcoin', quantity: 2, pricePerCoinUsd: 100 }),
      tx({
        coinId: 'ethereum',
        coinName: 'Ethereum',
        symbol: 'eth',
        quantity: 4,
        pricePerCoinUsd: 50,
      }),
    ])
    const valued = valueHoldings(holdings, prices)
    const summary = summarizePortfolio(valued, holdings)

    // Sorted by value: BTC (400) before ETH (200)
    expect(valued.map((h) => h.coinId)).toEqual(['bitcoin', 'ethereum'])
    expect(valued[0].unrealizedPnlUsd).toBe(200)
    expect(valued[0].unrealizedPnlPercent).toBe(100)
    expect(summary.totalValueUsd).toBe(600)
    expect(summary.totalCostUsd).toBe(400)
    expect(summary.unrealizedPnlUsd).toBe(200)
    expect(summary.unrealizedPnlPercent).toBe(50)
  })

  it('hides coins that were fully sold but keeps their realised profit', () => {
    const holdings = computeHoldings([
      tx({ quantity: 1, pricePerCoinUsd: 100, date: '2026-01-01' }),
      tx({ type: 'sell', quantity: 1, pricePerCoinUsd: 150, date: '2026-01-02' }),
    ])
    const valued = valueHoldings(holdings, prices)

    expect(valued).toHaveLength(0)
    expect(summarizePortfolio(valued, holdings).realizedPnlUsd).toBe(50)
  })
})

describe('getUsdToInrRate', () => {
  it('derives the rate from bitcoin prices', () => {
    expect(getUsdToInrRate({ bitcoin: { usd: 100, inr: 8500 } })).toBe(85)
  })

  it('returns 0 when prices are missing', () => {
    expect(getUsdToInrRate(undefined)).toBe(0)
  })
})
