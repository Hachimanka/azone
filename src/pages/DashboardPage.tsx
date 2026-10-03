import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, ChevronDown, Clock, Mail, Megaphone, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Misc'
import { AttendanceCard } from '@/components/shared/AttendanceCard'
import { PayslipSummary } from '@/components/shared/PayslipSummary'
import { AnnouncementBanner, AnnouncementCard } from '@/components/shared/AnnouncementCard'
import { Dialog } from '@/components/ui/Dialog'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Announcement } from '@/services/types'
import { useAuth } from '@/store/auth'
import { useAnnouncements, useAttendanceSummary, useLeaveBalances, useLeaveRequests, usePayslips, useRequests } from '@/services/queries'
import { formatDate, greeting } from '@/lib/format'

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
  // Keep the last-opened announcement after closing so the dialog content stays put during its exit animation
  const [openAnnouncement, setOpenAnnouncement] = useState<Announcement | null>(null)
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const showAnnouncement = (a: Announcement) => {
    setOpenAnnouncement(a)
    setAnnouncementOpen(true)
  }
  const latestAnnouncements = announcements.data?.slice(0, 4) ?? []

  const latest = payslips.data?.[0]
  const vacation = balances.data?.find((b) => b.type === 'vacation')
  const pending =
    (leaves.data?.filter((l) => l.status === 'pending').length ?? 0) + (requests.data?.filter((r) => r.status === 'pending').length ?? 0)
  const shortPeriod = latest ? `${format(new Date(latest.periodStart), 'MMM d')}–${format(new Date(latest.periodEnd), 'd')}` : ''

  const stats = [
    {
      // No amount here: the dashboard is often on screen in shared spaces, so pay stays one tap away.
      icon: Wallet,
      label: 'Latest Payslip',
      value: latest ? shortPeriod : payslips.isSuccess ? '—' : null,
      hint: latest
        ? latest.status === 'released'
          ? `Updated ${formatDate(latest.payDate, 'MMM d')} · tap to view`
          : 'Processing'
        : 'No payslips yet',
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

      <motion.div custom={0} variants={rise} initial="hidden" animate="show">
        {/* Warm tint so announcements stand out from the blue-and-white cards, while text stays dark and readable. */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/70 to-white p-4 dark:border-amber-500/25 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-surface shadow-[0_14px_36px_-20px_rgb(217_119_6/0.45)] sm:p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/15"
          />

          <div className="relative flex items-center justify-between gap-3">
            <h2 className="flex min-w-0 items-center gap-2.5 text-base font-bold text-navy">
              <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_14px_-6px_rgb(234_88_12/0.7)]">
                <Megaphone className="size-5 -rotate-12" strokeWidth={2.2} />
                {latestAnnouncements.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-3">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full bg-rose-500 ring-2 ring-amber-50 dark:ring-surface" />
                  </span>
                )}
              </span>
              Latest Announcements
            </h2>
            <Link
              to="/app/announcements"
              className="group inline-flex shrink-0 items-center gap-1 rounded-full whitespace-nowrap bg-surface px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-amber-200 dark:text-amber-300 dark:ring-amber-500/30 transition hover:bg-orange-500 hover:text-white hover:ring-orange-500 sm:text-sm"
            >
              View All
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Two per row on phones (2 × 2), four across on wide screens. */}
          <div className="relative mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {announcements.isLoading
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[68px] bg-amber-100/70 sm:h-44 dark:bg-amber-500/10" />)
              : latestAnnouncements.map((a) => <AnnouncementCard key={a.id} item={a} onOpen={showAnnouncement} compact />)}
          </div>
          {announcements.isSuccess && latestAnnouncements.length === 0 && (
            <p className="relative mt-4 text-sm text-muted">No announcements right now.</p>
          )}
        </section>
      </motion.div>

      <Dialog
        open={announcementOpen}
        onOpenChange={setAnnouncementOpen}
        title={openAnnouncement?.title ?? 'Announcement'}
        description={openAnnouncement ? `${formatDate(openAnnouncement.publishedAt, 'MMMM d, yyyy')} · ${openAnnouncement.author}` : undefined}
        header={openAnnouncement && <AnnouncementBanner item={openAnnouncement} />}
        footer={
          openAnnouncement && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAnnouncementOpen(false)}>
                Close
              </Button>
              <Link to={`/app/announcements/${openAnnouncement.id}`} className={cn(buttonVariants(), 'flex-1')}>
                Open full page <ArrowRight className="size-4" />
              </Link>
            </div>
          )
        }
      >
        {openAnnouncement && (
          <div className="space-y-4 text-[15px] leading-relaxed text-ink">
            {openAnnouncement.body.split('\n\n').map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>
        )}
      </Dialog>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={rise} initial="hidden" animate="show">
            <StatCard {...s} tone="primary" value={s.value ?? <Skeleton className="mt-1 h-7 w-24" />} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <motion.div custom={5} variants={rise} initial="hidden" animate="show">
          <AttendanceCard />
        </motion.div>
        <motion.div custom={6} variants={rise} initial="hidden" animate="show" className="flex [&>*]:flex-1">
          <PayslipSummary />
        </motion.div>
      </div>
    </div>
  )
}
