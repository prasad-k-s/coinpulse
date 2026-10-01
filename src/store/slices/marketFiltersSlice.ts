import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ChangeFilter = 'all' | 'gainers' | 'losers'

/** Same shape as TanStack Table's SortingState (kept serialisable for Redux). */
export type MarketSorting = { id: string; desc: boolean }[]

export interface MarketFiltersState {
  search: string
  changeFilter: ChangeFilter
  sorting: MarketSorting
  /** Scroll position of the markets table, restored when the user comes back from a coin page */
  scrollOffset: number
}

const initialState: MarketFiltersState = {
  search: '',
  changeFilter: 'all',
  sorting: [],
  scrollOffset: 0,
}

/**
 * Lives in Redux (not component state) so the filters, sorting and scroll position
 * are kept when the user opens a coin and comes back to the markets table.
 */
const marketFiltersSlice = createSlice({
  name: 'marketFilters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      if (state.search === action.payload) return
      state.search = action.payload
      state.scrollOffset = 0 // a different result list starts at the top
    },
    setChangeFilter(state, action: PayloadAction<ChangeFilter>) {
      if (state.changeFilter === action.payload) return
      state.changeFilter = action.payload
      state.scrollOffset = 0
    },
    setSorting(state, action: PayloadAction<MarketSorting>) {
      state.sorting = action.payload
      state.scrollOffset = 0
    },
    setScrollOffset(state, action: PayloadAction<number>) {
      state.scrollOffset = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setSearch, setChangeFilter, setSorting, setScrollOffset, resetFilters } =
  marketFiltersSlice.actions
export default marketFiltersSlice.reducer
