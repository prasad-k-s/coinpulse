import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { ApiError, buildUrl, COINGECKO_BASE_URL, coingeckoApi } from './coingecko'

describe('buildUrl', () => {
  it('adds query params and skips empty ones', () => {
    const url = new URL(buildUrl('/coins/markets', { vs_currency: 'usd', page: 2, ids: undefined }))
    expect(url.pathname).toBe('/api/v3/coins/markets')
    expect(url.searchParams.get('vs_currency')).toBe('usd')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.has('ids')).toBe(false)
  })
})

describe('coingeckoApi', () => {
  it('returns market data', async () => {
    const coins = await coingeckoApi.getMarkets({ currency: 'usd' })
    expect(coins[0].id).toBe('bitcoin')
  })

  it('throws an ApiError with a friendly message when rate limited', async () => {
    server.use(
      http.get(
        `${COINGECKO_BASE_URL}/coins/markets`,
        () => new HttpResponse(null, { status: 429 }),
      ),
    )

    const promise = coingeckoApi.getMarkets({ currency: 'usd' })
    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({
      status: 429,
      message: expect.stringMatching(/too many requests/i),
    })
  })
})
