import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import MenuIcon from '@mui/icons-material/Menu'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StarIcon from '@mui/icons-material/Star'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { CurrencySelect } from './CurrencySelect'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

const NAV_ITEMS = [
  { to: '/', label: 'Markets', icon: <ShowChartIcon /> },
  { to: '/watchlist', label: 'Watchlist', icon: <StarIcon /> },
  { to: '/portfolio', label: 'Portfolio', icon: <AccountBalanceWalletIcon /> },
]

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(8px)' }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: { xs: 1, sm: 2 } }}>
            <IconButton
              edge="start"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Logo />

            <Box
              component="nav"
              aria-label="Main"
              sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 3 }}
            >
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  end={item.to === '/'}
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&.active': { color: 'primary.main', bgcolor: 'action.selected' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <CurrencySelect />
            </Box>
            <ThemeToggle />
            <UserMenu />
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, p: 2 }} role="presentation">
          <Logo />
          <List sx={{ mt: 2 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  '&.active': { bgcolor: 'action.selected', color: 'primary.main' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ mt: 2 }}>
            <CurrencySelect />
          </Box>
        </Box>
      </Drawer>

      <Container
        component="main"
        maxWidth="xl"
        sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 3 } }}
      >
        <Outlet />
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 2.5 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} CoinPulse. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}
