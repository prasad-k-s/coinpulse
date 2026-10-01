import { Link as RouterLink, useParams } from 'react-router'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ApiError } from '@/api/coingecko'
import { ErrorState } from '@/components/common/ErrorState'
import { PriceChange } from '@/components/common/PriceChange'
import { WatchlistButton } from '@/features/watchlist/components/WatchlistButton'
import { useCoin } from '@/hooks/useCoinQueries'
import { formatCompactCurrency, formatCurrency, formatNumber, stripHtml } from '@/lib/format'
import { selectCurrency, useAppSelector } from '@/store/hooks'
import NotFoundPage from '@/pages/NotFoundPage'
import { PriceChart } from '../components/PriceChart'
import { StatCard } from '../components/StatCard'

export default function CoinDetailPage() {
  const { coinId = '' } = useParams()
  const currency = useAppSelector(selectCurrency)
  const { data: coin, error, isPending, refetch } = useCoin(coinId)

  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />

  const backLink = (
    <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Markets
    </Button>
  )

  if (isPending) {
    return (
      <>
        {backLink}
        <Skeleton variant="rounded" height={80} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={380} />
      </>
    )
  }

  if (error || !coin) {
    return (
      <>
        {backLink}
        <ErrorState error={error} onRetry={() => refetch()} />
      </>
    )
  }

  const md = coin.market_data
  const description = stripHtml(coin.description.en ?? '')
  const homepage = coin.links.homepage.find(Boolean)

  const stats = [
    { label: 'Market cap', value: formatCompactCurrency(md.market_cap[currency], currency) },
    { label: 'Volume (24h)', value: formatCompactCurrency(md.total_volume[currency], currency) },
    { label: '24h high', value: formatCurrency(md.high_24h[currency], currency) },
    { label: '24h low', value: formatCurrency(md.low_24h[currency], currency) },
    { label: 'All-time high', value: formatCurrency(md.ath[currency], currency) },
    {
      label: 'Circulating supply',
      value: `${formatNumber(md.circulating_supply, 0)} ${coin.symbol.toUpperCase()}`,
    },
  ]

  return (
    <>
      {backLink}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            src={coin.image.large}
            alt=""
            sx={{ width: { xs: 44, sm: 56 }, height: { xs: 44, sm: 56 } }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" component="h1">
                {coin.name}
              </Typography>
              <Chip size="small" label={coin.symbol.toUpperCase()} />
              {coin.market_cap_rank && (
                <Chip size="small" variant="outlined" label={`#${coin.market_cap_rank}`} />
              )}
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" component="p">
                {formatCurrency(md.current_price[currency], currency)}
              </Typography>
              <PriceChange value={md.price_change_percentage_24h} />
            </Stack>
          </Box>
        </Stack>

        {/* Buttons sit side by side on desktop and stack full-width on phones */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' }, '& > *': { width: { xs: '100%', sm: 'auto' } } }}
        >
          <WatchlistButton coinId={coin.id} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/portfolio/add?coin=${encodeURIComponent(coin.id)}`}
          >
            Add transaction
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <PriceChart coinId={coin.id} currency={currency} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </Box>

      {description && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              About {coin.name}
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {description}
            </Typography>
            {homepage && (
              <Link
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-block', mt: 2 }}
              >
                Official website
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
