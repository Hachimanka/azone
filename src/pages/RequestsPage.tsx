import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Baby,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  MessageSquare,
  Plus,
  Send,
  Timer,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { IconTile } from '@/components/ui/IconTile'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui/Misc'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useCreateRequest, useLeaveRequests, useRequests } from '@/services/queries'
import type { RequestKind } from '@/services/types'
import { formatDate } from '@/lib/format'

const kinds: Record<RequestKind, { label: string; icon: typeof Send; hint: string }> = {
  coe: { label: 'Certificate of Employment', icon: BadgeCheck, hint: 'For loans, visas and more' },
  overtime: { label: 'Overtime', icon: Timer, hint: 'Rendered extra hours' },
  schedule_change: { label: 'Schedule Change', icon: CalendarClock, hint: 'Shift or rest-day change' },
  maternity_leave: { label: 'Maternity Leave', icon: Baby, hint: '105 days (RA 11210)' },
  paternity_leave: { label: 'Paternity Leave', icon: HandHeart, hint: '7 days (RA 8187)' },
  solo_parent_leave: { label: 'Solo Parent Leave', icon: HeartHandshake, hint: '7 days a year (RA 11861)' },
  study_leave: { label: 'Study Leave', icon: GraduationCap, hint: 'Exams or review, if approved' },
  other: { label: 'Others (specify)', icon: MessageSquare, hint: 'Anything else for HR' },
}

/** Icon for any filed request, including retired types (e.g. old Reimbursement requests) */
const iconFor = (kind: string) => kinds[kind as RequestKind]?.icon ?? FileText

const schema = z.object({
  kind: z.enum(Object.keys(kinds) as [RequestKind, ...RequestKind[]]),
  details: z.string().trim().min(5, 'Please add a few details'),
})

type FormValues = z.infer<typeof schema>

export function RequestsPage() {
  const requests = useRequests()
  const leaves = useLeaveRequests()
  const [kind, setKind] = useState<RequestKind | null>(null)
  const pendingLeaves = leaves.data?.filter((l) => l.status === 'pending').length ?? 0

  return (
    <>
      <PageHeader
        eyebrow="Self-service"
        title="Requests"
        description="Request documents and approvals from HR without the paperwork."
        actions={
          <Button onClick={() => setKind('coe')}>
            <Plus className="size-4" /> New request
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {(Object.keys(kinds) as RequestKind[]).map((k) => {
          const { label, icon, hint } = kinds[k]
          return (
            <button key={k} onClick={() => setKind(k)} className="card card-hover group p-4 text-left">
              <IconTile icon={icon} className="size-10" />
              <p className="mt-3 text-sm font-semibold text-navy">{label}</p>
              <p className="mt-0.5 text-xs text-muted">{hint}</p>
            </button>
          )
        })}
      </div>

      {pendingLeaves > 0 && (
        <Link to="/app/leaves" className="card card-hover group mt-5 flex items-center gap-3 p-4">
          <IconTile icon={CalendarDays} tone="warning" />
          <p className="flex-1 text-sm text-ink">
            You also have <b>{pendingLeaves}</b> pending leave {pendingLeaves === 1 ? 'request' : 'requests'}.
          </p>
          <ArrowRight className="hover-arrow size-4 text-muted transition-transform" />
        </Link>
      )}

      <Card className="mt-5 divide-y divide-line">
        {requests.isLoading ? (
          <Skeleton className="m-5 h-24" />
        ) : !requests.data?.length ? (
          <EmptyState icon={Send} title="No requests yet" />
        ) : (
          requests.data.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 sm:p-5">
              <IconTile icon={iconFor(r.kind)} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{r.title}</p>
                <p className="truncate text-xs text-muted">
                  Filed {formatDate(r.filedAt)} · {r.details}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </Card>

      {kind && <NewRequestDialog kind={kind} onClose={() => setKind(null)} />}
    </>
  )
}

function NewRequestDialog({ kind, onClose }: { kind: RequestKind; onClose: () => void }) {
  const create = useCreateRequest()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { kind, details: '' } })
  const selected = watch('kind')
  const isLeave = selected.endsWith('_leave')

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync(values)
    onClose()
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} title="New request" description="HR will update you through notifications.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Request type">
          <Select {...register('kind')}>
            {Object.entries(kinds).map(([value, k]) => (
              <option key={value} value={value}>
                {k.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={selected === 'other' ? 'Please specify' : 'Details'} error={errors.details?.message}>
          <Textarea
            placeholder={
              selected === 'other' ? 'What do you need from HR?' : isLeave ? 'Start and end dates, and anything HR should know…' : 'Purpose, dates…'
            }
            {...register('details')}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? 'Sending…' : 'Send request'}
        </Button>
      </form>
    </Dialog>
  )
}
