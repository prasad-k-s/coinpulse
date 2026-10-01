import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import TextField, { type OutlinedTextFieldProps } from '@mui/material/TextField'

type FormTextFieldProps<T extends FieldValues> = Omit<
  OutlinedTextFieldProps,
  'name' | 'variant' | 'value' | 'onChange' | 'onBlur'
> & {
  name: FieldPath<T>
  control: Control<T>
}

/** MUI TextField wired to React Hook Form, showing the Zod error message under the field. */
export function FormTextField<T extends FieldValues>({
  name,
  control,
  helperText,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState }) => (
        <TextField
          {...props}
          {...field}
          variant="outlined"
          value={field.value ?? ''}
          inputRef={ref}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
        />
      )}
    />
  )
}
