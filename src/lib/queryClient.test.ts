import { ApiError, NETWORK_ERROR_STATUS } from '@/api/coingecko'
import { retryDelay, shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it('retries rate limit errors up to 4 times', () => {
    const error = new ApiError(429, 'rate limited')
    expect(shouldRetry(0, error)).toBe(true)
    expect(shouldRetry(3, error)).toBe(true)
    expect(shouldRetry(4, error)).toBe(false)
  })

  it('retries network errors (blocked rate-limit responses)', () => {
    expect(shouldRetry(0, new ApiError(NETWORK_ERROR_STATUS, 'failed to fetch'))).toBe(true)
  })

  it('retries server errors', () => {
    expect(shouldRetry(1, new ApiError(503, 'unavailable'))).toBe(true)
  })

  it('does not retry other client errors', () => {
    expect(shouldRetry(0, new ApiError(404, 'not found'))).toBe(false)
  })
})

describe('retryDelay', () => {
  it('backs off exponentially and caps at 30 seconds', () => {
    expect(retryDelay(0)).toBe(2000)
    expect(retryDelay(1)).toBe(4000)
    expect(retryDelay(10)).toBe(30_000)
  })
})
