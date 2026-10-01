import { useMemo, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthListener } from '@/features/auth/components/AuthListener'
import { createQueryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { createAppStore } from '@/store'
import { selectThemeMode, useAppSelector } from '@/store/hooks'
import { createAppTheme } from '@/theme/theme'

const store = createAppStore()

function ThemedApp() {
  const mode = useAppSelector(selectThemeMode)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AuthListener />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default function App() {
  // Created once per app instance (not at module level) so tests and HMR stay isolated
  const [queryClient] = useState(createQueryClient)

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ReduxProvider>
  )
}
