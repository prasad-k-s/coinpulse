import { screen, waitFor } from '@testing-library/react'
import { authService } from '@/features/auth/authService'
import { renderWithProviders, signedOutState, testUser } from '@/test/utils'
import LoginPage from './LoginPage'

vi.mock('@/features/auth/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/authService')>()
  return {
    ...actual,
    authService: {
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      resetPassword: vi.fn(),
    },
  }
})

const renderLogin = () =>
  renderWithProviders(<LoginPage />, {
    route: '/login',
    path: '/login',
    preloadedState: signedOutState,
  })

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors when submitted empty', async () => {
    const { user } = renderLogin()

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(authService.signIn).not.toHaveBeenCalled()
  })

  it('rejects an invalid email', async () => {
    const { user } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(authService.signIn).not.toHaveBeenCalled()
  })

  it('signs the user in and stores them in Redux', async () => {
    vi.mocked(authService.signIn).mockResolvedValue(testUser)
    const { user, store } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(store.getState().auth.status).toBe('authenticated'))
    expect(authService.signIn).toHaveBeenCalledWith('prasad@example.com', 'secret123')
    expect(store.getState().auth.user).toEqual(testUser)
  })

  it('shows a friendly message when the password is wrong', async () => {
    vi.mocked(authService.signIn).mockRejectedValue({ code: 'auth/invalid-credential' })
    const { user } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const { user } = renderLogin()
    const password = screen.getByLabelText('Password')

    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
  })
})
