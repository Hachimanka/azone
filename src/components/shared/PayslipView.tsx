import type { Employee, MoneyLine, Payslip } from '@/services/types'
import { formatDate, formatPeriod, formatPeso } from '@/lib/format'

/** A single payslip (the payslip detail page), styled like APAY's PayslipView. */
export function PayslipView({ slip, employee }: { slip: Payslip; employee?: Employee }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-end justify-between gap-4 bg-gradient-to-br from-primary to-primary-700 p-5 text-white print:bg-none print:text-navy">
        <div>
          <p className="text-xl font-extrabold">AZNAR</p>
          <p className="text-xs opacity-80">Payslip · {formatPeriod(slip.periodStart, slip.periodEnd)}</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">{employee?.fullName}</p>
          <p className="opacity-80">
            {employee?.employeeNo} · {employee?.department}
          </p>
        </div>
      </div>

      <p className="flex justify-between border-b border-line px-5 py-2.5 text-xs text-muted">
        <span>Pay date</span>
        <span className="font-semibold text-navy">{formatDate(slip.payDate)}</span>
      </p>

      <div className="grid gap-6 p-5 sm:grid-cols-2">
        <Section title="Earnings" lines={slip.earnings} total={slip.gross} totalLabel="Gross Pay" />
        <Section title="Deductions" lines={slip.deductions} total={slip.totalDeductions} totalLabel="Total Deductions" negative />
      </div>

      <div className="mx-5 flex items-center justify-between rounded-xl bg-primary-50 p-4">
        <span className="font-semibold text-navy">Net Pay</span>
        <span className="text-xl font-extrabold text-primary">{formatPeso(slip.net)}</span>
      </div>
      <p className="px-5 py-4 text-center text-[11px] text-muted">This is a system-generated payslip from APAY.</p>
    </div>
  )
}

function Section({
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
      <p className="text-[11px] font-bold tracking-wider text-muted uppercase">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {lines.map((l) => (
          <li key={l.label} className="flex justify-between gap-3">
            <span className="text-ink">{l.label}</span>
            <span className="text-navy tabular-nums">{formatPeso(l.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-bold">
        <span className="text-navy">{totalLabel}</span>
        <span className={negative ? 'text-danger tabular-nums' : 'text-navy tabular-nums'}>{formatPeso(total)}</span>
      </p>
    </div>
  )
}
