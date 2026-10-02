import { Link } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Misc'
import { usePayslips } from '@/services/queries'
import { formatPeriod, formatPeso } from '@/lib/format'

export function PayslipSummary() {
  const { data, isLoading } = usePayslips()
  const latest = data?.[0]

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <CardHeader icon={FileText} title="Recent Payslip" viewAllTo="/app/payslips" />
      {isLoading || !latest ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <p className="mt-6 font-semibold text-navy">{formatPeriod(latest.periodStart, latest.periodEnd)}</p>
          <dl className="mt-5 mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-bg p-4 sm:p-5">
            {[
              ['Gross Pay', latest.gross],
              ['Deductions', latest.totalDeductions],
              ['Net Pay', latest.net],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt className="text-xs text-muted sm:text-sm">{label}</dt>
                <dd className="mt-1 text-base font-bold text-navy sm:text-xl">{formatPeso(amount)}</dd>
              </div>
            ))}
          </dl>
          <Link
            to={`/app/payslips/${latest.id}`}
            className="group mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary-50 py-3 text-sm font-semibold text-primary transition hover:bg-primary-100"
          >
            <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
            View Payslip
          </Link>
        </>
      )}
    </Card>
  )
}
