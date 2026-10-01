import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { isFirebaseConfigured } from '@/lib/firebase'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: { xs: 2, md: 6 } }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {!isFirebaseConfigured && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Firebase isn&apos;t configured yet, so login won&apos;t work. Add your Firebase keys
              to the <code>.env</code> file (see README).
            </Alert>
          )}
          {children}
          <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>
        </CardContent>
      </Card>
    </Box>
  )
}
