import { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setChangeFilter, setSearch, type ChangeFilter } from '@/store/slices/marketFiltersSlice'

export function MarketFilters() {
  const dispatch = useAppDispatch()
  const { search, changeFilter } = useAppSelector((state) => state.marketFilters)

  // Typing updates local state instantly; Redux (and the table filter) updates after 300ms
  const [input, setInput] = useState(search)
  const debouncedInput = useDebounce(input, 300)

  useEffect(() => {
    dispatch(setSearch(debouncedInput))
  }, [debouncedInput, dispatch])

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search by name or symbol"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ flex: '1 1 260px', maxWidth: 420 }}
        slotProps={{
          htmlInput: { 'aria-label': 'Search coins' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <ToggleButtonGroup
        size="small"
        exclusive
        value={changeFilter}
        onChange={(_e, value: ChangeFilter | null) => value && dispatch(setChangeFilter(value))}
        aria-label="Filter by 24 hour change"
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="gainers">Gainers</ToggleButton>
        <ToggleButton value="losers">Losers</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
