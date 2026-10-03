import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Clock3, Clock9, Clock12, Clock4, Fingerprint, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Misc'
import { useToday } from '@/services/queries'
import type { AttendanceStatus, PunchKind } from '@/services/types'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const rows: { key: PunchKind; label: string; icon: LucideIcon }[] = [
  { key: 'timeIn', label: 'Time In', icon: Clock9 },
  { key: 'breakOut', label: 'Break Out', icon: Clock12 },
  { key: 'breakIn', label: 'Break In', icon: Clock3 },
  { key: 'timeOut', label: 'Time Out', icon: Clock4 },
]

export const statusTone: Record<AttendanceStatus, BadgeTone> = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  leave: 'violet',
  rest: 'neutral',
  holiday: 'primary',
}

/** View-only: punches are recorded through APAY, AZONE just shows them. */
export function AttendanceCard({ showAttendanceLink = true }: { showAttendanceLink?: boolean }) {
  const { data: today, isLoading } = useToday()

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <CardHeader
        icon={Clock}
        title="Today's Attendance"
        action={
          today && (
            <Link to="/app/dtr" className="group inline-flex items-center gap-1.5">
              <Badge tone={today.timeIn ? statusTone[today.status] : 'neutral'}>{today.timeIn ? today.status : 'Not yet in'}</Badge>
              <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          )
        }
      />

      <ul className="mt-4 divide-y divide-line">
        {rows.map(({ key, label, icon: Icon }) => (
          <li key={key} className="grid grid-cols-2 items-center py-3 text-sm">
            <span className="flex items-center gap-3 text-muted">
              <Icon className="size-[18px] text-ink/70" />
              {label}
            </span>
            {isLoading ? <Skeleton className="h-4 w-16" /> : <span className="font-semibold text-navy">{formatTime(today?.[key] ?? null)}</span>}
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-bg px-3.5 py-3 text-xs leading-relaxed text-muted">
        <Fingerprint className="mt-px size-4 shrink-0 text-primary" />
        Time in and time out are recorded through APAY. Times here update once your punches sync.
      </p>

      {showAttendanceLink && (
        <Link to="/app/dtr" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 w-full')}>
          View Attendance
        </Link>
      )}
    </Card>
  )
}
