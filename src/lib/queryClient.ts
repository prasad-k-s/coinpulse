import { QueryClient } from '@tanstack/react-query'
import { ApiError, NETWORK_ERROR_STATUS } from '@/api/coingecko'

/** Temporary errors worth retrying: rate limits, network failures and server errors. */
export function isTemporaryError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true
  return error.status === 429 || error.status === NETWORK_ERROR_STATUS || error.status >= 500
}

export function shouldRetry(failureCount: number, error: unknown): boolean {
  // The free CoinGecko API allows a limited number of calls per minute, so keep
  // retrying temporary errors for about a minute. Other 4xx errors won't fix themselves.
  return isTemporaryError(error) && failureCount < 4
}

/** 2s, 4s, 8s, 16s... capped at 30s, so retries spread across the rate-limit window. */
export function retryDelay(attempt: number): number {
  return Math.min(2000 * 2 ** attempt, 30_000)
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prices are cached for 2 minutes to stay well inside CoinGecko's free rate limit
        staleTime: 2 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        retryDelay,
      },
    },
  })
}
