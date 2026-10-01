import { useState } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { FormTextField } from '@/components/form/FormTextField'

interface PasswordFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  autoComplete: string
}

export function PasswordField<T extends FieldValues>({
  name,
  control,
  label,
  autoComplete,
}: PasswordFieldProps<T>) {
  const [visible, setVisible] = useState(false)

  return (
    <FormTextField
      name={name}
      control={control}
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((v) => !v)}
                edge="end"
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
