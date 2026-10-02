import { useState } from 'react'
import { addMonths, format, parseISO } from 'date-fns'
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui/Misc'
import { StatCard } from '@/components/ui/StatCard'
import { AttendanceCard, statusTone } from '@/components/shared/AttendanceCard'
import { useAttendanceMonth, useAttendanceSummary } from '@/services/queries'
import { formatTime } from '@/lib/format'

export function DtrPage() {
  const [month, setMonth] = useState(() => new Date())
  const key = format(month, 'yyyy-MM')
  const { data, isLoading } = useAttendanceMonth(key)
  const summary = useAttendanceSummary()
  const isCurrent = key === format(new Date(), 'yyyy-MM')
  const days = [...(data ?? [])].reverse()

  return (
    <>
      <PageHeader eyebrow="Time & Attendance" title="Daily Time Record" description="Punches are synced to APAY for payroll computation." />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,380px)_1fr]">
        <div className="space-y-5">
          <AttendanceCard showDtrLink={false} />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={CalendarCheck} label="Present" value={summary.data?.presentDays ?? '—'} hint="This month" to="/app/dtr" />
            <StatCard icon={TriangleAlert} tone="warning" label="Late" value={summary.data?.lateCount ?? '—'} hint="This month" to="/app/dtr" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-navy">
              <Clock className="size-5 text-primary" /> {format(month, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))}>
                <ChevronLeft className="size-5" />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Next month" disabled={isCurrent} onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : days.length === 0 ? (
            <EmptyState icon={Clock} title="No records yet" description="Your punches for this month will show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-bg text-left text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-3 py-3">Time In</th>
                    <th className="px-3 py-3">Break Out</th>
                    <th className="px-3 py-3">Break In</th>
                    <th className="px-3 py-3">Time Out</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {days.map((d) => (
                    <tr key={d.date} className="transition hover:bg-primary-50/50">
                      <td className="px-5 py-3 font-semibold text-navy">{format(parseISO(d.date), 'EEE, MMM d')}</td>
                      <td className="px-3 py-3 text-ink">{formatTime(d.timeIn)}</td>
                      <td className="px-3 py-3 text-ink">{formatTime(d.breakOut)}</td>
                      <td className="px-3 py-3 text-ink">{formatTime(d.breakIn)}</td>
                      <td className="px-3 py-3 text-ink">{formatTime(d.timeOut)}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge size="sm" tone={statusTone[d.status]}>
                          {d.status === 'rest' ? 'Rest day' : d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
