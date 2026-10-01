import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { AllocationChart } from '../components/AllocationChart'
import { HoldingsTable } from '../components/HoldingsTable'
import { SummaryCards } from '../components/SummaryCards'
import { TransactionsTable } from '../components/TransactionsTable'
import { usePortfolio } from '../usePortfolio'
import { useDeleteTransaction } from '../useTransactions'
import type { Transaction } from '../types'

export default function PortfolioPage() {
  const { transactions, holdings, summary, convert, displayCurrency, isLoading, error, refetch } =
    usePortfolio()
  const deleteTransaction = useDeleteTransaction()
  const [toDelete, setToDelete] = useState<Transaction | null>(null)
  const [snackbar, setSnackbar] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    deleteTransaction.mutate(toDelete.id, {
      onSuccess: () => setSnackbar({ message: 'Transaction deleted', severity: 'success' }),
      onError: () =>
        setSnackbar({ message: 'Could not delete the transaction', severity: 'error' }),
    })
    setToDelete(null)
  }

  const addButton = (
    <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/portfolio/add">
      Add transaction
    </Button>
  )

  return (
    <>
      <PageHeader title="Portfolio" subtitle="Your holdings, profit and loss." action={addButton} />

      {isLoading ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={110} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={320} />
        </>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<AccountBalanceWalletIcon />}
          title="No transactions yet"
          description="Add your first buy to start tracking your portfolio value and profit."
          action={addButton}
        />
      ) : (
        <>
          <SummaryCards summary={summary} currency={displayCurrency} convert={convert} />

          {holdings.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              <HoldingsTable holdings={holdings} currency={displayCurrency} convert={convert} />
              <AllocationChart holdings={holdings} />
            </Box>
          )}

          <TransactionsTable transactions={transactions} onDelete={setToDelete} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete transaction?"
        message={
          toDelete
            ? `This will remove the ${toDelete.type} of ${toDelete.quantity} ${toDelete.symbol.toUpperCase()} from your history.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}
