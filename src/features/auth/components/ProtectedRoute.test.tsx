import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { render, screen } from '@testing-library/react'
import { setupStore, type RootState } from '@/store'
import { signedInState, signedOutState } from '@/test/utils'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

function renderRoutes(initialPath: string, preloadedState: Partial<RootState>) {
  const router = createMemoryRouter(
    [
      {
        element: <PublicOnlyRoute />,
        children: [{ path: '/login', element: <h1>Login page</h1> }],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/portfolio', element: <h1>Portfolio page</h1> }],
      },
    ],
    { initialEntries: [initialPath] },
  )
  render(
    <Provider store={setupStore(preloadedState)}>
      <RouterProvider router={router} />
    </Provider>,
  )
  return router
}

describe('ProtectedRoute', () => {
  it('redirects signed-out users to the login page', async () => {
    const router = renderRoutes('/portfolio', signedOutState)

    expect(await screen.findByRole('heading', { name: 'Login page' })).toBeInTheDocument()
    expect(router.state.location.state).toEqual({ from: '/portfolio' })
  })

  it('shows the page to signed-in users', async () => {
    renderRoutes('/portfolio', signedInState)
    expect(await screen.findByRole('heading', { name: 'Portfolio page' })).toBeInTheDocument()
  })

  it('shows a loader while the session is being checked', () => {
    renderRoutes('/portfolio', { auth: { user: null, status: 'loading' } })
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })
})

describe('PublicOnlyRoute', () => {
  it('sends signed-in users away from the login page', async () => {
    renderRoutes('/login', signedInState)
    expect(await screen.findByRole('heading', { name: 'Portfolio page' })).toBeInTheDocument()
  })
})
