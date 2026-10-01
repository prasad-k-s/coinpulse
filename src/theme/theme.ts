import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles'
import type { ThemeMode } from '@/types'

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === 'dark'
  const primary = '#6C5CE7'

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: '#00B894' },
      success: { main: '#16A34A' },
      error: { main: '#DC2626' },
      background: {
        default: isDark ? '#0B0F19' : '#F6F7FB',
        paper: isDark ? '#121826' : '#FFFFFF',
      },
      divider: isDark ? alpha('#FFFFFF', 0.08) : alpha('#0B0F19', 0.08),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 600, whiteSpace: 'nowrap' },
        },
      },
    },
  })

  // Scales headings down on smaller screens
  return responsiveFontSizes(theme)
}
