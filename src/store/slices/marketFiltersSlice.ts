import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ChangeFilter = 'all' | 'gainers' | 'losers'

export interface MarketFiltersState {
  search: string
  changeFilter: ChangeFilter
}

const initialState: MarketFiltersState = {
  search: '',
  changeFilter: 'all',
}

/**
 * Lives in Redux (not component state) so the filters are kept when the user
 * opens a coin and comes back to the markets table.
 */
const marketFiltersSlice = createSlice({
  name: 'marketFilters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setChangeFilter(state, action: PayloadAction<ChangeFilter>) {
      state.changeFilter = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setSearch, setChangeFilter, resetFilters } = marketFiltersSlice.actions
export default marketFiltersSlice.reducer
