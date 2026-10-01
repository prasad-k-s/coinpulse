import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Currency, ThemeMode } from '@/types'

export interface SettingsState {
  themeMode: ThemeMode
  currency: Currency
}

export const SETTINGS_STORAGE_KEY = 'coinpulse:settings'

function getSystemTheme(): ThemeMode {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

/** Reads saved settings from localStorage, falling back to sensible defaults. */
export function loadSettings(): SettingsState {
  const defaults: SettingsState = { themeMode: getSystemTheme(), currency: 'usd' }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaults
    const saved = JSON.parse(raw) as Partial<SettingsState>
    return {
      themeMode:
        saved.themeMode === 'dark' || saved.themeMode === 'light'
          ? saved.themeMode
          : defaults.themeMode,
      currency:
        saved.currency === 'inr' || saved.currency === 'usd' ? saved.currency : defaults.currency,
    }
  } catch {
    return defaults
  }
}

export function saveSettings(state: SettingsState) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode). Settings then just won't persist.
  }
}

const initialState: SettingsState = { themeMode: 'light', currency: 'usd' }

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload
    },
    setCurrency(state, action: PayloadAction<Currency>) {
      state.currency = action.payload
    },
  },
})

export const { toggleThemeMode, setThemeMode, setCurrency } = settingsSlice.actions
export default settingsSlice.reducer
