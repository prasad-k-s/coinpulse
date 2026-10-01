import { z } from 'zod'
import { todayIso } from '@/lib/format'

/** Number inputs give us strings; empty means "not filled in" rather than 0. */
const toNumber = (value: unknown) =>
  value === '' || value === undefined || value === null ? undefined : Number(value)

const positiveNumber = (field: string) =>
  z.preprocess(
    toNumber,
    z
      .number({ required_error: `${field} is required`, invalid_type_error: 'Enter a number' })
      .positive(`${field} must be greater than 0`),
  )

export const transactionSchema = z.object({
  type: z.enum(['buy', 'sell']),
  coinId: z.string().min(1, 'Select a coin'),
  quantity: positiveNumber('Quantity'),
  pricePerCoinUsd: positiveNumber('Price'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((value) => value <= todayIso(), 'Date cannot be in the future'),
  notes: z.string().trim().max(200, 'Notes can be at most 200 characters'),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
