import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { api } from '@/services/api'

const RESEND_COOLDOWN_S = 60
const schema = z.object({ email: z.email('Enter your work email') })

/**
 * "Forgot password?" in the style of aznar-fleetwatch. There is no email service: the request goes to HR,
 * who issue a temporary password in APAY. The confirmation reads the same whether or not the account
 * exists, so this screen can't be used to discover valid emails.
 */
export function ForgotPasswordForm({ initialEmail, onBack }: { initialEmail: string; onBack: () => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const send = useMutation({
    mutationFn: (email: string) => api.requestPasswordReset(email),
    onSuccess: (_, email) => {
      setSentTo(email)
      setCooldown(RESEND_COOLDOWN_S)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: initialEmail } })

  const back = (
    <button type="button" onClick={onBack} className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary">
      <ArrowLeft className="size-4" /> Back to sign in
    </button>
  )

  if (sentTo) {
    return (
      <div>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-50 text-success">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Request sent</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          If <b className="font-semibold break-all text-navy">{sentTo}</b> belongs to an AZone account, HR has been notified. They'll give you a
          temporary password. Use it to sign in.
        </p>
        <p className="mt-4 rounded-xl bg-primary-50 p-3 text-xs leading-relaxed text-primary">
          Haven't heard back? Visit or call the HR office. Your request stays in their queue until it's handled.
        </p>
        {send.isError && <p className="mt-4 text-sm font-medium text-danger">{send.error.message}</p>}
        <Button variant="outline" size="lg" className="mt-6 w-full" onClick={() => send.mutate(sentTo)} disabled={send.isPending || cooldown > 0}>
          {send.isPending ? 'Sending…' : cooldown > 0 ? `Send again in ${cooldown}s` : 'Send again'}
        </Button>
        {back}
      </div>
    )
  }

  return (
    <div>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
        <KeyRound className="size-6" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">Enter your work email and we'll ask HR to issue you a temporary password.</p>

      <form onSubmit={handleSubmit((v) => send.mutate(v.email.trim()))} className="mt-8 space-y-4" noValidate>
        <Field label="Work email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <Input type="email" autoComplete="username" placeholder="you@aznar.com" autoFocus className="pl-10" {...register('email')} />
          </div>
        </Field>
        {send.isError && <p className="text-sm font-medium text-danger">{send.error.message}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={send.isPending}>
          {send.isPending ? 'Sending…' : 'Send request'}
        </Button>
      </form>
      {back}
    </div>
  )
}
