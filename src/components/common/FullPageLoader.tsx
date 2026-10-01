import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export function FullPageLoader() {
  return (
    <Box
      role="status"
      aria-label="Loading"
      sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}
    >
      <CircularProgress />
    </Box>
  )
}
