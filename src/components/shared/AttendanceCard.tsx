import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Clock3, Clock9, Clock12, Clock4, type LucideIcon } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Misc'
import { usePunch, useToday } from '@/services/queries'
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

export function AttendanceCard({ showDtrLink = true }: { showDtrLink?: boolean }) {
  const { data: today, isLoading } = useToday()
  const punch = usePunch()
  const next = today ? rows.find((r) => today[r.key] === null) : undefined

  return (
    <Card className="p-5 sm:p-6">
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
              <Icon className={cn('size-[18px]', next?.key === key ? 'text-primary' : 'text-ink/70')} />
              {label}
            </span>
            {isLoading ? <Skeleton className="h-4 w-16" /> : <span className="font-semibold text-navy">{formatTime(today?.[key] ?? null)}</span>}
          </li>
        ))}
      </ul>

      <div className={cn('mt-4 grid gap-3', showDtrLink && 'grid-cols-2')}>
        <Button disabled={!next || punch.isPending} onClick={() => next && punch.mutate(next.key)}>
          {punch.isPending ? 'Saving…' : next ? next.label : 'Done for today'}
        </Button>
        {showDtrLink && (
          <Link to="/app/dtr" className={buttonVariants({ variant: 'outline' })}>
            View DTR
          </Link>
        )}
      </div>
      {punch.isError && <p className="mt-2 text-xs font-medium text-danger">{punch.error.message}</p>}
    </Card>
  )
}
