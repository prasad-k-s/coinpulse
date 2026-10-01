import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ChartRange } from '@/api/types'
import { ErrorState } from '@/components/common/ErrorState'
import { useMarketChart } from '@/hooks/useCoinQueries'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import type { Currency } from '@/types'

const RANGES: { value: ChartRange; label: string }[] = [
  { value: '1', label: '24H' },
  { value: '7', label: '7D' },
  { value: '30', label: '1M' },
  { value: '365', label: '1Y' },
]

interface PriceChartProps {
  coinId: string
  currency: Currency
}

export function PriceChart({ coinId, currency }: PriceChartProps) {
  const theme = useTheme()
  const [range, setRange] = useState<ChartRange>('7')
  const { data, error, isPending, isFetching, refetch } = useMarketChart(coinId, currency, range)

  const isUp = data && data.length > 1 ? data[data.length - 1].price >= data[0].price : true
  const color = isUp ? theme.palette.success.main : theme.palette.error.main

  const formatTime = (time: number) =>
    new Date(time).toLocaleString(
      'en-IN',
      range === '1' ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' },
    )

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 2,
          }}
        >
          <Typography variant="h6">Price chart</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={range}
            onChange={(_e, value: ChartRange | null) => value && setRange(value)}
            aria-label="Chart time range"
          >
            {RANGES.map((r) => (
              <ToggleButton key={r.value} value={r.value}>
                {r.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {isPending ? (
          <Skeleton variant="rounded" height={320} />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <Box sx={{ height: 320, opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  minTickGap={40}
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis
                  dataKey="price"
                  domain={['auto', 'auto']}
                  tickFormatter={(v: number) => formatCompactCurrency(v, currency)}
                  width={80}
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <Tooltip
                  labelFormatter={(label) => new Date(Number(label)).toLocaleString('en-IN')}
                  formatter={(value) => [formatCurrency(Number(value), currency), 'Price']}
                  contentStyle={{
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#priceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
