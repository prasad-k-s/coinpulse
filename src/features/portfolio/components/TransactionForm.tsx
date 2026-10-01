import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import type { MarketCoin } from '@/api/types'
import { FormTextField } from '@/components/form/FormTextField'
import { formatCurrency, formatNumber, todayIso } from '@/lib/format'
import { transactionSchema, type TransactionFormValues } from '../schema'

interface TransactionFormProps {
  /** Coins to choose from, with current USD prices */
  coins: MarketCoin[]
  /** How much of each coin the user holds right now (to stop overselling) */
  heldQuantities: Record<string, number>
  defaultCoinId?: string
  onSubmit: (values: TransactionFormValues) => Promise<void> | void
  onCancel?: () => void
}

export function TransactionForm({
  coins,
  heldQuantities,
  defaultCoinId = '',
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'buy',
      coinId: defaultCoinId,
      quantity: undefined,
      pricePerCoinUsd: undefined,
      date: todayIso(),
      notes: '',
    },
  })

  const [type, coinId, quantity, price] = useWatch({
    control,
    name: ['type', 'coinId', 'quantity', 'pricePerCoinUsd'],
  })
  const selectedCoin = coins.find((c) => c.id === coinId)
  const held = heldQuantities[coinId] ?? 0
  const total = Number(quantity) * Number(price)

  const submit = async (values: TransactionFormValues) => {
    // Cross-field rule that needs app data, so it lives here instead of the Zod schema
    if (values.type === 'sell' && values.quantity > held + 1e-12) {
      setError('quantity', {
        message: held > 0 ? `You only hold ${formatNumber(held, 8)}` : "You don't hold this coin",
      })
      return
    }
    await onSubmit(values)
  }

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit(submit)} noValidate>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <ToggleButtonGroup
            exclusive
            fullWidth
            color={field.value === 'buy' ? 'success' : 'error'}
            value={field.value}
            onChange={(_e, value: 'buy' | 'sell' | null) => value && field.onChange(value)}
            aria-label="Transaction type"
          >
            <ToggleButton value="buy">Buy</ToggleButton>
            <ToggleButton value="sell">Sell</ToggleButton>
          </ToggleButtonGroup>
        )}
      />

      <Controller
        name="coinId"
        control={control}
        render={({ field, fieldState }) => (
          <Autocomplete
            options={coins}
            value={coins.find((c) => c.id === field.value) ?? null}
            onChange={(_e, coin) => field.onChange(coin?.id ?? '')}
            onBlur={field.onBlur}
            getOptionLabel={(coin) => `${coin.name} (${coin.symbol.toUpperCase()})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, coin) => {
              const { key, ...optionProps } = props
              return (
                <li key={key} {...optionProps}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={coin.image} alt="" sx={{ width: 24, height: 24 }} />
                    {coin.name}
                    <Typography
                      component="span"
                      color="text.secondary"
                      sx={{ textTransform: 'uppercase' }}
                    >
                      {coin.symbol}
                    </Typography>
                  </Box>
                </li>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Coin"
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                helperText={
                  fieldState.error?.message ??
                  (type === 'sell' && coinId ? `You hold ${formatNumber(held, 8)}` : undefined)
                }
              />
            )}
          />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <FormTextField
          name="quantity"
          control={control}
          label="Quantity"
          type="number"
          slotProps={{ htmlInput: { step: 'any', min: 0 } }}
        />
        <FormTextField
          name="pricePerCoinUsd"
          control={control}
          label="Price per coin (USD)"
          type="number"
          slotProps={{ htmlInput: { step: 'any', min: 0 } }}
          helperText={
            selectedCoin?.current_price ? (
              <Button
                size="small"
                sx={{ p: 0, minWidth: 0 }}
                onClick={() =>
                  setValue('pricePerCoinUsd', selectedCoin.current_price ?? 0, {
                    shouldValidate: true,
                  })
                }
              >
                Use current price ({formatCurrency(selectedCoin.current_price, 'usd')})
              </Button>
            ) : undefined
          }
        />
      </Box>

      <FormTextField
        name="date"
        control={control}
        label="Date"
        type="date"
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayIso() } }}
      />

      <FormTextField
        name="notes"
        control={control}
        label="Notes (optional)"
        multiline
        minRows={2}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}
      >
        <Typography color="text.secondary">
          Total {type === 'buy' ? 'spent' : 'received'}
        </Typography>
        <Typography variant="h6" component="p" data-testid="transaction-total">
          {Number.isFinite(total) ? formatCurrency(total, 'usd') : '—'}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {onCancel && (
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save transaction'}
        </Button>
      </Stack>
    </Stack>
  )
}
