import type { Currency } from '@/types'
import type { ChartRange } from './types'

/** One place for every React Query key, so invalidation is consistent. */
export const queryKeys = {
  markets: (currency: Currency) => ['markets', currency] as const,
  marketsByIds: (currency: Currency, ids: string[]) => ['markets', currency, 'ids', ids] as const,
  coin: (id: string) => ['coin', id] as const,
  marketChart: (id: string, currency: Currency, days: ChartRange) =>
    ['coin', id, 'chart', currency, days] as const,
  simplePrices: (ids: string[]) => ['simple-prices', ids] as const,
  watchlist: (uid: string) => ['watchlist', uid] as const,
  transactions: (uid: string) => ['transactions', uid] as const,
}
