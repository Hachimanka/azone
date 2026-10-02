import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Misc'
import { usePayslip } from '@/services/queries'
import { useAuth } from '@/store/auth'
import { formatDate, formatPeriod, formatPeso } from '@/lib/format'
import type { MoneyLine } from '@/services/types'

export function PayslipDetailPage() {
  const { id = '' } = useParams()
  const { data: slip, isLoading, isError } = usePayslip(id)
  const employee = useAuth((s) => s.session?.employee)

  if (isError) return <p className="text-muted">Payslip not found.</p>

  return (
    <>
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link to="/app/payslips" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary">
          <ArrowLeft className="size-4" /> All payslips
        </Link>
        {/* Browser print dialog lets the employee save as PDF on desktop and phone */}
        <Button size="sm" onClick={() => window.print()} disabled={!slip}>
          <Download className="size-4" /> Download PDF
        </Button>
      </div>

      <Card className="mx-auto max-w-3xl overflow-hidden print:border-0 print:shadow-none">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-primary to-primary-700 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8 print:bg-none print:text-navy">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">AZNAR</p>
            <p className="text-sm opacity-80">Payslip</p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm opacity-80">Pay period</p>
            <div className="font-semibold">
              {slip ? formatPeriod(slip.periodStart, slip.periodEnd) : <Skeleton className="h-5 w-40 bg-white/20" />}
            </div>
          </div>
        </div>

        {isLoading || !slip ? (
          <div className="space-y-3 p-8">
            <Skeleton className="h-6" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Info label="Employee" value={employee?.fullName} />
              <Info label="Employee No." value={employee?.employeeNo} />
              <Info label="Department" value={employee?.department} />
              <Info label="Pay date" value={formatDate(slip.payDate)} />
            </dl>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <Lines title="Earnings" lines={slip.earnings} total={slip.gross} totalLabel="Gross Pay" />
              <Lines title="Deductions" lines={slip.deductions} total={slip.totalDeductions} totalLabel="Total Deductions" negative />
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl bg-primary-50 p-5">
              <span className="font-semibold text-navy">Net Pay</span>
              <span className="text-2xl font-extrabold text-primary">{formatPeso(slip.net)}</span>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              This is a system-generated payslip from APAY. For concerns, email payroll@aznar.com.
            </p>
          </div>
        )}
      </Card>
    </>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-navy">{value}</dd>
    </div>
  )
}

function Lines({
  title,
  lines,
  total,
  totalLabel,
  negative,
}: {
  title: string
  lines: MoneyLine[]
  total: string
  totalLabel: string
  negative?: boolean
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-sm">
        {lines.map((l) => (
          <li key={l.label} className="flex justify-between">
            <span className="text-ink">{l.label}</span>
            <span className="font-medium text-navy">{formatPeso(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-bold">
        <span className="text-navy">{totalLabel}</span>
        <span className={negative ? 'text-danger' : 'text-navy'}>{formatPeso(total)}</span>
      </div>
    </div>
  )
}
