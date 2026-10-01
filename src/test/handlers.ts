import { http, HttpResponse } from 'msw'
import { COINGECKO_BASE_URL } from '@/api/coingecko'
import { mockCoins } from './fixtures/coins'

/** Default API mocks used by every test. Override per test with server.use(...). */
export const handlers = [
  http.get(`${COINGECKO_BASE_URL}/coins/markets`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const ids = url.searchParams.get('ids')
    if (ids) {
      const wanted = ids.split(',')
      return HttpResponse.json(mockCoins.filter((c) => wanted.includes(c.id)))
    }
    return HttpResponse.json(page === 1 ? mockCoins : [])
  }),

  http.get(`${COINGECKO_BASE_URL}/simple/price`, () =>
    HttpResponse.json({
      bitcoin: { usd: 60000, inr: 5_000_000, usd_24h_change: 2.5 },
      ethereum: { usd: 3000, inr: 250_000, usd_24h_change: -1.2 },
    }),
  ),
]
