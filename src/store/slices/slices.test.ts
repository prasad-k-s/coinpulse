import authReducer, { userSignedIn, userSignedOut } from './authSlice'
import marketFiltersReducer, {
  resetFilters,
  setChangeFilter,
  setScrollOffset,
  setSearch,
  setSorting,
} from './marketFiltersSlice'
import settingsReducer, {
  loadSettings,
  saveSettings,
  setCurrency,
  SETTINGS_STORAGE_KEY,
  toggleThemeMode,
} from './settingsSlice'
import { testUser } from '@/test/utils'

describe('settingsSlice', () => {
  it('toggles the theme', () => {
    const state = settingsReducer({ themeMode: 'light', currency: 'usd' }, toggleThemeMode())
    expect(state.themeMode).toBe('dark')
  })

  it('changes the currency', () => {
    const state = settingsReducer({ themeMode: 'light', currency: 'usd' }, setCurrency('inr'))
    expect(state.currency).toBe('inr')
  })

  it('saves to and loads from localStorage', () => {
    saveSettings({ themeMode: 'dark', currency: 'inr' })
    expect(loadSettings()).toEqual({ themeMode: 'dark', currency: 'inr' })
  })

  it('ignores invalid saved values', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ currency: 'eur' }))
    expect(loadSettings().currency).toBe('usd')
  })
})

describe('authSlice', () => {
  it('stores the user on sign in and clears it on sign out', () => {
    let state = authReducer(undefined, userSignedIn(testUser))
    expect(state).toEqual({ user: testUser, status: 'authenticated' })

    state = authReducer(state, userSignedOut())
    expect(state).toEqual({ user: null, status: 'unauthenticated' })
  })
})

describe('marketFiltersSlice', () => {
  it('updates and resets filters', () => {
    let state = marketFiltersReducer(undefined, setSearch('btc'))
    state = marketFiltersReducer(state, setChangeFilter('gainers'))
    expect(state).toMatchObject({ search: 'btc', changeFilter: 'gainers' })

    expect(marketFiltersReducer(state, resetFilters())).toEqual({
      search: '',
      changeFilter: 'all',
      sorting: [],
      scrollOffset: 0,
    })
  })

  it('keeps the scroll position unless the list changes', () => {
    let state = marketFiltersReducer(undefined, setScrollOffset(1200))
    // Same search again (e.g. the search box re-syncing on mount) keeps the position
    state = marketFiltersReducer(state, setSearch(''))
    expect(state.scrollOffset).toBe(1200)

    // A new search, filter or sort starts from the top
    state = marketFiltersReducer(state, setSearch('sol'))
    expect(state.scrollOffset).toBe(0)
    state = marketFiltersReducer(state, setScrollOffset(500))
    state = marketFiltersReducer(state, setSorting([{ id: 'current_price', desc: true }]))
    expect(state.scrollOffset).toBe(0)
  })
})
