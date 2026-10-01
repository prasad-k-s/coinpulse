import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FormTextField } from '@/components/form/FormTextField'
import { useAppDispatch } from '@/store/hooks'
import { userSignedIn } from '@/store/slices/authSlice'
import { authService, getAuthErrorMessage } from '../authService'
import { AuthCard } from '../components/AuthCard'
import { GoogleButton } from '../components/GoogleButton'
import { PasswordField } from '../components/PasswordField'
import { loginSchema, type LoginFormValues } from '../schemas'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // On success Redux gets the user, and <PublicOnlyRoute> redirects to the page the user came from
  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setError(null)
    try {
      dispatch(userSignedIn(await authService.signIn(email, password)))
    } catch (e) {
      setError(getAuthErrorMessage(e))
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      dispatch(userSignedIn(await authService.signInWithGoogle()))
    } catch (e) {
      setError(getAuthErrorMessage(e))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError(null)
    setInfo(null)
    if (!(await trigger('email'))) return
    try {
      await authService.resetPassword(getValues('email'))
      setInfo('Password reset email sent. Check your inbox.')
    } catch (e) {
      setError(getAuthErrorMessage(e))
    }
  }

  const busy = isSubmitting || googleLoading

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to see your watchlist and portfolio."
      footer={
        <Typography variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} to="/signup">
            Sign up
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        {info && <Alert severity="success">{info}</Alert>}

        <FormTextField
          name="email"
          control={control}
          label="Email"
          type="email"
          autoComplete="email"
        />
        <PasswordField
          name="password"
          control={control}
          label="Password"
          autoComplete="current-password"
        />

        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={handleForgotPassword}
          sx={{ alignSelf: 'flex-end' }}
        >
          Forgot password?
        </Link>

        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>

        <Divider>or</Divider>

        <GoogleButton onClick={handleGoogle} disabled={busy} />
      </Stack>
    </AuthCard>
  )
}
