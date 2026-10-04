import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Check, LogOut, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { api } from '@/services/api'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/cn'

/** Mirrors aznar-api's newPasswordSchema (routes/azone.ts) so the checklist matches what the server accepts */
const rules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At least one letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { label: 'At least one number', test: (v: string) => /\d/.test(v) },
]

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter the temporary password from HR'),
    newPassword: z.string().refine((v) => rules.every((r) => r.test(v)), 'Meet all the rules below'),
    confirm: z.string(),
  })
  .refine((v) => v.confirm === v.newPassword, { path: ['confirm'], message: "Passwords don't match" })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a password different from the temporary one' })

type FormValues = z.infer<typeof schema>

/**
 * Shown instead of the app after signing in with an HR-issued password (new account or reset).
 * aznar-api also refuses every other AZONE request until this is done.
 */
export function ChangePasswordPage() {
  const session = useAuth((s) => s.session)
  const setSession = useAuth((s) => s.setSession)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  const change = useMutation({
    mutationFn: (v: FormValues) => api.changePassword(v.currentPassword, v.newPassword),
    onSuccess: (s) => {
      setSession(s)
      navigate('/app', { replace: true })
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } })
  const newPassword = watch('newPassword')

  if (!session) return <Navigate to="/login" replace />
  if (!session.mustChangePassword) return <Navigate to="/app" replace />

  return (
    <div className="flex min-h-dvh flex-col items-center bg-bg px-4 py-10">
      <Logo to="/change-password" />
      <div className="card my-auto w-full max-w-md p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Choose a new password</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Welcome, {session.employee.firstName}! You signed in with a temporary password from HR. Please set your own before continuing.
        </p>

        <form onSubmit={handleSubmit((v) => change.mutate(v))} className="mt-6 space-y-4" noValidate>
          <Field label="Temporary password" error={errors.currentPassword?.message}>
            <PasswordInput autoComplete="current-password" placeholder="From HR" {...register('currentPassword')} />
          </Field>
          <Field label="New password" error={errors.newPassword?.message}>
            <PasswordInput autoComplete="new-password" placeholder="Create a password" {...register('newPassword')} />
          </Field>
          <ul className="-mt-1 space-y-1" aria-label="Password requirements">
            {rules.map((r) => {
              const met = r.test(newPassword)
              return (
                <li
                  key={r.label}
                  className={cn('flex items-center gap-2 text-xs font-medium transition-colors', met ? 'text-success' : 'text-muted')}
                >
                  <span className={cn('flex size-4 items-center justify-center rounded-full', met ? 'bg-success text-white' : 'border border-line')}>
                    {met && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {r.label}
                  <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
                </li>
              )
            })}
          </ul>
          <Field label="Confirm new password" error={errors.confirm?.message}>
            <PasswordInput autoComplete="new-password" placeholder="Type it again" {...register('confirm')} />
          </Field>
          {change.isError && <p className="text-sm font-medium text-danger">{change.error.message}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={change.isPending}>
            {change.isPending ? 'Saving…' : 'Save and continue'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  )
}
