import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      {icon && <Box sx={{ color: 'text.secondary', mb: 1, '& svg': { fontSize: 48 } }}>{icon}</Box>}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mb: action ? 3 : 0, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  )
}
