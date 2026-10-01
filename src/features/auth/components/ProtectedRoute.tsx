import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageLoader } from '@/components/common/FullPageLoader'
import { selectAuthStatus, useAppSelector } from '@/store/hooks'

/** Layout route: only renders child routes for signed-in users. */
export function ProtectedRoute() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

/** Layout route: login/signup pages should not be shown to signed-in users. */
export function PublicOnlyRoute() {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/portfolio'

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') return <Navigate to={from} replace />

  return <Outlet />
}
