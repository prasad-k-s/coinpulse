import { screen, waitFor } from '@testing-library/react'
import { todayIso } from '@/lib/format'
import { mockCoins } from '@/test/fixtures/coins'
import { renderWithProviders } from '@/test/utils'
import { TransactionForm } from './TransactionForm'

function renderForm(props: Partial<Parameters<typeof TransactionForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const result = renderWithProviders(
    <TransactionForm
      coins={mockCoins}
      heldQuantities={{ bitcoin: 0.5 }}
      defaultCoinId="bitcoin"
      onSubmit={onSubmit}
      {...props}
    />,
  )
  return { ...result, onSubmit }
}

describe('TransactionForm', () => {
  it('submits a valid buy transaction', async () => {
    const { user, onSubmit } = renderForm()

    await user.type(screen.getByLabelText('Quantity'), '0.25')
    await user.type(screen.getByLabelText('Price per coin (USD)'), '60000')
    await user.type(screen.getByLabelText('Notes (optional)'), 'DCA')

    expect(screen.getByTestId('transaction-total')).toHaveTextContent('$15,000.00')

    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        type: 'buy',
        coinId: 'bitcoin',
        quantity: 0.25,
        pricePerCoinUsd: 60000,
        date: todayIso(),
        notes: 'DCA',
      }),
    )
  })

  it('validates quantity and price', async () => {
    const { user, onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    expect(await screen.findByText('Quantity is required')).toBeInTheDocument()
    expect(screen.getByText('Price is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Quantity'), '0')
    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    expect(await screen.findByText('Quantity must be greater than 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires a coin', async () => {
    const { user } = renderForm({ defaultCoinId: '' })

    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    expect(await screen.findByText('Select a coin')).toBeInTheDocument()
  })

  it('fills in the current price', async () => {
    const { user } = renderForm()

    await user.click(screen.getByRole('button', { name: /use current price/i }))

    expect(screen.getByLabelText('Price per coin (USD)')).toHaveValue(60000)
  })

  it('does not allow selling more than the user holds', async () => {
    const { user, onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Sell' }))
    await user.type(screen.getByLabelText('Quantity'), '1')
    await user.type(screen.getByLabelText('Price per coin (USD)'), '60000')
    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    expect(await screen.findByText('You only hold 0.5')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
