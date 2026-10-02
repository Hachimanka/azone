import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BadgeCheck, CalendarClock, CalendarDays, Plus, Receipt, Send, Timer, MessageSquare, ArrowRight } from 'lucide-react'
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
  reimbursement: { label: 'Reimbursement', icon: Receipt, hint: 'Work-related expenses' },
  other: { label: 'Other', icon: MessageSquare, hint: 'Anything else for HR' },
}

const schema = z.object({
  kind: z.enum(['coe', 'schedule_change', 'overtime', 'reimbursement', 'other']),
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
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
              <IconTile icon={kinds[r.kind].icon} />
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
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { kind, details: '' } })

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
        <Field label="Details" error={errors.details?.message}>
          <Textarea placeholder="Purpose, dates, amounts…" {...register('details')} />
        </Field>
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? 'Sending…' : 'Send request'}
        </Button>
      </form>
    </Dialog>
  )
}
