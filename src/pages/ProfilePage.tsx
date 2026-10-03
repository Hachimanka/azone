import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { BriefcaseBusiness, Camera, IdCard, ImagePlus, Pencil, Phone, ShieldCheck, Trash2, UserRound } from 'lucide-react'
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
import { squareImageDataUrl } from '@/lib/image'

export function ProfilePage() {
  const employee = useAuth((s) => s.session?.employee)
  const [editing, setEditing] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(false)
  if (!employee) return null

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary via-primary-400 to-primary-700 sm:h-36" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <button
              type="button"
              onClick={() => setEditingPhoto(true)}
              className="group relative self-start rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200"
              aria-label={employee.avatarUrl ? 'Change profile picture' : 'Add profile picture'}
            >
              <Avatar name={employee.fullName} src={employee.avatarUrl} className="size-24 text-2xl ring-8 ring-surface" />
              <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-lift ring-4 ring-surface transition group-hover:scale-110 group-hover:bg-primary-600">
                <Camera className="size-4" />
              </span>
            </button>
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

      {/* grid-cols-1 = minmax(0,1fr): cards can shrink to the screen instead of growing to fit long values */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
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
      {editingPhoto && <ProfilePhotoDialog employee={employee} onClose={() => setEditingPhoto(false)} />}
    </>
  )
}

function Section({ icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader icon={icon} title={title} />
      <dl className="mt-3 divide-y divide-line">{children}</dl>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3 text-sm sm:grid-cols-[130px_minmax(0,1fr)]">
      <dt className="text-muted">{label}</dt>
      {/* overflow-wrap:anywhere lets long unbroken values (emails) wrap instead of widening the card */}
      <dd className="font-medium text-navy [overflow-wrap:anywhere]">
        {/* Emails get a preferred break before "@" so they wrap as name / @domain, not mid-word */}
        {value.includes('@') ? (
          <>
            {value.slice(0, value.indexOf('@'))}
            <wbr />
            {value.slice(value.indexOf('@'))}
          </>
        ) : (
          value
        )}
      </dd>
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

function ProfilePhotoDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const setEmployee = useAuth((s) => s.setEmployee)
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const done = (e: Employee) => {
    setEmployee(e)
    onClose()
  }
  const save = useMutation({ mutationFn: api.setAvatar, onSuccess: done, onError: (e) => setError(e.message) })
  const remove = useMutation({ mutationFn: api.removeAvatar, onSuccess: done, onError: (e) => setError(e.message) })
  const busy = save.isPending || remove.isPending

  const choose = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      setPreview(await squareImageDataUrl(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      if (input.current) input.current.value = '' // allow picking the same file again
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title="Profile picture"
      description="Shown on your profile and in the top bar. Use a clear photo of your face."
      footer={
        preview ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPreview(null)} disabled={busy}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => save.mutate(preview)} disabled={busy}>
              {save.isPending ? 'Saving…' : 'Save photo'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            {employee.avatarUrl && (
              <Button
                variant="outline"
                className="flex-1 text-danger hover:border-danger hover:bg-danger-50"
                onClick={() => remove.mutate()}
                disabled={busy}
              >
                <Trash2 className="size-4" /> {remove.isPending ? 'Removing…' : 'Remove'}
              </Button>
            )}
            <Button className="flex-1" onClick={() => input.current?.click()} disabled={busy}>
              <ImagePlus className="size-4" /> {employee.avatarUrl ? 'Change photo' : 'Choose photo'}
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center py-2">
        <Avatar name={employee.fullName} src={preview ?? employee.avatarUrl} className="size-40 text-5xl ring-8 ring-primary-50" />
        <p className="mt-4 text-center text-sm text-muted">
          {preview ? 'This is how your new photo will look.' : 'JPG, PNG or WebP. It will be cropped to a square.'}
        </p>
        {error && <p className="mt-2 text-center text-sm font-medium text-danger">{error}</p>}
      </div>
      {/* capture is left off so phones offer both camera and gallery */}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
    </Dialog>
  )
}
