import { Link as RouterLink } from 'react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function Logo() {
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <Box component="img" src="/favicon.svg" alt="" sx={{ width: 32, height: 32 }} />
      <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
        CoinPulse
      </Typography>
    </Box>
  )
}
