import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, ChevronDown, Clock, Mail, Megaphone, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Misc'
import { AttendanceCard } from '@/components/shared/AttendanceCard'
import { PayslipSummary } from '@/components/shared/PayslipSummary'
import { AnnouncementCard } from '@/components/shared/AnnouncementCard'
import { useAuth } from '@/store/auth'
import { useAnnouncements, useAttendanceSummary, useLeaveBalances, useLeaveRequests, usePayslips, useRequests } from '@/services/queries'
import { formatPeso, greeting } from '@/lib/format'

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
}

export function DashboardPage() {
  const employee = useAuth((s) => s.session?.employee)
  const payslips = usePayslips()
  const summary = useAttendanceSummary()
  const balances = useLeaveBalances()
  const leaves = useLeaveRequests()
  const requests = useRequests()
  const announcements = useAnnouncements()

  const latest = payslips.data?.[0]
  const vacation = balances.data?.find((b) => b.type === 'vacation')
  const pending =
    (leaves.data?.filter((l) => l.status === 'pending').length ?? 0) + (requests.data?.filter((r) => r.status === 'pending').length ?? 0)
  const shortPeriod = latest ? `${format(new Date(latest.periodStart), 'MMM d')}–${format(new Date(latest.periodEnd), 'd')}` : ''

  const stats = [
    {
      icon: Wallet,
      label: 'Current Pay',
      value: latest ? formatPeso(latest.net) : null,
      hint: shortPeriod ? `Net pay (${shortPeriod})` : 'Net pay',
      to: latest ? `/app/payslips/${latest.id}` : '/app/payslips',
    },
    {
      icon: Clock,
      label: 'Attendance',
      value: summary.data ? (
        <>
          {summary.data.presentDays} <span className="text-muted/80">/</span> {summary.data.workingDays}{' '}
          <span className="text-base font-semibold">days</span>
        </>
      ) : null,
      hint: 'Present this month',
      to: '/app/dtr',
    },
    {
      icon: CalendarDays,
      label: 'Leave Balance',
      value: vacation ? (
        <>
          {vacation.available} <span className="text-base font-semibold">days</span>
        </>
      ) : null,
      hint: 'Vacation leave',
      to: '/app/leaves',
    },
    { icon: Mail, label: 'Pending Requests', value: leaves.data && requests.data ? pending : null, hint: 'Leave / Other', to: '/app/requests' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{greeting()},</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {employee?.fullName}{' '}
            <motion.span
              className="inline-block origin-[70%_70%]"
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 1.6, delay: 0.4 }}
              aria-hidden
            >
              👋
            </motion.span>
          </h1>
          <p className="mt-1.5 text-sm text-ink">Here's your work overview for today.</p>
        </div>
        <Link
          to="/app/dtr"
          className="card inline-flex items-center gap-2.5 self-start px-4 py-2.5 text-sm font-medium text-ink transition hover:border-primary-200 hover:text-primary max-sm:w-full"
        >
          <CalendarDays className="size-4 text-primary" />
          Today, {format(new Date(), 'MMMM d, yyyy')}
          <ChevronDown className="ml-auto size-4 text-muted sm:ml-6" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={rise} initial="hidden" animate="show">
            <StatCard {...s} tone="primary" value={s.value ?? <Skeleton className="mt-1 h-7 w-24" />} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <motion.div custom={4} variants={rise} initial="hidden" animate="show">
          <AttendanceCard />
        </motion.div>
        <motion.div custom={5} variants={rise} initial="hidden" animate="show" className="flex [&>*]:flex-1">
          <PayslipSummary />
        </motion.div>
      </div>

      <motion.div custom={6} variants={rise} initial="hidden" animate="show">
        <Card className="p-5 sm:p-6">
          <CardHeader icon={Megaphone} title="Latest Announcements" viewAllTo="/app/announcements" />
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {announcements.isLoading
              ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-48" />)
              : announcements.data?.slice(0, 3).map((a) => <AnnouncementCard key={a.id} item={a} />)}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
