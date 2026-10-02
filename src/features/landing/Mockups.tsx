import { CalendarDays, Clock, FileText, House, Mail, Megaphone, Send, UserRound, Wallet, Ellipsis, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'

/* Static, scaled-down replicas of the real dashboard used as product shots. */

const stats = [
  { icon: Wallet, label: 'Current Pay', value: '₱24,500', hint: 'Net pay (Sep 16–30)' },
  { icon: Clock, label: 'Attendance', value: '12 / 22 days', hint: 'Present' },
  { icon: CalendarDays, label: 'Leave Balance', value: '8 days', hint: 'Vacation leave' },
  { icon: Mail, label: 'Pending Requests', value: '2', hint: 'Leave / Other' },
]

const punches = [
  ['Time In', '8:03 AM'],
  ['Break Out', '12:00 PM'],
  ['Break In', '1:00 PM'],
  ['Time Out', '--'],
]

export function DesktopMockup({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-white shadow-float', className)}>
      <div className="flex items-center gap-1.5 border-b border-line bg-bg px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-4 rounded-md bg-white px-3 py-0.5 text-[10px] text-muted">azone.aznar.com</span>
      </div>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="flex items-center gap-3">
          <span className="text-base font-extrabold text-primary">AZNAR</span>
          <span className="text-[10px] text-muted">Employee Platform</span>
        </span>
        <span className="flex items-center gap-3">
          <Bell className="size-3.5 text-ink" />
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">LF</span>
        </span>
      </div>
      <div className="flex">
        <div className="hidden w-32 shrink-0 space-y-1 border-r border-line p-3 sm:block">
          {[House, UserRound, FileText, CalendarDays, Clock, Send, Megaphone].map((Icon, i) => (
            <div key={i} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5', i === 0 ? 'bg-primary text-white' : 'text-ink')}>
              <Icon className="size-3" />
              <span className="h-1.5 w-12 rounded-full bg-current opacity-30" />
            </div>
          ))}
        </div>
        <div className="flex-1 bg-bg p-4">
          <p className="text-[8px] font-semibold tracking-wider text-muted uppercase">Good morning,</p>
          <p className="text-sm font-bold text-navy">Leonard Forrosuelo 👋</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-line bg-white p-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-50 text-primary">
                  <Icon className="size-2.5" />
                </span>
                <p className="mt-1.5 text-[7px] text-muted">{label}</p>
                <p className="text-[10px] font-bold text-navy">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-white p-2.5">
              <p className="flex items-center justify-between text-[9px] font-bold text-navy">
                Today's Attendance <span className="rounded-full bg-success-50 px-1.5 text-[7px] text-success">PRESENT</span>
              </p>
              {punches.map(([l, v]) => (
                <p key={l} className="mt-1.5 flex justify-between text-[7.5px]">
                  <span className="text-muted">{l}</span>
                  <span className="font-semibold text-navy">{v}</span>
                </p>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-1">
                <span className="rounded bg-primary py-1 text-center text-[7px] font-semibold text-white">Time Out</span>
                <span className="rounded border border-primary-200 py-1 text-center text-[7px] font-semibold text-primary">View DTR</span>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-white p-2.5">
              <p className="text-[9px] font-bold text-navy">Recent Payslip</p>
              <p className="mt-1.5 text-[8px] font-semibold text-navy">September 16 – 30, 2026</p>
              <div className="mt-2 grid grid-cols-3 rounded bg-bg p-1.5">
                {[
                  ['Gross', '₱28,500'],
                  ['Deduct.', '₱4,000'],
                  ['Net', '₱24,500'],
                ].map(([l, v]) => (
                  <span key={l}>
                    <span className="block text-[6.5px] text-muted">{l}</span>
                    <span className="block text-[8.5px] font-bold text-navy">{v}</span>
                  </span>
                ))}
              </div>
              <span className="mt-2 block rounded bg-primary-50 py-1 text-center text-[7px] font-semibold text-primary">View Payslip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[2.4rem] bg-navy p-2 shadow-float', className)}>
      <div className="relative overflow-hidden rounded-[2rem] bg-bg">
        <div className="absolute top-2 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-navy" />
        <div className="flex justify-between px-5 pt-2.5 text-[9px] font-semibold text-navy">
          <span>9:41</span>
          <span>●●●</span>
        </div>
        <div className="flex items-center justify-between px-4 pt-4">
          <span>
            <span className="block text-sm font-extrabold text-primary">AZNAR</span>
            <span className="block text-[7px] text-muted">Employee Platform</span>
          </span>
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">LF</span>
        </div>
        <div className="px-4 pt-3">
          <p className="text-[7px] text-muted">Good morning,</p>
          <p className="text-[11px] font-bold text-navy">Leonard Forrosuelo 👋</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-3">
          {stats.map(({ icon: Icon, label, value, hint }) => (
            <div key={label} className="rounded-lg border border-line bg-white p-2">
              <Icon className="size-3 text-primary" />
              <p className="mt-1 text-[6.5px] text-muted">{label}</p>
              <p className="text-[10px] font-bold text-navy">{value}</p>
              <p className="text-[5.5px] text-muted">{hint}</p>
            </div>
          ))}
        </div>
        <div className="mx-3 rounded-lg border border-line bg-white p-2">
          <p className="flex items-center justify-between text-[8px] font-bold text-navy">
            Today's Attendance <span className="rounded-full bg-success-50 px-1 text-[6px] text-success">PRESENT</span>
          </p>
          {punches.map(([l, v]) => (
            <p key={l} className="mt-1 flex justify-between text-[6.5px]">
              <span className="text-muted">{l}</span>
              <span className="font-semibold text-navy">{v}</span>
            </p>
          ))}
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <span className="rounded bg-primary py-0.5 text-center text-[6px] font-semibold text-white">Time Out</span>
            <span className="rounded border border-primary-200 py-0.5 text-center text-[6px] font-semibold text-primary">View DTR</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 border-t border-line bg-white py-2">
          {[House, FileText, CalendarDays, Ellipsis].map((Icon, i) => (
            <Icon key={i} className={cn('mx-auto size-3.5', i === 0 ? 'text-primary' : 'text-muted')} />
          ))}
        </div>
      </div>
    </div>
  )
}
