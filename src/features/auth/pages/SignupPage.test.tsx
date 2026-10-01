import { screen, waitFor } from '@testing-library/react'
import { authService } from '@/features/auth/authService'
import { renderWithProviders, signedOutState, testUser } from '@/test/utils'
import SignupPage from './SignupPage'

vi.mock('@/features/auth/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/authService')>()
  return {
    ...actual,
    authService: { signUp: vi.fn(), signInWithGoogle: vi.fn() },
  }
})

const renderSignup = () =>
  renderWithProviders(<SignupPage />, {
    route: '/signup',
    path: '/signup',
    preloadedState: signedOutState,
  })

describe('SignupPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('checks that the passwords match', async () => {
    const { user } = renderSignup()

    await user.type(screen.getByLabelText('Full name'), 'Prasad')
    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.type(screen.getByLabelText('Confirm password'), 'secret124')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
    expect(authService.signUp).not.toHaveBeenCalled()
  })

  it('requires a password with a number', async () => {
    const { user } = renderSignup()

    await user.type(screen.getByLabelText('Password'), 'onlyletters')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('Password must contain a number')).toBeInTheDocument()
  })

  it('creates the account', async () => {
    vi.mocked(authService.signUp).mockResolvedValue(testUser)
    const { user, store } = renderSignup()

    await user.type(screen.getByLabelText('Full name'), 'Prasad')
    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.type(screen.getByLabelText('Confirm password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(store.getState().auth.status).toBe('authenticated'))
    expect(authService.signUp).toHaveBeenCalledWith('Prasad', 'prasad@example.com', 'secret123')
  })
})
