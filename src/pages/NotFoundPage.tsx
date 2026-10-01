import { Link as RouterLink } from 'react-router'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import Button from '@mui/material/Button'
import { EmptyState } from '@/components/common/EmptyState'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={<SearchOffIcon />}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={
        <Button variant="contained" component={RouterLink} to="/">
          Back to markets
        </Button>
      }
    />
  )
}
