import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { FullPageLoader } from '@/components/common/FullPageLoader'
import { RouteError } from '@/components/common/RouteError'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/components/ProtectedRoute'

/**
 * Every page is lazy loaded, so each one becomes its own JS chunk and
 * the first page load only downloads the code it needs.
 */
const page = (loader: () => Promise<{ default: ComponentType }>) => async () => {
  const module = await loader()
  return { Component: module.default }
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <FullPageLoader />,
    children: [
      { index: true, lazy: page(() => import('@/features/markets/pages/MarketsPage')) },
      { path: 'coin/:coinId', lazy: page(() => import('@/features/coin/pages/CoinDetailPage')) },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: 'login', lazy: page(() => import('@/features/auth/pages/LoginPage')) },
          { path: 'signup', lazy: page(() => import('@/features/auth/pages/SignupPage')) },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'watchlist',
            lazy: page(() => import('@/features/watchlist/pages/WatchlistPage')),
          },
          {
            path: 'portfolio',
            lazy: page(() => import('@/features/portfolio/pages/PortfolioPage')),
          },
          {
            path: 'portfolio/add',
            lazy: page(() => import('@/features/portfolio/pages/AddTransactionPage')),
          },
          { path: 'settings', lazy: page(() => import('@/features/settings/pages/SettingsPage')) },
        ],
      },
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
]

export const router = createBrowserRouter(routes)
