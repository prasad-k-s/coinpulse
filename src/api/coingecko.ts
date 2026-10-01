import type { Currency } from '@/types'
import type { ChartRange, CoinDetail, MarketChart, MarketCoin, SimplePriceResponse } from './types'

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
export const MARKETS_PAGE_SIZE = 250

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Status used when the request never got a readable response (network error / blocked 429). */
export const NETWORK_ERROR_STATUS = 0
export const RATE_LIMIT_MESSAGE =
  "CoinGecko's free API is busy right now. Retrying automatically, please wait a few seconds."

type QueryParams = Record<string, string | number | boolean | undefined>

export function buildUrl(path: string, params: QueryParams = {}): string {
  const url = new URL(`${COINGECKO_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  // Optional free demo key. Sent as a query param so the browser doesn't need a CORS preflight.
  const apiKey = import.meta.env.VITE_COINGECKO_API_KEY
  if (apiKey) url.searchParams.set('x_cg_demo_api_key', apiKey)
  return url.toString()
}

/** Small typed wrapper around fetch for the CoinGecko REST API. */
export async function cgFetch<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      headers: { accept: 'application/json' },
      signal,
    })
  } catch (error) {
    // Cancelled by React Query (e.g. the user navigated away): let it through untouched
    if (signal?.aborted) throw error
    // CoinGecko's rate-limit (429) responses have no CORS headers, so the browser can't read
    // them and fetch just fails with "Failed to fetch". Treat it as a temporary error.
    throw new ApiError(NETWORK_ERROR_STATUS, RATE_LIMIT_MESSAGE)
  }

  if (!response.ok) {
    const message =
      response.status === 429 ? RATE_LIMIT_MESSAGE : `CoinGecko request failed (${response.status})`
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

export const coingeckoApi = {
  getMarkets(
    {
      currency,
      page = 1,
      perPage = MARKETS_PAGE_SIZE,
      ids,
    }: { currency: Currency; page?: number; perPage?: number; ids?: string[] },
    signal?: AbortSignal,
  ) {
    return cgFetch<MarketCoin[]>(
      '/coins/markets',
      {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: perPage,
        page,
        ids: ids?.join(','),
        price_change_percentage: '24h,7d',
      },
      signal,
    )
  },

  getCoin(id: string, signal?: AbortSignal) {
    return cgFetch<CoinDetail>(
      `/coins/${encodeURIComponent(id)}`,
      {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
      signal,
    )
  },

  getMarketChart(id: string, currency: Currency, days: ChartRange, signal?: AbortSignal) {
    return cgFetch<MarketChart>(
      `/coins/${encodeURIComponent(id)}/market_chart`,
      { vs_currency: currency, days },
      signal,
    )
  },

  getSimplePrices(ids: string[], signal?: AbortSignal) {
    return cgFetch<SimplePriceResponse>(
      '/simple/price',
      { ids: ids.join(','), vs_currencies: 'usd,inr', include_24hr_change: true },
      signal,
    )
  },
}
