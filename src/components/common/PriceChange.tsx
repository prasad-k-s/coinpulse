import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import Box from '@mui/material/Box'
import { formatPercent } from '@/lib/format'

interface PriceChangeProps {
  value: number | null | undefined
}

/** Green/red percentage with an arrow. The arrow and sign mean colour isn't the only signal. */
export function PriceChange({ value }: PriceChangeProps) {
  if (value === null || value === undefined) return <span>—</span>
  const positive = value >= 0
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        color: positive ? 'success.main' : 'error.main',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {positive ? (
        <ArrowDropUpIcon fontSize="small" aria-hidden />
      ) : (
        <ArrowDropDownIcon fontSize="small" aria-hidden />
      )}
      {formatPercent(value)}
    </Box>
  )
}
