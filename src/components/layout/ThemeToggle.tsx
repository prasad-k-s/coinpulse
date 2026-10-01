import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { selectThemeMode, useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleThemeMode } from '@/store/slices/settingsSlice'

export function ThemeToggle() {
  const mode = useAppSelector(selectThemeMode)
  const dispatch = useAppDispatch()
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip title={label}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label={label}>
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
