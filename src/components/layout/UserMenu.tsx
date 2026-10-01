import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { authService } from '@/features/auth/authService'
import { selectUser, useAppSelector } from '@/store/hooks'

export function UserMenu() {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!user) {
    return (
      <Button variant="contained" component={RouterLink} to="/login">
        Log in
      </Button>
    )
  }

  const name = user.displayName || user.email || 'User'

  const handleLogout = async () => {
    setAnchorEl(null)
    await authService.signOut()
    navigate('/login')
  }

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Open account menu"
        aria-controls={anchorEl ? 'user-menu' : undefined}
        aria-haspopup="true"
      >
        <Avatar src={user.photoURL ?? undefined} alt={name} sx={{ width: 34, height: 34 }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important', display: 'block' }}>
          <Typography fontWeight={600}>{user.displayName || 'My account'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/settings" onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  )
}
