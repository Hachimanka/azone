import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState, Skeleton } from '@/components/ui/Misc'
import { PayslipView } from '@/components/shared/PayslipView'
import { usePayslip } from '@/services/queries'
import { useAuth } from '@/store/auth'
import { useDetailCrumb } from '@/store/breadcrumb'
import { formatPeriod } from '@/lib/format'

/** Single payslip page: Dashboard › Payslip › <pay period> in the top bar, like APAY's detail pages. */
export function PayslipDetailPage() {
  const { id = '' } = useParams()
  const { data: slip, isLoading, isError } = usePayslip(id)
  const employee = useAuth((s) => s.session?.employee)
  useDetailCrumb(isError ? 'Not found' : slip && formatPeriod(slip.periodStart, slip.periodEnd))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
        {/* Phones/tablets have no top-bar breadcrumb, so they get a back link */}
        <Link to="/app/payslips" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary lg:invisible">
          <ArrowLeft className="size-4" /> All payslips
        </Link>
        {/* Browser print dialog lets the employee save as PDF on desktop and phone */}
        <Button size="sm" onClick={() => window.print()} disabled={!slip}>
          <Download className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      {isError ? (
        <EmptyState icon={FileText} title="Payslip not found" />
      ) : isLoading || !slip ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <PayslipView slip={slip} employee={employee} />
      )}
    </div>
  )
}
