import { http, HttpResponse } from 'msw'
import { screen, waitFor, within } from '@testing-library/react'
import { COINGECKO_BASE_URL } from '@/api/coingecko'
import { server } from '@/test/server'
import { renderWithProviders } from '@/test/utils'
import MarketsPage from './MarketsPage'

describe('MarketsPage', () => {
  // jsdom has no layout engine, so every element measures 0x0 and the virtualized
  // table would render no rows. Give elements a real size for these tests.
  const sizeProps = ['offsetHeight', 'offsetWidth', 'clientHeight', 'clientWidth'] as const
  const originals = sizeProps.map((prop) =>
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop),
  )

  beforeAll(() => {
    sizeProps.forEach((prop) => {
      Object.defineProperty(HTMLElement.prototype, prop, {
        configurable: true,
        get: () => (prop.endsWith('Height') ? 800 : 1200),
      })
    })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      right: 1200,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
  })

  afterAll(() => {
    sizeProps.forEach((prop, i) => {
      const original = originals[i]
      if (original) Object.defineProperty(HTMLElement.prototype, prop, original)
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[prop]
    })
    vi.restoreAllMocks()
  })

  it('loads and shows coins from the API', async () => {
    renderWithProviders(<MarketsPage />)

    expect(await screen.findByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getAllByTestId('market-row')).toHaveLength(3)

    const bitcoinRow = screen.getAllByTestId('market-row')[0]
    expect(within(bitcoinRow).getByText('$60,000.00')).toBeInTheDocument()
  })

  it('filters coins with the search box', async () => {
    const { user, store } = renderWithProviders(<MarketsPage />)
    await screen.findByText('Bitcoin')

    await user.type(screen.getByRole('textbox', { name: 'Search coins' }), 'eth')

    await waitFor(() => expect(screen.getAllByTestId('market-row')).toHaveLength(1))
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(store.getState().marketFilters.search).toBe('eth')
  })

  it('shows only gainers', async () => {
    const { user } = renderWithProviders(<MarketsPage />)
    await screen.findByText('Bitcoin')

    await user.click(screen.getByRole('button', { name: 'Gainers' }))

    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('market-row')).toHaveLength(2)
  })

  it('shows prices in rupees when INR is selected', async () => {
    renderWithProviders(<MarketsPage />, {
      preloadedState: { settings: { themeMode: 'light', currency: 'inr' } },
    })
    expect(await screen.findByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getAllByText(/₹/).length).toBeGreaterThan(0)
  })

  it('shows an error with a retry button when the API fails', async () => {
    server.use(
      http.get(
        `${COINGECKO_BASE_URL}/coins/markets`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderWithProviders(<MarketsPage />)

    expect(await screen.findByText('CoinGecko request failed (500)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
