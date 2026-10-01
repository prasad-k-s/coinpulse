import { useMemo } from 'react'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { useMarketsInfinite } from '@/hooks/useCoinQueries'
import { selectCurrency, useAppSelector } from '@/store/hooks'
import { filterCoins } from '../filterCoins'
import { MarketFilters } from '../components/MarketFilters'
import { MarketTable } from '../components/MarketTable'

export default function MarketsPage() {
  const currency = useAppSelector(selectCurrency)
  const { search, changeFilter } = useAppSelector((state) => state.marketFilters)
  const { data, error, isPending, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMarketsInfinite(currency)

  const allCoins = useMemo(() => data?.pages.flat() ?? [], [data])
  const coins = useMemo(
    () => filterCoins(allCoins, search, changeFilter),
    [allCoins, search, changeFilter],
  )

  // Only auto-load more pages while browsing the full list (avoids burst requests while filtering)
  const isFiltering = search.trim() !== '' || changeFilter !== 'all'

  return (
    <>
      <PageHeader
        title="Cryptocurrency prices"
        subtitle={
          allCoins.length > 0
            ? `Top ${allCoins.length.toLocaleString()} coins by market cap. Scroll to load more.`
            : 'Live prices by market cap'
        }
      />
      <MarketFilters />

      {isPending ? (
        <Paper variant="outlined" sx={{ p: 2 }} aria-label="Loading coins">
          <Stack spacing={1.5}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={40} />
            ))}
          </Stack>
        </Paper>
      ) : error && allCoins.length === 0 ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : coins.length === 0 ? (
        <EmptyState
          icon={<SearchOffIcon />}
          title="No coins found"
          description="Try a different search, or scroll the full list to load more coins."
        />
      ) : (
        <>
          {/* If a refresh or "load more" fails, keep showing the coins we already have */}
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          <MarketTable
            coins={coins}
            currency={currency}
            hasNextPage={hasNextPage && !isFiltering}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </>
      )}
    </>
  )
}
