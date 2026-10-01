import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { formatCurrency, formatPercent } from '@/lib/format'
import type { Currency } from '@/types'
import type { PortfolioSummary } from '../types'

interface SummaryCardsProps {
  summary: PortfolioSummary
  currency: Currency
  convert: (usd: number) => number
}

function signColor(value: number) {
  if (value > 0) return 'success.main'
  if (value < 0) return 'error.main'
  return 'text.primary'
}

export function SummaryCards({ summary, currency, convert }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total value',
      value: formatCurrency(convert(summary.totalValueUsd), currency),
      color: 'text.primary',
    },
    {
      label: '24h change',
      value: formatCurrency(convert(summary.change24hUsd), currency),
      color: signColor(summary.change24hUsd),
    },
    {
      label: 'Total profit / loss',
      value: formatCurrency(convert(summary.unrealizedPnlUsd), currency),
      helper: formatPercent(summary.unrealizedPnlPercent),
      color: signColor(summary.unrealizedPnlUsd),
    },
    {
      label: 'Realized profit / loss',
      value: formatCurrency(convert(summary.realizedPnlUsd), currency),
      helper: 'From coins you sold',
      color: signColor(summary.realizedPnlUsd),
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {card.label}
            </Typography>
            <Typography variant="h5" component="p" sx={{ color: card.color }}>
              {card.value}
            </Typography>
            {card.helper && (
              <Typography variant="body2" color="text.secondary">
                {card.helper}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
