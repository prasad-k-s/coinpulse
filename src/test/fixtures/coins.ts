import type { MarketCoin } from '@/api/types'

export const bitcoin: MarketCoin = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  current_price: 60000,
  market_cap: 1_200_000_000_000,
  market_cap_rank: 1,
  total_volume: 30_000_000_000,
  high_24h: 61000,
  low_24h: 59000,
  price_change_percentage_24h: 2.5,
  price_change_percentage_7d_in_currency: 5.1,
}

export const ethereum: MarketCoin = {
  id: 'ethereum',
  symbol: 'eth',
  name: 'Ethereum',
  image: 'https://example.com/eth.png',
  current_price: 3000,
  market_cap: 360_000_000_000,
  market_cap_rank: 2,
  total_volume: 15_000_000_000,
  high_24h: 3100,
  low_24h: 2900,
  price_change_percentage_24h: -1.2,
  price_change_percentage_7d_in_currency: -3.4,
}

export const solana: MarketCoin = {
  id: 'solana',
  symbol: 'sol',
  name: 'Solana',
  image: 'https://example.com/sol.png',
  current_price: 150,
  market_cap: 70_000_000_000,
  market_cap_rank: 5,
  total_volume: 3_000_000_000,
  high_24h: 155,
  low_24h: 145,
  price_change_percentage_24h: 4.2,
  price_change_percentage_7d_in_currency: 10.3,
}

export const mockCoins: MarketCoin[] = [bitcoin, ethereum, solana]
