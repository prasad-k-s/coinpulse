import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppUser } from '@/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  user: AppUser | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: 'loading', // until Firebase tells us whether a session exists
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userSignedIn(state, action: PayloadAction<AppUser>) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    userSignedOut(state) {
      state.user = null
      state.status = 'unauthenticated'
    },
    userProfileUpdated(
      state,
      action: PayloadAction<Partial<Pick<AppUser, 'displayName' | 'photoURL'>>>,
    ) {
      if (state.user) Object.assign(state.user, action.payload)
    },
  },
})

export const { userSignedIn, userSignedOut, userProfileUpdated } = authSlice.actions
export default authSlice.reducer
