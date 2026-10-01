import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupStore, type RootState } from '@/store'
import { createAppTheme } from '@/theme/theme'
import type { AppUser } from '@/types'

export const testUser: AppUser = {
  uid: 'user-1',
  email: 'prasad@example.com',
  displayName: 'Prasad',
  photoURL: null,
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}

interface RenderOptions {
  /** Starting URL, e.g. "/coin/bitcoin" */
  route?: string
  /** Path pattern for the element under test, e.g. "/coin/:coinId" */
  path?: string
  /** Extra routes, e.g. a stub page to check redirects */
  extraRoutes?: RouteObject[]
  preloadedState?: Partial<RootState>
}

/** Renders a component with Redux, React Query, MUI theme and a memory router. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '/', extraRoutes = [], preloadedState }: RenderOptions = {},
) {
  const store = setupStore(preloadedState)
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter([{ path, element: ui }, ...extraRoutes], {
    initialEntries: [route],
  })

  const result = render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={createAppTheme('light')}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>,
  )

  return { ...result, store, queryClient, router, user: userEvent.setup() }
}

export const signedInState: Partial<RootState> = {
  auth: { user: testUser, status: 'authenticated' },
}

export const signedOutState: Partial<RootState> = {
  auth: { user: null, status: 'unauthenticated' },
}
