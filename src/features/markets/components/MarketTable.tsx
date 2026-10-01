import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { MarketCoin } from '@/api/types'
import { CoinLabel } from '@/components/common/CoinLabel'
import { PriceChange } from '@/components/common/PriceChange'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setScrollOffset, setSorting } from '@/store/slices/marketFiltersSlice'
import type { Currency } from '@/types'

const ROW_HEIGHT = 64
/** Start loading the next page when the user is this many rows from the bottom. */
const LOAD_MORE_THRESHOLD = 15

interface MarketTableProps {
  coins: MarketCoin[]
  currency: Currency
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

/**
 * Sortable table that can hold thousands of coins.
 * TanStack Virtual only renders the ~20 rows that are visible, instead of every row.
 */
export function MarketTable({
  coins,
  currency,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: MarketTableProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  // Sorting and scroll position live in Redux so they survive opening a coin and coming back
  const sorting = useAppSelector((state) => state.marketFilters.sorting)
  const savedScrollOffset = useAppSelector((state) => state.marketFilters.scrollOffset)
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    dispatch(setSorting(typeof updater === 'function' ? updater(sorting) : updater))
  }

  // Fewer columns on small screens so the table fits without sideways scrolling
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const columnVisibility = useMemo(
    () => ({
      market_cap_rank: !isMobile,
      price_change_percentage_7d_in_currency: !isMobile,
      market_cap: !isTablet,
      total_volume: !isTablet,
    }),
    [isMobile, isTablet],
  )

  const columns = useMemo<ColumnDef<MarketCoin>[]>(
    () => [
      {
        accessorKey: 'market_cap_rank',
        header: '#',
        size: 60,
        cell: (info) => info.getValue<number | null>() ?? '—',
      },
      {
        accessorKey: 'name',
        header: 'Coin',
        size: 260,
        cell: ({ row }) => (
          <CoinLabel
            name={row.original.name}
            symbol={row.original.symbol}
            image={row.original.image}
          />
        ),
      },
      {
        accessorKey: 'current_price',
        header: 'Price',
        cell: (info) => formatCurrency(info.getValue<number | null>(), currency),
      },
      {
        accessorKey: 'price_change_percentage_24h',
        header: '24h',
        cell: (info) => <PriceChange value={info.getValue<number | null>()} />,
      },
      {
        accessorKey: 'price_change_percentage_7d_in_currency',
        header: '7d',
        cell: (info) => <PriceChange value={info.getValue<number | null | undefined>()} />,
      },
      {
        accessorKey: 'market_cap',
        header: 'Market cap',
        cell: (info) => formatCompactCurrency(info.getValue<number | null>(), currency),
      },
      {
        accessorKey: 'total_volume',
        header: 'Volume (24h)',
        cell: (info) => formatCompactCurrency(info.getValue<number | null>(), currency),
      },
    ],
    [currency],
  )

  const table = useReactTable({
    data: coins,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    initialOffset: savedScrollOffset, // jump back to where the user was
    overscan: 8,
  })

  // Remember the scroll position when leaving the page (e.g. opening a coin).
  // It's tracked in a ref on every scroll because the DOM element is already gone on unmount.
  const lastScrollTop = useRef(savedScrollOffset)
  useEffect(() => {
    return () => {
      dispatch(setScrollOffset(lastScrollTop.current))
    }
  }, [dispatch])

  // Coming back: put the scroll position back once the rows are there
  const restored = useRef(false)
  useLayoutEffect(() => {
    if (restored.current || rows.length === 0) return
    restored.current = true
    if (savedScrollOffset > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = savedScrollOffset
    }
  }, [rows.length, savedScrollOffset])

  const virtualRows = virtualizer.getVirtualItems()
  const lastVisibleIndex = virtualRows.at(-1)?.index ?? 0

  // Infinite scroll: fetch the next page when we get close to the end
  useEffect(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      rows.length > 0 &&
      lastVisibleIndex >= rows.length - LOAD_MORE_THRESHOLD
    ) {
      onLoadMore()
    }
  }, [hasNextPage, isFetchingNextPage, lastVisibleIndex, rows.length, onLoadMore])

  // Spacer rows keep the scrollbar the right size for rows that aren't rendered
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  // Before the first measurement no rows are rendered yet; still reserve the full height
  // so the container can be scrolled to a saved position straight away.
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : virtualizer.getTotalSize()

  const visibleColumnCount = table.getVisibleLeafColumns().length

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer
        ref={scrollRef}
        onScroll={(e) => {
          lastScrollTop.current = e.currentTarget.scrollTop
        }}
        sx={{ height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 280px)' }, minHeight: 400 }}
      >
        <Table
          stickyHeader
          aria-label="Cryptocurrency market prices"
          size={isMobile ? 'small' : 'medium'}
          sx={{
            minWidth: { md: 900 },
            '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableCell
                      key={header.id}
                      align={header.column.id === 'name' ? 'left' : 'right'}
                      sx={{ width: isMobile ? undefined : header.column.columnDef.size }}
                      sortDirection={sorted || false}
                    >
                      <TableSortLabel
                        active={Boolean(sorted)}
                        direction={sorted || 'desc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {paddingTop > 0 && (
              <TableRow aria-hidden>
                <TableCell
                  colSpan={visibleColumnCount}
                  sx={{ height: paddingTop, p: 0, border: 0 }}
                />
              </TableRow>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRow
                  key={row.id}
                  hover
                  tabIndex={0}
                  onClick={() => navigate(`/coin/${row.original.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/coin/${row.original.id}`)
                  }}
                  sx={{ height: ROW_HEIGHT, cursor: 'pointer' }}
                  data-testid="market-row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={cell.column.id === 'name' ? 'left' : 'right'}
                      sx={
                        cell.column.id === 'name'
                          ? { maxWidth: { xs: 150, sm: 'none' } }
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
            {paddingBottom > 0 && (
              <TableRow aria-hidden>
                <TableCell
                  colSpan={visibleColumnCount}
                  sx={{ height: paddingBottom, p: 0, border: 0 }}
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ height: 4 }}>
        {isFetchingNextPage && <LinearProgress aria-label="Loading more coins" />}
      </Box>
    </Paper>
  )
}
