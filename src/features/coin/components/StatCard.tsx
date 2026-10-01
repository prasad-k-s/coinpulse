import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h6" component="p">
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}
