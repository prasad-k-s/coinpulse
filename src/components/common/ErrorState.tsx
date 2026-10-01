import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  )
}
