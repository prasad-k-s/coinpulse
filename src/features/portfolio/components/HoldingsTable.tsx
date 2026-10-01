import { useNavigate } from 'react-router'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { CoinLabel } from '@/components/common/CoinLabel'
import { hideOnMobile } from '@/components/common/responsive'
import { PriceChange } from '@/components/common/PriceChange'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import type { Currency } from '@/types'
import type { HoldingWithValue } from '../types'

interface HoldingsTableProps {
  holdings: HoldingWithValue[]
  currency: Currency
  convert: (usd: number) => number
}

export function HoldingsTable({ holdings, currency, convert }: HoldingsTableProps) {
  const navigate = useNavigate()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Holdings
        </Typography>
        <TableContainer>
          <Table size="small" aria-label="Holdings" sx={{ minWidth: { sm: 640 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Coin</TableCell>
                <TableCell align="right" sx={hideOnMobile}>
                  Price
                </TableCell>
                <TableCell align="right" sx={hideOnMobile}>
                  24h
                </TableCell>
                <TableCell align="right">Holdings</TableCell>
                <TableCell align="right" sx={hideOnMobile}>
                  Avg. buy price
                </TableCell>
                <TableCell align="right">Profit / loss</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holdings.map((h) => (
                <TableRow
                  key={h.coinId}
                  hover
                  sx={{ cursor: 'pointer', '& td': { py: 1.5 } }}
                  onClick={() => navigate(`/coin/${h.coinId}`)}
                >
                  <TableCell>
                    <CoinLabel name={h.coinName} symbol={h.symbol} image={h.image} />
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    {formatCurrency(convert(h.currentPriceUsd), currency)}
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    <PriceChange value={h.change24h} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {formatCurrency(convert(h.valueUsd), currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatNumber(h.quantity, 8)} {h.symbol.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    {formatCurrency(convert(h.averageBuyPriceUsd), currency)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: h.unrealizedPnlUsd >= 0 ? 'success.main' : 'error.main' }}
                  >
                    <Typography fontWeight={600} color="inherit">
                      {formatCurrency(convert(h.unrealizedPnlUsd), currency)}
                    </Typography>
                    <Typography variant="caption" color="inherit">
                      {formatPercent(h.unrealizedPnlPercent)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
