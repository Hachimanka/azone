import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { BriefcaseBusiness, IdCard, Pencil, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input } from '@/components/ui/Field'
import { useAuth } from '@/store/auth'
import { api } from '@/services/api'
import type { Employee } from '@/services/types'
import { formatDate } from '@/lib/format'

export function ProfilePage() {
  const employee = useAuth((s) => s.session?.employee)
  const [editing, setEditing] = useState(false)
  if (!employee) return null

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary via-primary-400 to-primary-700 sm:h-36" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar name={employee.fullName} className="size-24 text-2xl ring-8 ring-white" />
            <div>
              <h1 className="text-2xl font-bold">{employee.fullName}</h1>
              <p className="text-sm text-muted">
                {employee.position} · {employee.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="success" size="sm">
              {employee.employmentType}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-4" /> Edit contact
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section icon={BriefcaseBusiness} title="Employment">
          <Row label="Employee No." value={employee.employeeNo} />
          <Row label="Position" value={employee.position} />
          <Row label="Department" value={employee.department} />
          <Row label="Immediate Head" value={employee.manager} />
          <Row label="Date Hired" value={formatDate(employee.dateHired, 'MMMM d, yyyy')} />
          <Row label="Schedule" value={employee.workSchedule} />
        </Section>
        <Section icon={UserRound} title="Personal & Contact">
          <Row label="Email" value={employee.email} />
          <Row label="Mobile" value={employee.phone} />
          <Row label="Address" value={employee.address} />
          <Row label="Birthday" value={formatDate(employee.birthday, 'MMMM d')} />
        </Section>
        <Section icon={IdCard} title="Government IDs">
          <Row label="SSS" value={employee.govIds.sss} />
          <Row label="PhilHealth" value={employee.govIds.philhealth} />
          <Row label="Pag-IBIG" value={employee.govIds.pagibig} />
          <Row label="TIN" value={employee.govIds.tin} />
          <p className="flex items-center gap-2 pt-3 text-xs text-muted">
            <ShieldCheck className="size-4 text-success" /> Masked for your security. Contact HR to update.
          </p>
        </Section>
        <Section icon={Phone} title="Emergency Contact">
          <Row label="Name" value={employee.emergencyContact.name} />
          <Row label="Relationship" value={employee.emergencyContact.relation} />
          <Row label="Phone" value={employee.emergencyContact.phone} />
        </Section>
      </div>

      {editing && <EditContactDialog employee={employee} onClose={() => setEditing(false)} />}
    </>
  )
}

function Section({ icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader icon={icon} title={title} />
      <dl className="mt-3 divide-y divide-line">{children}</dl>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium break-words text-navy">{value}</dd>
    </div>
  )
}

const schema = z.object({
  phone: z.string().trim().min(7, 'Enter a valid number'),
  address: z.string().trim().min(5, 'Enter your address'),
  emergencyContact: z.object({
    name: z.string().trim().min(2, 'Required'),
    relation: z.string().trim().min(2, 'Required'),
    phone: z.string().trim().min(7, 'Enter a valid number'),
  }),
})

type FormValues = z.infer<typeof schema>

function EditContactDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const setEmployee = useAuth((s) => s.setEmployee)
  const save = useMutation({ mutationFn: api.updateContact, onSuccess: setEmployee })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: employee.phone, address: employee.address, emergencyContact: employee.emergencyContact },
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} title="Edit contact details">
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (v) => {
          await save.mutateAsync(v)
          onClose()
        })}
      >
        <Field label="Mobile" error={errors.phone?.message}>
          <Input {...register('phone')} inputMode="tel" />
        </Field>
        <Field label="Address" error={errors.address?.message}>
          <Input {...register('address')} />
        </Field>
        <p className="pt-2 text-xs font-bold uppercase tracking-wider text-muted">Emergency contact</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" error={errors.emergencyContact?.name?.message}>
            <Input {...register('emergencyContact.name')} />
          </Field>
          <Field label="Relationship" error={errors.emergencyContact?.relation?.message}>
            <Input {...register('emergencyContact.relation')} />
          </Field>
        </div>
        <Field label="Phone" error={errors.emergencyContact?.phone?.message}>
          <Input {...register('emergencyContact.phone')} inputMode="tel" />
        </Field>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Dialog>
  )
}
