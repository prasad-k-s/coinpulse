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
import { signupSchema, type SignupFormValues } from '../schemas'

export default function SignupPage() {
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ name, email, password }: SignupFormValues) => {
    setError(null)
    try {
      dispatch(userSignedIn(await authService.signUp(name, email, password)))
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

  const busy = isSubmitting || googleLoading

  return (
    <AuthCard
      title="Create your account"
      subtitle="Track your crypto portfolio in one place. It's free."
      footer={
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Log in
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <Alert severity="error">{error}</Alert>}

        <FormTextField name="name" control={control} label="Full name" autoComplete="name" />
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
          autoComplete="new-password"
        />
        <PasswordField
          name="confirmPassword"
          control={control}
          label="Confirm password"
          autoComplete="new-password"
        />

        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <Divider>or</Divider>

        <GoogleButton onClick={handleGoogle} disabled={busy} />
      </Stack>
    </AuthCard>
  )
}
