import type { MarketCoin } from '@/api/types'
import type { ChangeFilter } from '@/store/slices/marketFiltersSlice'

/** Filters coins by name/symbol search and by 24h price direction. */
export function filterCoins(
  coins: MarketCoin[],
  search: string,
  changeFilter: ChangeFilter,
): MarketCoin[] {
  const term = search.trim().toLowerCase()

  return coins.filter((coin) => {
    if (
      term &&
      !coin.name.toLowerCase().includes(term) &&
      !coin.symbol.toLowerCase().includes(term)
    ) {
      return false
    }
    const change = coin.price_change_percentage_24h ?? 0
    if (changeFilter === 'gainers') return change > 0
    if (changeFilter === 'losers') return change < 0
    return true
  })
}
