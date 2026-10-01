import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, signedInState, signedOutState } from '@/test/utils'
import { watchlistService } from '../watchlistService'
import { WatchlistButton } from './WatchlistButton'

vi.mock('../watchlistService', () => ({
  watchlistService: {
    getAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('WatchlistButton', () => {
  // A tiny in-memory "Firestore" so refetches after a mutation return the saved data
  let saved: string[]

  beforeEach(() => {
    vi.clearAllMocks()
    saved = ['ethereum']
    vi.mocked(watchlistService.getAll).mockImplementation(async () => [...saved])
    vi.mocked(watchlistService.add).mockImplementation(async (_uid, coinId) => {
      saved = [coinId, ...saved]
    })
    vi.mocked(watchlistService.remove).mockImplementation(async (_uid, coinId) => {
      saved = saved.filter((id) => id !== coinId)
    })
  })

  it('asks signed-out users to log in', () => {
    renderWithProviders(<WatchlistButton coinId="bitcoin" />, { preloadedState: signedOutState })
    expect(screen.getByRole('link', { name: 'Log in to watch' })).toHaveAttribute('href', '/login')
  })

  it('adds a coin to the watchlist', async () => {
    const { user } = renderWithProviders(<WatchlistButton coinId="bitcoin" />, {
      preloadedState: signedInState,
    })

    const button = await screen.findByRole('button', { name: 'Add to watchlist' })
    await waitFor(() => expect(watchlistService.getAll).toHaveBeenCalled())
    await user.click(button)

    // Optimistic update: the label changes straight away
    expect(await screen.findByRole('button', { name: 'Watching' })).toBeInTheDocument()
    expect(watchlistService.add).toHaveBeenCalledWith('user-1', 'bitcoin')
  })

  it('removes a coin that is already watched', async () => {
    const { user } = renderWithProviders(<WatchlistButton coinId="ethereum" />, {
      preloadedState: signedInState,
    })

    await user.click(await screen.findByRole('button', { name: 'Watching' }))

    expect(await screen.findByRole('button', { name: 'Add to watchlist' })).toBeInTheDocument()
    expect(watchlistService.remove).toHaveBeenCalledWith('user-1', 'ethereum')
  })

  it('rolls back if saving fails', async () => {
    vi.mocked(watchlistService.add).mockRejectedValue(new Error('offline'))
    const { user } = renderWithProviders(<WatchlistButton coinId="bitcoin" />, {
      preloadedState: signedInState,
    })
    await waitFor(() => expect(watchlistService.getAll).toHaveBeenCalled())

    await user.click(await screen.findByRole('button', { name: 'Add to watchlist' }))
    expect(watchlistService.add).toHaveBeenCalled()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add to watchlist' })).toBeInTheDocument(),
    )
  })
})
