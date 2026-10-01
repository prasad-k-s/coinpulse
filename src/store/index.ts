import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import marketFiltersReducer from './slices/marketFiltersSlice'
import settingsReducer, { loadSettings, saveSettings } from './slices/settingsSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  marketFilters: marketFiltersReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

/** The real app store: settings are restored from and saved to localStorage. */
export function createAppStore() {
  const store = setupStore({ settings: loadSettings() })
  let lastSettings = store.getState().settings
  store.subscribe(() => {
    const { settings } = store.getState()
    if (settings !== lastSettings) {
      lastSettings = settings
      saveSettings(settings)
    }
  })
  return store
}
