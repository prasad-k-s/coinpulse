import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch } from '@/store/hooks'
import { userSignedIn, userSignedOut } from '@/store/slices/authSlice'
import { authService } from '../authService'

/** Keeps the Redux auth state in sync with Firebase's session. Renders nothing. */
export function AuthListener() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  useEffect(() => {
    return authService.subscribe((user) => {
      if (user) {
        dispatch(userSignedIn(user))
      } else {
        dispatch(userSignedOut())
        // Drop any cached private data from the previous user
        queryClient.removeQueries({ queryKey: ['watchlist'] })
        queryClient.removeQueries({ queryKey: ['transactions'] })
      }
    })
  }, [dispatch, queryClient])

  return null
}
