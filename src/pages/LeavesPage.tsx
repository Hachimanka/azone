import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarDays, CalendarPlus, HeartPulse, Cake, Siren, Palmtree } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { IconTile, type Tone } from '@/components/ui/IconTile'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui/Misc'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useFileLeave, useLeaveBalances, useLeaveRequests } from '@/services/queries'
import type { LeaveType } from '@/services/types'
import { formatDate } from '@/lib/format'

const leaveMeta: Record<LeaveType, { icon: typeof Palmtree; tone: Tone; label: string }> = {
  vacation: { icon: Palmtree, tone: 'primary', label: 'Vacation Leave' },
  sick: { icon: HeartPulse, tone: 'danger', label: 'Sick Leave' },
  emergency: { icon: Siren, tone: 'warning', label: 'Emergency Leave' },
  birthday: { icon: Cake, tone: 'violet', label: 'Birthday Leave' },
}

const schema = z
  .object({
    type: z.enum(['vacation', 'sick', 'emergency', 'birthday']),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    reason: z.string().trim().min(3, 'Tell us briefly why'),
  })
  .refine((v) => v.endDate >= v.startDate, { path: ['endDate'], message: 'End date must be on or after the start date' })

type FormValues = z.infer<typeof schema>

export function LeavesPage() {
  const balances = useLeaveBalances()
  const leaves = useLeaveRequests()
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeader
        eyebrow="Time off"
        title="Leaves"
        description="Approved leaves are reflected automatically in your payroll."
        actions={
          <Button onClick={() => setOpen(true)}>
            <CalendarPlus className="size-4" /> File a leave
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {balances.isLoading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)
          : balances.data?.map((b) => {
              const meta = leaveMeta[b.type]
              const pct = b.total ? (b.available / b.total) * 100 : 0
              return (
                <Card key={b.type} className="card-hover p-4 sm:p-5">
                  <IconTile icon={meta.icon} tone={meta.tone} className="size-9 sm:size-11" />
                  <p className="mt-3 text-xs font-medium text-muted sm:text-sm">{b.label}</p>
                  <p className="mt-1 text-xl font-bold text-navy sm:text-2xl">
                    {b.available} <span className="text-sm font-semibold text-muted">/ {b.total} days</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-50">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </Card>
              )
            })}
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <CardHeader icon={CalendarDays} title="My Leave Requests" />
        <div className="mt-4 divide-y divide-line">
          {leaves.isLoading ? (
            <Skeleton className="h-24" />
          ) : !leaves.data?.length ? (
            <EmptyState icon={CalendarDays} title="No leave requests yet" />
          ) : (
            leaves.data.map((l) => {
              const meta = leaveMeta[l.type]
              return (
                <div key={l.id} className="flex items-center gap-4 py-4">
                  <IconTile icon={meta.icon} tone={meta.tone} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy">
                      {meta.label} · {l.days} {l.days === 1 ? 'day' : 'days'}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {l.startDate === l.endDate ? formatDate(l.startDate) : `${formatDate(l.startDate, 'MMM d')} – ${formatDate(l.endDate)}`} ·{' '}
                      {l.reason}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              )
            })
          )}
        </div>
      </Card>

      <FileLeaveDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

function FileLeaveDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const fileLeave = useFileLeave()
  const today = format(new Date(), 'yyyy-MM-dd')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: 'vacation', startDate: today, endDate: today, reason: '' } })

  const onSubmit = handleSubmit(async (values) => {
    await fileLeave.mutateAsync(values)
    reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="File a leave" description="Your manager will be notified right away.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Leave type" error={errors.type?.message}>
          <Select {...register('type')}>
            {Object.entries(leaveMeta).map(([value, m]) => (
              <option key={value} value={value}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" error={errors.startDate?.message}>
            <Input type="date" {...register('startDate')} />
          </Field>
          <Field label="To" error={errors.endDate?.message}>
            <Input type="date" {...register('endDate')} />
          </Field>
        </div>
        <Field label="Reason" error={errors.reason?.message}>
          <Textarea placeholder="e.g. Family trip" {...register('reason')} />
        </Field>
        <Button type="submit" className="w-full" disabled={fileLeave.isPending}>
          {fileLeave.isPending ? 'Submitting…' : 'Submit leave'}
        </Button>
      </form>
    </Dialog>
  )
}
