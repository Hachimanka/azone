import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, EyeOff, FileText } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Misc'
import { usePayslips } from '@/services/queries'
import { formatPeriod, formatPeso } from '@/lib/format'

export function PayslipSummary() {
  const { data, isLoading } = usePayslips()
  const latest = data?.[0]
  const [showAmounts, setShowAmounts] = useState(false)

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
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="font-semibold text-navy">{formatPeriod(latest.periodStart, latest.periodEnd)}</p>
            <button
              type="button"
              onClick={() => setShowAmounts((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-muted transition hover:bg-primary-50 hover:text-primary"
              aria-pressed={showAmounts}
            >
              {showAmounts ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showAmounts ? 'Hide' : 'Show'} amounts
            </button>
          </div>
          <dl className="mt-5 mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-bg p-4 sm:p-5">
            {[
              ['Gross Pay', latest.gross],
              ['Deductions', latest.totalDeductions],
              ['Net Pay', latest.net],
            ].map(([label, amount]) => (
              <div key={label}>
                <dt className="text-xs text-muted sm:text-sm">{label}</dt>
                <dd className="mt-1 text-base font-bold text-navy sm:text-xl">{showAmounts ? formatPeso(amount) : '₱ ••••'}</dd>
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
