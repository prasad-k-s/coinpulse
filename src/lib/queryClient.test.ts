import { ApiError } from '@/api/coingecko'
import { shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it('retries rate limit errors up to 3 times', () => {
    const error = new ApiError(429, 'rate limited')
    expect(shouldRetry(0, error)).toBe(true)
    expect(shouldRetry(3, error)).toBe(false)
  })

  it('does not retry other client errors', () => {
    expect(shouldRetry(0, new ApiError(404, 'not found'))).toBe(false)
  })

  it('retries network/server errors twice', () => {
    expect(shouldRetry(1, new Error('network'))).toBe(true)
    expect(shouldRetry(2, new Error('network'))).toBe(false)
  })
})
