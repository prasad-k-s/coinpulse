import { isRouteErrorResponse, Link as RouterLink, useRouteError } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

/** Shown by React Router when a route throws (render error or failed lazy chunk). */
export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button variant="contained" component={RouterLink} to="/">
          Go to markets
        </Button>
      </Box>
    </Box>
  )
}
