import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { selectCurrency, useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCurrency } from '@/store/slices/settingsSlice'
import type { Currency } from '@/types'

export function CurrencySelect() {
  const currency = useAppSelector(selectCurrency)
  const dispatch = useAppDispatch()

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={currency}
      onChange={(_e, value: Currency | null) => value && dispatch(setCurrency(value))}
      aria-label="Display currency"
    >
      <ToggleButton value="usd" aria-label="US Dollar">
        USD
      </ToggleButton>
      <ToggleButton value="inr" aria-label="Indian Rupee">
        INR
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
