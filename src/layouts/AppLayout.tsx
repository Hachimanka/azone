import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import * as DM from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import { Bell, Building2, ChevronDown, Ellipsis, FileText, House, CalendarDays, LogOut, UserRound } from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Logo } from '@/components/brand/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog } from '@/components/ui/Dialog'
import { InstallButton } from '@/components/pwa/InstallButton'
import { useAuth } from '@/store/auth'
import { useMarkNotificationsRead, useNotifications } from '@/services/queries'
import { cn } from '@/lib/cn'
import { mainNav, secondaryNav } from './nav'

export function AppLayout() {
  const location = useLocation()
  return (
    <div className="min-h-dvh bg-bg">
      <Topbar />
      {/* Sidebar sits flush against the left edge; only the page content is width-capped */}
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-[1400px]"
          >
            <Suspense
              fallback={
                <div className="flex min-h-[50dvh] items-center justify-center">
                  <span className="size-8 animate-spin rounded-full border-3 border-primary-100 border-t-primary" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

function Topbar() {
  const employee = useAuth((s) => s.session?.employee)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  return (
    <header className="safe-top print:hidden sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
        <Logo to="/app" className="hidden sm:inline-flex" />
        <Logo to="/app" stacked className="sm:hidden" />

        <div className="flex items-center gap-2 sm:gap-4">
          <InstallButton className="hidden md:inline-flex" />
          <NotificationBell />
          {employee && (
            <DM.Root>
              <DM.Trigger className="flex items-center gap-3 rounded-full p-1 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:rounded-2xl sm:pr-3">
                <Avatar name={employee.fullName} className="size-9 ring-2" />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-navy">{employee.fullName}</span>
                  <span className="block text-xs text-muted">Employee</span>
                </span>
                <ChevronDown className="hidden size-4 text-muted sm:block" />
              </DM.Trigger>
              <DM.Portal>
                <DM.Content align="end" sideOffset={8} className="z-50 w-56 rounded-2xl border border-line bg-white p-1.5 shadow-float">
                  <DM.Label className="px-3 py-2">
                    <span className="block text-sm font-semibold text-navy">{employee.fullName}</span>
                    <span className="block text-xs text-muted">{employee.position}</span>
                  </DM.Label>
                  <DM.Separator className="my-1 h-px bg-line" />
                  <MenuItem icon={UserRound} onSelect={() => navigate('/app/profile')}>
                    My Profile
                  </MenuItem>
                  <MenuItem icon={Building2} onSelect={() => navigate('/app/company')}>
                    Company Info
                  </MenuItem>
                  <DM.Separator className="my-1 h-px bg-line" />
                  <MenuItem
                    icon={LogOut}
                    danger
                    onSelect={() => {
                      logout()
                      navigate('/login')
                    }}
                  >
                    Sign out
                  </MenuItem>
                </DM.Content>
              </DM.Portal>
            </DM.Root>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({
  icon: Icon,
  children,
  onSelect,
  danger,
}: {
  icon: typeof House
  children: React.ReactNode
  onSelect: () => void
  danger?: boolean
}) {
  return (
    <DM.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium outline-none data-highlighted:bg-primary-50 data-highlighted:text-primary',
        danger ? 'text-danger data-highlighted:bg-danger-50 data-highlighted:text-danger' : 'text-ink',
      )}
    >
      <Icon className="size-4" />
      {children}
    </DM.Item>
  )
}

function NotificationBell() {
  const { data = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const navigate = useNavigate()
  const unread = data.filter((n) => !n.read).length

  return (
    <DM.Root>
      <DM.Trigger
        className="relative rounded-full p-2.5 text-ink transition hover:bg-primary-50 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-danger ring-2 ring-white" />}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-2 shadow-float"
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <p className="font-bold text-navy">Notifications</p>
            {unread > 0 && (
              <button className="text-xs font-semibold text-primary hover:underline" onClick={() => markRead.mutate(undefined)}>
                Mark all read
              </button>
            )}
          </div>
          {data.slice(0, 4).map((n) => (
            <DM.Item
              key={n.id}
              onSelect={() => {
                markRead.mutate([n.id])
                if (n.link) navigate(n.link)
              }}
              className="flex cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 outline-none data-highlighted:bg-primary-50"
            >
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy">{n.title}</span>
                <span className="block truncate text-xs text-muted">{n.body}</span>
                <span className="mt-0.5 block text-[11px] text-muted/80">
                  {formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </span>
            </DM.Item>
          ))}
          <DM.Item asChild>
            <Link
              to="/app/notifications"
              className="mt-1 block rounded-xl px-2.5 py-2 text-center text-sm font-semibold text-primary outline-none data-highlighted:bg-primary-50"
            >
              See all notifications
            </Link>
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  )
}

function Sidebar() {
  return (
    <div className="hidden w-64 shrink-0 border-r border-line bg-white lg:block print:hidden">
      <aside className="sticky top-[76px] flex h-[calc(100dvh-76px)] flex-col px-4 py-6">
        <nav className="space-y-1">
          {mainNav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-6 border-t border-line pt-6">
          <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted/70">More</p>
          {secondaryNav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </div>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-primary to-primary-700 p-4 text-white">
          <p className="text-sm font-bold">Payroll questions?</p>
          <p className="mt-1 text-xs text-white/80">Reach the payroll team at local 135 or payroll@aznar.com.</p>
        </div>
      </aside>
    </div>
  )
}

function SideLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof House; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-white shadow-[0_8px_20px_-8px_rgb(21_87_224/0.6)]'
            : 'text-ink hover:translate-x-1 hover:bg-primary-50 hover:text-primary',
        )
      }
    >
      <Icon className="size-[18px]" />
      {label}
    </NavLink>
  )
}

const bottomTabs = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/payslips', label: 'Payslip', icon: FileText },
  { to: '/app/leaves', label: 'Leaves', icon: CalendarDays },
]

function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const inMore = !bottomTabs.some((t) => (t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)))

  return (
    <>
      <nav className="safe-bottom print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4">
          {bottomTabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition', isActive ? 'text-primary' : 'text-muted')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('size-5 transition-transform', isActive && '-translate-y-0.5')} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn('flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', inMore ? 'text-primary' : 'text-muted')}
          >
            <Ellipsis className="size-5" />
            More
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <div className="grid grid-cols-3 gap-3">
          {[...mainNav.slice(1), ...secondaryNav].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMoreOpen(false)}
              className="card card-hover flex flex-col items-center gap-2 p-4 text-center text-xs font-semibold text-navy"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          ))}
        </div>
        <InstallButton variant="soft" size="md" className="mt-4 w-full" label="Install AZONE on this phone" />
      </Dialog>
    </>
  )
}
