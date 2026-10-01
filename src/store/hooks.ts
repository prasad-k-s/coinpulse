import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

// Typed versions of the react-redux hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const selectCurrency = (state: RootState) => state.settings.currency
export const selectThemeMode = (state: RootState) => state.settings.themeMode
export const selectUser = (state: RootState) => state.auth.user
export const selectAuthStatus = (state: RootState) => state.auth.status
