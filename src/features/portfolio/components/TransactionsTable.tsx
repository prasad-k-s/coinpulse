import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { CoinLabel } from '@/components/common/CoinLabel'
import { hideOnMobile } from '@/components/common/responsive'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { Transaction } from '../types'

interface TransactionsTableProps {
  transactions: Transaction[]
  onDelete: (transaction: Transaction) => void
}

/** Transaction prices are shown in USD because that's the currency they were entered in. */
export function TransactionsTable({ transactions, onDelete }: TransactionsTableProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Transaction history
        </Typography>
        <TableContainer>
          <Table size="small" aria-label="Transactions" sx={{ minWidth: { sm: 640 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Coin</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right" sx={hideOnMobile}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={hideOnMobile}>
                  Price (USD)
                </TableCell>
                <TableCell align="right">Total (USD)</TableCell>
                <TableCell sx={hideOnMobile}>Notes</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(t.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </TableCell>
                  <TableCell>
                    <CoinLabel name={t.coinName} symbol={t.symbol} image={t.image} size={24} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t.type === 'buy' ? 'Buy' : 'Sell'}
                      color={t.type === 'buy' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    {formatNumber(t.quantity, 8)}
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    {formatCurrency(t.pricePerCoinUsd, 'usd')}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(t.quantity * t.pricePerCoinUsd, 'usd')}
                    {/* On phones the quantity column is hidden, so show it under the total */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: 'block', sm: 'none' } }}
                    >
                      {formatNumber(t.quantity, 8)} {t.symbol.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...hideOnMobile, maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={t.notes}>
                      {t.notes || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete transaction">
                      <IconButton
                        size="small"
                        aria-label={`Delete ${t.type} of ${t.coinName} on ${t.date}`}
                        onClick={() => onDelete(t)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
