import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, FileText, Search, SearchX, TrendingUp, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState, PageHeader, Skeleton } from '@/components/ui/Misc'
import { IconTile } from '@/components/ui/IconTile'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Field'
import { usePayslips } from '@/services/queries'
import type { Payslip } from '@/services/types'
import { formatDate, formatPeriod, formatPeso } from '@/lib/format'
import { cn } from '@/lib/cn'

const PAGE_SIZE = 10

/** Every way someone might type a payslip's dates: "September", "sep 30", "2026-09-30", "09/30/2026"… */
function searchText(p: Payslip) {
  const dates = [p.periodStart, p.periodEnd, p.payDate].map((d) => parseISO(d))
  return [
    formatPeriod(p.periodStart, p.periodEnd),
    ...dates.flatMap((d) => [format(d, 'MMMM d yyyy'), format(d, 'MMM d yyyy'), format(d, 'yyyy-MM-dd'), format(d, 'MM/dd/yyyy')]),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/,/g, '')
}

export function PayslipsPage() {
  const { data, isLoading } = usePayslips()
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('all')
  const [page, setPage] = useState(1)

  const latest = data?.[0]
  const years = useMemo(() => [...new Set(data?.map((p) => p.periodEnd.slice(0, 4)))].sort().reverse(), [data])

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().replace(/,/g, '').split(/\s+/).filter(Boolean)
    return (data ?? []).filter((p) => {
      if (year !== 'all' && !p.periodEnd.startsWith(year)) return false
      const text = searchText(p)
      return terms.every((t) => text.includes(t))
    })
  }, [data, query, year])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  // Summary card follows the year filter; "All years" shows the current year to date.
  const summaryYear = year === 'all' ? String(new Date().getFullYear()) : year
  const yearNet = data?.filter((p) => p.periodEnd.startsWith(summaryYear)).reduce((sum, p) => sum + Number(p.net), 0) ?? 0

  const updateQuery = (q: string) => {
    setQuery(q)
    setPage(1)
  }
  const updateYear = (y: string) => {
    setYear(y)
    setPage(1)
  }

  return (
    <>
      <PageHeader eyebrow="Payroll" title="Payslips" description="Your semi-monthly payslips, released through APAY." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary to-primary-700 p-6 text-white shadow-lift">
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
          <p className="text-sm text-white/80">Latest net pay</p>
          <p className="mt-1 text-3xl font-bold">{latest ? formatPeso(latest.net) : '—'}</p>
          <p className="mt-2 text-sm text-white/80">{latest && formatPeriod(latest.periodStart, latest.periodEnd)}</p>
        </div>
        <Card className="flex items-center gap-4 p-6">
          <IconTile icon={TrendingUp} tone="success" className="size-12" />
          <div>
            <p className="text-sm text-muted">
              Net pay, {summaryYear}
              {summaryYear === String(new Date().getFullYear()) && ' to date'}
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">{formatPeso(yearNet)}</p>
          </div>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search payslips by date</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search by date, e.g. September or Sep 30"
            className="pr-10 pl-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-primary-50 hover:text-primary"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by year</span>
          <Select value={year} onChange={(e) => updateYear(e.target.value)}>
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <Card className="divide-y divide-line">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="p-5">
              <Skeleton className="h-10" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No payslips found" description="Try a different date or year." />
        ) : (
          rows.map((p) => (
            <Link key={p.id} to={`/app/payslips/${p.id}`} className="group flex items-center gap-4 p-4 transition hover:bg-primary-50/60 sm:p-5">
              <IconTile icon={FileText} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-navy">
                  {formatPeriod(p.periodStart, p.periodEnd)}
                  {p.id === latest?.id && (
                    <Badge size="sm" tone="success">
                      New
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted">Paid {formatDate(p.payDate)}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-muted">Gross</p>
                <p className="text-sm font-semibold text-ink">{formatPeso(p.gross)}</p>
              </div>
              <div className="text-right sm:w-32">
                <p className="text-xs text-muted">Net Pay</p>
                <p className="font-bold text-navy">{formatPeso(p.net)}</p>
              </div>
              <ChevronRight className="size-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))
        )}
      </Card>

      {!isLoading && filtered.length > 0 && <Pagination page={current} pageCount={pageCount} total={filtered.length} onChange={setPage} />}
    </>
  )
}

/** Page numbers with ellipses: 1 … 4 5 6 … 10 */
function pageList(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const middle = [page - 1, page, page + 1].filter((p) => p > 1 && p < count)
  return [1, ...(middle[0] > 2 ? ['…' as const] : []), ...middle, ...(middle[middle.length - 1] < count - 1 ? ['…' as const] : []), count]
}

function Pagination({ page, pageCount, total, onChange }: { page: number; pageCount: number; total: number; onChange: (page: number) => void }) {
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const go = (p: number) => {
    onChange(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const arrow =
    'flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:border-primary-200 hover:text-primary disabled:pointer-events-none disabled:opacity-40'

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted">
        Showing <b className="text-navy">{from}</b>–<b className="text-navy">{to}</b> of <b className="text-navy">{total}</b> payslips
      </p>
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button type="button" className={arrow} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap${i}`} className="px-1 text-sm text-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => go(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'size-9 rounded-xl text-sm font-semibold transition',
                  p === page
                    ? 'bg-primary text-white shadow-[0_8px_20px_-8px_rgb(21_87_224/0.6)]'
                    : 'border border-line bg-surface text-ink hover:border-primary-200 hover:text-primary',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" className={arrow} onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Next page">
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
