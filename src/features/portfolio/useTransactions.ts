import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { selectUser, useAppSelector } from '@/store/hooks'
import { transactionService } from './transactionService'
import type { NewTransaction, Transaction } from './types'

export function useTransactions() {
  const user = useAppSelector(selectUser)
  return useQuery({
    queryKey: queryKeys.transactions(user?.uid ?? 'anonymous'),
    queryFn: () => transactionService.getAll(user!.uid),
    enabled: Boolean(user),
    staleTime: Infinity,
  })
}

export function useAddTransaction() {
  const user = useAppSelector(selectUser)
  const queryClient = useQueryClient()
  const key = queryKeys.transactions(user?.uid ?? 'anonymous')

  return useMutation({
    mutationFn: (transaction: NewTransaction) => {
      if (!user) throw new Error('Please log in first.')
      return transactionService.add(user.uid, transaction)
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Transaction[]>(key, (old = []) => [created, ...old])
    },
  })
}

export function useDeleteTransaction() {
  const user = useAppSelector(selectUser)
  const queryClient = useQueryClient()
  const key = queryKeys.transactions(user?.uid ?? 'anonymous')

  return useMutation({
    mutationFn: (transactionId: string) => {
      if (!user) throw new Error('Please log in first.')
      return transactionService.remove(user.uid, transactionId)
    },
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Transaction[]>(key)
      queryClient.setQueryData<Transaction[]>(key, (old = []) =>
        old.filter((t) => t.id !== transactionId),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
  })
}
