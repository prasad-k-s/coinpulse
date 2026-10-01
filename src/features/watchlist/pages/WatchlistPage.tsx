import { Link as RouterLink, useNavigate } from 'react-router'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import { CoinLabel } from '@/components/common/CoinLabel'
import { hideOnMobile } from '@/components/common/responsive'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { PriceChange } from '@/components/common/PriceChange'
import { useMarketsByIds } from '@/hooks/useCoinQueries'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import { selectCurrency, useAppSelector } from '@/store/hooks'
import { useToggleWatchlist, useWatchlist } from '../useWatchlist'

export default function WatchlistPage() {
  const navigate = useNavigate()
  const currency = useAppSelector(selectCurrency)
  const watchlist = useWatchlist()
  const ids = watchlist.data ?? []
  const markets = useMarketsByIds(currency, ids)
  const toggle = useToggleWatchlist()

  // Keep the user's order (newest first) and hide coins removed optimistically
  const coins = ids
    .map((id) => markets.data?.find((coin) => coin.id === id))
    .filter((coin) => coin !== undefined)

  const loading = watchlist.isPending || (ids.length > 0 && markets.isPending)
  const error = watchlist.error ?? markets.error

  return (
    <>
      <PageHeader title="Watchlist" subtitle="Coins you're keeping an eye on." />

      {loading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            watchlist.refetch()
            markets.refetch()
          }}
        />
      ) : ids.length === 0 ? (
        <EmptyState
          icon={<StarBorderIcon />}
          title="Your watchlist is empty"
          description="Open any coin and press 'Add to watchlist' to track it here."
          action={
            <Button variant="contained" component={RouterLink} to="/">
              Browse markets
            </Button>
          }
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="Watchlist" sx={{ minWidth: { sm: 650 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Coin</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">24h</TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    7d
                  </TableCell>
                  <TableCell align="right" sx={hideOnMobile}>
                    Market cap
                  </TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {coins.map((coin) => (
                  <TableRow
                    key={coin.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/coin/${coin.id}`)}
                  >
                    <TableCell>
                      <CoinLabel name={coin.name} symbol={coin.symbol} image={coin.image} />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(coin.current_price, currency)}
                    </TableCell>
                    <TableCell align="right">
                      <PriceChange value={coin.price_change_percentage_24h} />
                    </TableCell>
                    <TableCell align="right" sx={hideOnMobile}>
                      <PriceChange value={coin.price_change_percentage_7d_in_currency} />
                    </TableCell>
                    <TableCell align="right" sx={hideOnMobile}>
                      {formatCompactCurrency(coin.market_cap, currency)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove from watchlist">
                        <IconButton
                          aria-label={`Remove ${coin.name} from watchlist`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggle.mutate({ coinId: coin.id, watched: true })
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  )
}
