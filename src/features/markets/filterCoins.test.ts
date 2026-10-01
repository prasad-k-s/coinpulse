import { mockCoins } from '@/test/fixtures/coins'
import { filterCoins } from './filterCoins'

describe('filterCoins', () => {
  it('matches name or symbol, ignoring case', () => {
    expect(filterCoins(mockCoins, 'ETH', 'all').map((c) => c.id)).toEqual(['ethereum'])
    expect(filterCoins(mockCoins, 'sol', 'all').map((c) => c.id)).toEqual(['solana'])
  })

  it('filters gainers and losers by 24h change', () => {
    expect(filterCoins(mockCoins, '', 'gainers').map((c) => c.id)).toEqual(['bitcoin', 'solana'])
    expect(filterCoins(mockCoins, '', 'losers').map((c) => c.id)).toEqual(['ethereum'])
  })

  it('returns everything with no filters', () => {
    expect(filterCoins(mockCoins, '  ', 'all')).toHaveLength(3)
  })
})
