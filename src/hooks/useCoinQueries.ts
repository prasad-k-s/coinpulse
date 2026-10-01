import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { coingeckoApi, MARKETS_PAGE_SIZE } from '@/api/coingecko'
import { queryKeys } from '@/api/queryKeys'
import type { ChartRange } from '@/api/types'
import type { Currency } from '@/types'

/** Max pages to load in the markets table (8 x 250 = top 2,000 coins). */
export const MAX_MARKET_PAGES = 8

/** Infinite list of coins ordered by market cap. Next page loads as the user scrolls. */
export function useMarketsInfinite(currency: Currency) {
  return useInfiniteQuery({
    queryKey: queryKeys.markets(currency),
    queryFn: ({ pageParam, signal }) =>
      coingeckoApi.getMarkets({ currency, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MARKETS_PAGE_SIZE) return undefined
      if (allPages.length >= MAX_MARKET_PAGES) return undefined
      return allPages.length + 1
    },
  })
}

/** Market data for a specific set of coins (watchlist, portfolio). */
export function useMarketsByIds(currency: Currency, ids: string[]) {
  const sortedIds = [...ids].sort()
  return useQuery({
    queryKey: queryKeys.marketsByIds(currency, sortedIds),
    queryFn: ({ signal }) => coingeckoApi.getMarkets({ currency, ids: sortedIds }, signal),
    enabled: sortedIds.length > 0,
    placeholderData: keepPreviousData,
  })
}

export function useCoin(id: string) {
  return useQuery({
    queryKey: queryKeys.coin(id),
    queryFn: ({ signal }) => coingeckoApi.getCoin(id, signal),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMarketChart(id: string, currency: Currency, days: ChartRange) {
  return useQuery({
    queryKey: queryKeys.marketChart(id, currency, days),
    queryFn: ({ signal }) => coingeckoApi.getMarketChart(id, currency, days, signal),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData, // keep the old chart visible while switching ranges
    select: (data) => data.prices.map(([time, price]) => ({ time, price })),
  })
}

/** Current USD + INR prices for the coins in the portfolio (bitcoin is added to derive the USD→INR rate). */
export function useSimplePrices(ids: string[]) {
  const sortedIds = Array.from(new Set([...ids, 'bitcoin'])).sort()
  return useQuery({
    queryKey: queryKeys.simplePrices(sortedIds),
    queryFn: ({ signal }) => coingeckoApi.getSimplePrices(sortedIds, signal),
    enabled: ids.length > 0,
    refetchInterval: 2 * 60 * 1000,
  })
}
