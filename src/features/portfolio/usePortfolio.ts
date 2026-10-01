import { useMemo } from 'react'
import { useSimplePrices } from '@/hooks/useCoinQueries'
import { selectCurrency, useAppSelector } from '@/store/hooks'
import { computeHoldings, getUsdToInrRate, summarizePortfolio, valueHoldings } from './holdings'
import { useTransactions } from './useTransactions'

/** Combines Firestore transactions with live CoinGecko prices into holdings + totals. */
export function usePortfolio() {
  const currency = useAppSelector(selectCurrency)
  const transactionsQuery = useTransactions()
  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data])

  const holdings = useMemo(() => computeHoldings(transactions), [transactions])
  const heldIds = useMemo(
    () => holdings.filter((h) => h.quantity > 0).map((h) => h.coinId),
    [holdings],
  )

  const pricesQuery = useSimplePrices(heldIds)

  const valued = useMemo(
    () => (pricesQuery.data ? valueHoldings(holdings, pricesQuery.data) : []),
    [holdings, pricesQuery.data],
  )
  const summary = useMemo(() => summarizePortfolio(valued, holdings), [valued, holdings])

  // All amounts are stored in USD; convert only for display
  const usdToInr = getUsdToInrRate(pricesQuery.data)
  const rate = currency === 'inr' && usdToInr > 0 ? usdToInr : 1
  const displayCurrency = currency === 'inr' && usdToInr > 0 ? 'inr' : 'usd'

  return {
    transactions,
    holdings: valued,
    summary,
    /** Converts a USD amount into the display currency */
    convert: (usd: number) => usd * rate,
    displayCurrency,
    isLoading: transactionsQuery.isPending || (heldIds.length > 0 && pricesQuery.isPending),
    error: transactionsQuery.error ?? pricesQuery.error,
    refetch: () => {
      transactionsQuery.refetch()
      pricesQuery.refetch()
    },
  } as const
}
