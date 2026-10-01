import { useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { useMarketsByIds, useMarketsInfinite } from '@/hooks/useCoinQueries'
import { getHeldQuantities } from '../holdings'
import { TransactionForm } from '../components/TransactionForm'
import type { TransactionFormValues } from '../schema'
import { useAddTransaction, useTransactions } from '../useTransactions'

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCoinId = searchParams.get('coin') ?? ''
  const [error, setError] = useState<string | null>(null)

  // Prices for the form are always USD (transactions are stored in USD)
  const markets = useMarketsInfinite('usd')
  const transactions = useTransactions()
  const addTransaction = useAddTransaction()

  const topCoins = useMemo(() => markets.data?.pages[0] ?? [], [markets.data])
  // The coin chosen on a coin page might not be in the top 250, so fetch it separately if needed
  const needsExtraCoin =
    Boolean(preselectedCoinId) &&
    !markets.isPending &&
    !topCoins.some((c) => c.id === preselectedCoinId)
  const extraCoin = useMarketsByIds('usd', needsExtraCoin ? [preselectedCoinId] : [])

  const coins = useMemo(() => {
    const extra = (extraCoin.data ?? []).filter((c) => !topCoins.some((t) => t.id === c.id))
    return [...extra, ...topCoins]
  }, [extraCoin.data, topCoins])

  const heldQuantities = useMemo(
    () => getHeldQuantities(transactions.data ?? []),
    [transactions.data],
  )

  const handleSubmit = async (values: TransactionFormValues) => {
    const coin = coins.find((c) => c.id === values.coinId)
    if (!coin) return
    setError(null)
    try {
      await addTransaction.mutateAsync({
        coinId: coin.id,
        coinName: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        type: values.type,
        quantity: values.quantity,
        pricePerCoinUsd: values.pricePerCoinUsd,
        date: values.date,
        notes: values.notes,
      })
      navigate('/portfolio')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the transaction.')
    }
  }

  const loading =
    markets.isPending || transactions.isPending || (needsExtraCoin && extraCoin.isPending)

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Button component={RouterLink} to="/portfolio" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Portfolio
      </Button>
      <PageHeader
        title="Add transaction"
        subtitle="Record a buy or sell to update your portfolio."
      />
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {markets.error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Couldn&apos;t load the coin list: {markets.error.message}
            </Alert>
          )}
          {loading ? (
            <Skeleton variant="rounded" height={420} />
          ) : (
            <TransactionForm
              coins={coins}
              heldQuantities={heldQuantities}
              defaultCoinId={preselectedCoinId}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
