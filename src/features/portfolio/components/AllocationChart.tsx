import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { HoldingWithValue } from '../types'

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#E84393', '#636E72']
const MAX_SLICES = 6

export function AllocationChart({ holdings }: { holdings: HoldingWithValue[] }) {
  const total = holdings.reduce((sum, h) => sum + h.valueUsd, 0)

  // Show the biggest holdings and group the rest as "Others"
  const top = holdings
    .slice(0, MAX_SLICES)
    .map((h) => ({ name: h.symbol.toUpperCase(), value: h.valueUsd }))
  const othersValue = holdings.slice(MAX_SLICES).reduce((sum, h) => sum + h.valueUsd, 0)
  const data = othersValue > 0 ? [...top, { name: 'Others', value: othersValue }] : top

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Allocation
        </Typography>
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
