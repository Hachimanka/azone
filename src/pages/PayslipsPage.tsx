import { Link } from 'react-router-dom'
import { ChevronRight, FileText, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader, Skeleton } from '@/components/ui/Misc'
import { IconTile } from '@/components/ui/IconTile'
import { Badge } from '@/components/ui/Badge'
import { usePayslips } from '@/services/queries'
import { formatDate, formatPeriod, formatPeso } from '@/lib/format'

export function PayslipsPage() {
  const { data, isLoading } = usePayslips()
  const ytdNet = data?.reduce((sum, p) => sum + Number(p.net), 0) ?? 0
  const latest = data?.[0]

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
            <p className="text-sm text-muted">Net pay, last {data?.length ?? 0} cut-offs</p>
            <p className="mt-1 text-2xl font-bold text-navy">{formatPeso(ytdNet)}</p>
          </div>
        </Card>
      </div>

      <Card className="divide-y divide-line">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="p-5">
                <Skeleton className="h-10" />
              </div>
            ))
          : data?.map((p, i) => (
              <Link key={p.id} to={`/app/payslips/${p.id}`} className="group flex items-center gap-4 p-4 transition hover:bg-primary-50/60 sm:p-5">
                <IconTile icon={FileText} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-navy">
                    {formatPeriod(p.periodStart, p.periodEnd)}
                    {i === 0 && (
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
            ))}
      </Card>
    </>
  )
}
