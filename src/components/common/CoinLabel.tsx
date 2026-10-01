import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface CoinLabelProps {
  name: string
  symbol: string
  image?: string
  size?: number
}

export function CoinLabel({ name, symbol, image, size = 28 }: CoinLabelProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Avatar
        src={image}
        alt=""
        sx={{ width: size, height: size }}
        slotProps={{ img: { loading: 'lazy' } }}
      >
        {symbol.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={600} noWrap>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {symbol}
        </Typography>
      </Box>
    </Box>
  )
}
