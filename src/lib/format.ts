import type { Currency } from '@/types'

const LOCALES: Record<Currency, string> = {
  usd: 'en-US',
  inr: 'en-IN',
}

/** Formats a price. Small prices (e.g. 0.000123) keep more decimals so they stay readable. */
export function formatCurrency(value: number | null | undefined, currency: Currency): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const abs = Math.abs(value)
  const maximumFractionDigits = abs === 0 ? 2 : abs < 1 ? 6 : 2
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value)
}

/** Formats big numbers like market cap in compact form, e.g. $1.23T. */
export function formatCompactCurrency(
  value: number | null | undefined,
  currency: Currency,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency: currency.toUpperCase(),
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number | null | undefined, maximumFractionDigits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
}

/** CoinGecko descriptions contain HTML links; we only want plain text. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/** Today's date as yyyy-mm-dd in the user's local timezone (toISOString would use UTC). */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
