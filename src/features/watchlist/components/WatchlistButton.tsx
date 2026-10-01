import { Link as RouterLink } from 'react-router'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Button from '@mui/material/Button'
import { selectUser, useAppSelector } from '@/store/hooks'
import { useToggleWatchlist, useWatchlist } from '../useWatchlist'

export function WatchlistButton({ coinId }: { coinId: string }) {
  const user = useAppSelector(selectUser)
  const { data: watchlist = [] } = useWatchlist()
  const toggle = useToggleWatchlist()

  if (!user) {
    return (
      <Button variant="outlined" startIcon={<StarBorderIcon />} component={RouterLink} to="/login">
        Log in to watch
      </Button>
    )
  }

  const watched = watchlist.includes(coinId)

  return (
    <Button
      variant={watched ? 'contained' : 'outlined'}
      startIcon={watched ? <StarIcon /> : <StarBorderIcon />}
      onClick={() => toggle.mutate({ coinId, watched })}
      aria-pressed={watched}
    >
      {watched ? 'Watching' : 'Add to watchlist'}
    </Button>
  )
}
