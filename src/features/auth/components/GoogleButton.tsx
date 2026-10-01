import GoogleIcon from '@mui/icons-material/Google'
import Button from '@mui/material/Button'

interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function GoogleButton({ onClick, disabled }: GoogleButtonProps) {
  return (
    <Button
      fullWidth
      size="large"
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={onClick}
      disabled={disabled}
    >
      Continue with Google
    </Button>
  )
}
