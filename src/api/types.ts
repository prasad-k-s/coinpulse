/** Shapes of the CoinGecko responses we use (only the fields the app needs). */

export interface MarketCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency?: number | null
}

export interface CoinDetail {
  id: string
  symbol: string
  name: string
  market_cap_rank: number | null
  image: { thumb: string; small: string; large: string }
  description: { en: string }
  links: { homepage: string[] }
  market_data: {
    current_price: Record<string, number>
    market_cap: Record<string, number>
    total_volume: Record<string, number>
    high_24h: Record<string, number>
    low_24h: Record<string, number>
    ath: Record<string, number>
    price_change_percentage_24h: number | null
    price_change_percentage_7d: number | null
    circulating_supply: number | null
    max_supply: number | null
  }
}

export interface MarketChart {
  /** [timestamp in ms, price] */
  prices: [number, number][]
}

/** Response of /simple/price: { bitcoin: { usd: 65000, inr: 5400000, usd_24h_change: 1.2 } } */
export type SimplePriceResponse = Record<string, Record<string, number>>

export type ChartRange = '1' | '7' | '30' | '365'
