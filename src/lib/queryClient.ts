import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/coingecko'

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    // Rate limited: retry a few times with backoff. Other 4xx errors won't fix themselves.
    if (error.status === 429) return failureCount < 3
    if (error.status >= 400 && error.status < 500) return false
  }
  return failureCount < 2
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // CoinGecko data updates about once a minute on the free API
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      },
    },
  })
}
