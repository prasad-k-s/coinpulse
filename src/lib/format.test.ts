import { formatCompactCurrency, formatCurrency, formatPercent, stripHtml } from './format'

describe('formatCurrency', () => {
  it('formats USD with 2 decimals', () => {
    expect(formatCurrency(1234.5, 'usd')).toBe('$1,234.50')
  })

  it('formats INR with Indian digit grouping', () => {
    expect(formatCurrency(1234567, 'inr')).toBe('₹12,34,567.00')
  })

  it('keeps more decimals for prices below 1', () => {
    expect(formatCurrency(0.000123, 'usd')).toBe('$0.000123')
  })

  it('shows a dash for missing values', () => {
    expect(formatCurrency(null, 'usd')).toBe('—')
    expect(formatCurrency(undefined, 'usd')).toBe('—')
  })
})

describe('formatCompactCurrency', () => {
  it('uses compact notation for large numbers', () => {
    expect(formatCompactCurrency(1_230_000_000_000, 'usd')).toBe('$1.23T')
  })
})

describe('formatPercent', () => {
  it('adds a plus sign to positive values', () => {
    expect(formatPercent(2.345)).toBe('+2.35%')
  })

  it('keeps the minus sign for negative values', () => {
    expect(formatPercent(-1.2)).toBe('-1.20%')
  })
})

describe('stripHtml', () => {
  it('removes tags but keeps the text', () => {
    expect(stripHtml('Read <a href="https://bitcoin.org">the whitepaper</a>.')).toBe(
      'Read the whitepaper.',
    )
  })
})
