import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import LogoutIcon from '@mui/icons-material/Logout'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { PageHeader } from '@/components/common/PageHeader'
import { FormTextField } from '@/components/form/FormTextField'
import { CurrencySelect } from '@/components/layout/CurrencySelect'
import { authService, getAuthErrorMessage } from '@/features/auth/authService'
import { selectThemeMode, selectUser, useAppDispatch, useAppSelector } from '@/store/hooks'
import { userProfileUpdated } from '@/store/slices/authSlice'
import { setThemeMode } from '@/store/slices/settingsSlice'

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
})
type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const themeMode = useAppSelector(selectThemeMode)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '' },
  })

  const onSubmit = async ({ displayName }: ProfileFormValues) => {
    setStatus(null)
    try {
      await authService.updateDisplayName(displayName)
      dispatch(userProfileUpdated({ displayName }))
      reset({ displayName })
      setStatus({ type: 'success', message: 'Profile updated.' })
    } catch (e) {
      setStatus({ type: 'error', message: getAuthErrorMessage(e) })
    }
  }

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/login')
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <PageHeader title="Settings" subtitle="Manage your profile and preferences." />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Signed in as {user?.email}
          </Typography>
          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)} noValidate>
            {status && <Alert severity={status.type}>{status.message}</Alert>}
            <FormTextField name="displayName" control={control} label="Display name" />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !isDirty}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save changes
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <Stack spacing={2} divider={<Divider flexItem />}>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={(e) => dispatch(setThemeMode(e.target.checked ? 'dark' : 'light'))}
                />
              }
              label="Dark mode"
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Display currency</Typography>
              <CurrencySelect />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session
          </Typography>
          <Button
            color="error"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    </Stack>
  )
}
