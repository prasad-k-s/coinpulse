import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { selectUser, useAppSelector } from '@/store/hooks'
import { watchlistService } from './watchlistService'

export function useWatchlist() {
  const user = useAppSelector(selectUser)
  return useQuery({
    queryKey: queryKeys.watchlist(user?.uid ?? 'anonymous'),
    queryFn: () => watchlistService.getAll(user!.uid),
    enabled: Boolean(user),
    staleTime: Infinity, // only changes through our own mutations
  })
}

/**
 * Adds or removes a coin with an optimistic update: the UI changes instantly
 * and rolls back if Firestore rejects the write.
 */
export function useToggleWatchlist() {
  const user = useAppSelector(selectUser)
  const queryClient = useQueryClient()
  const key = queryKeys.watchlist(user?.uid ?? 'anonymous')

  return useMutation({
    mutationFn: async ({ coinId, watched }: { coinId: string; watched: boolean }) => {
      if (!user) throw new Error('Please log in to use the watchlist.')
      if (watched) await watchlistService.remove(user.uid, coinId)
      else await watchlistService.add(user.uid, coinId)
    },
    onMutate: async ({ coinId, watched }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<string[]>(key)
      queryClient.setQueryData<string[]>(key, (old = []) =>
        watched ? old.filter((id) => id !== coinId) : [coinId, ...old],
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
