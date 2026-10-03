import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { ArrowLeft, CalendarDays, Clock, FileText, Lock, Mail } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { api, isMockApi } from '@/services/api'
import { useAuth } from '@/store/auth'

const schema = z.object({
  email: z.email('Enter your work email'),
  password: z.string().min(6, 'At least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const session = useAuth((s) => s.session)
  const setSession = useAuth((s) => s.setSession)
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app'

  const login = useMutation({
    mutationFn: (v: FormValues) => api.login(v.email, v.password),
    onSuccess: (s) => {
      setSession(s)
      navigate(from, { replace: true })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isMockApi ? { email: 'leonard.forrosuelo@aznar.com', password: 'demo1234' } : undefined,
  })

  if (session) return <Navigate to="/app" replace />

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-700 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5" />
        <p className="relative flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <LogoMark className="size-11 rounded-full ring-2 ring-white/40" />
          Zone
        </p>
        <div className="relative mx-auto my-auto w-full max-w-lg">
          <h2 className="text-4xl leading-tight font-bold text-white">Everything about your work, in one place.</h2>
          <p className="mt-4 text-white/80">Payslips, attendance, leaves and company news — on your desk or in your pocket.</p>

          {/* Product preview: payslip card with two status chips pinned to its corners */}
          <div className="relative mt-14 px-6 pb-8">
            <motion.div
              className="card p-6 text-navy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="flex items-center gap-2 font-bold">
                <FileText className="size-5 text-primary" /> Recent Payslip
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
                September 16 – 30, 2026
                <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success uppercase">Released</span>
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-bg p-4">
                {[
                  ['Gross Pay', '₱28,500'],
                  ['Deductions', '₱4,000'],
                  ['Net Pay', '₱24,500'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-0.5 font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.div
              className="card absolute -top-7 right-0 flex items-center gap-3 p-3 pr-5 text-navy shadow-float"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary">
                <CalendarDays className="size-4" />
              </span>
              <span>
                <span className="block text-[11px] text-muted">Leave balance</span>
                <span className="block text-sm font-bold">8 days</span>
              </span>
            </motion.div>

            <motion.div
              className="card absolute bottom-0 left-0 flex items-center gap-3 p-3 pr-5 text-navy shadow-float"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-success-50 text-success">
                <Clock className="size-4" />
              </span>
              <span>
                <span className="block text-[11px] text-muted">Timed in</span>
                <span className="block text-sm font-bold">8:03 AM · Present</span>
              </span>
            </motion.div>
          </div>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Aznar. All rights reserved.</p>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-muted hover:text-primary">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <Logo to="/" />
          <h1 className="mt-10 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in with your Aznar account.</p>

          <form onSubmit={handleSubmit((v) => login.mutate(v))} className="mt-8 space-y-4">
            <Field label="Work email" error={errors.email?.message}>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <Input type="email" autoComplete="username" className="pl-10" {...register('email')} />
              </div>
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <Input type="password" autoComplete="current-password" className="pl-10" {...register('password')} />
              </div>
            </Field>
            {login.isError && <p className="text-sm font-medium text-danger">{login.error.message}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          {isMockApi && (
            <p className="mt-6 rounded-xl bg-primary-50 p-3 text-center text-xs text-primary">Demo mode: any email and password works.</p>
          )}
        </div>
      </div>
    </div>
  )
}
