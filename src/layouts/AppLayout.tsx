import { Fragment, Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import * as DM from '@radix-ui/react-dropdown-menu'
import { motion } from 'motion/react'
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  FileText,
  House,
  CalendarDays,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog } from '@/components/ui/Dialog'
import { InstallButton } from '@/components/pwa/InstallButton'
import { useAuth } from '@/store/auth'
import { useTheme } from '@/store/theme'
import { useBreadcrumb } from '@/store/breadcrumb'
import { useMarkNotificationsRead, useNotifications } from '@/services/queries'
import { cn } from '@/lib/cn'
import { mainNav } from './nav'

export function AppLayout() {
  const location = useLocation()
  useApplyTheme()
  return (
    // Sidebar runs the full height (logo on top); the top bar only spans the content column beside it.
    <div className="flex min-h-dvh bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
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
    <header className="safe-top print:hidden sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
        {/* The logo lives in the sidebar on desktop; phones/tablets have no sidebar, so it stays here. */}
        <Logo to="/app" className="lg:hidden" />
        <Breadcrumb />

        <div className="flex items-center gap-1 sm:gap-3">
          <InstallButton className="hidden md:inline-flex" />
          <ThemeToggle />
          <NotificationBell />
          {employee && (
            <DM.Root>
              <DM.Trigger className="flex items-center gap-3 rounded-full p-1 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:rounded-2xl sm:pr-3">
                <Avatar name={employee.fullName} src={employee.avatarUrl} className="size-9 ring-2" />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-navy">{employee.fullName}</span>
                  <span className="block text-xs text-muted">Employee</span>
                </span>
                <ChevronDown className="hidden size-4 text-muted sm:block" />
              </DM.Trigger>
              <DM.Portal>
                <DM.Content align="end" sideOffset={8} className="z-50 w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-float">
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
        {unread > 0 && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-danger ring-2 ring-surface" />}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-2 shadow-float"
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

const COLLAPSED_KEY = 'azone-sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? '0' : '1')
      } catch {
        // Storage unavailable (private mode); the toggle still works for this visit.
      }
      return !c
    })

  return (
    <div
      className={cn(
        'relative z-50 hidden shrink-0 border-r border-line bg-surface transition-[width] duration-300 ease-out lg:block print:hidden',
        collapsed ? 'w-[84px]' : 'w-64',
      )}
    >
      <aside className="sticky top-0 flex h-dvh flex-col">
        {/* Same height as the top bar so the logo row lines up with it */}
        {/* Expanded: logo left edge lines up with the nav icons (nav px-4 + link px-4 = 32px) */}
        <div className={cn('flex h-[76px] shrink-0 items-center', collapsed ? 'justify-center' : 'pl-8')}>
          {collapsed ? (
            <Link to="/app" aria-label="AZone home" className="transition hover:scale-105">
              <LogoMark animate />
            </Link>
          ) : (
            <Logo to="/app" />
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-[24px] -right-3.5 z-10 flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-white shadow-[0_6px_16px_-6px_rgb(21_87_224/0.7)] ring-4 ring-bg transition hover:scale-110 focus:outline-none focus-visible:ring-primary-200"
        >
          <ChevronLeft className={cn('size-4 transition-transform duration-300', collapsed && 'rotate-180')} strokeWidth={2.5} />
        </button>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {mainNav.map((item) => (
            <SideLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
    </div>
  )
}

function SideLink({ to, label, icon: Icon, end, collapsed }: { to: string; label: string; icon: typeof House; end?: boolean; collapsed?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center px-0' : 'px-4',
          isActive
            ? 'bg-primary text-white shadow-[0_8px_20px_-8px_rgb(21_87_224/0.6)]'
            : cn('text-ink hover:bg-primary-50 hover:text-primary', !collapsed && 'hover:translate-x-1'),
        )
      }
    >
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

/** Sections a crumb can name: the sidebar nav plus pages reached from the top bar. */
const crumbSections = [
  ...mainNav.filter((n) => !n.end),
  { to: '/app/profile', label: 'My Profile' },
  { to: '/app/notifications', label: 'Notifications' },
  { to: '/app/company', label: 'Company' },
  { to: '/app/announcements', label: 'Announcements' },
]

/** Dashboard › section › record (the record label comes from the detail page via useDetailCrumb), same as APAY. */
function Breadcrumb() {
  const { pathname } = useLocation()
  const detail = useBreadcrumb((s) => s.detail)
  const path = pathname.replace(/\/+$/, '')
  const section = crumbSections.find((s) => path === s.to || path.startsWith(`${s.to}/`))

  const items: { label: string; to?: string }[] = [{ label: 'Dashboard', to: '/app' }]
  if (section && path === section.to) items.push({ label: section.label })
  else if (section) items.push({ label: section.label, to: section.to }, { label: detail ?? '…' })

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
      <ol className="flex items-center gap-2.5 text-[15px] font-bold">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden className="text-muted">
                  <ChevronRight className="size-4" strokeWidth={3} />
                </li>
              )}
              <li className="flex min-w-0 items-baseline gap-2">
                {i === 0 && <HomeIcon className="h-[15px] w-[17px] shrink-0 self-baseline text-primary" />}
                {last || !c.to ? (
                  <span aria-current={last ? 'page' : undefined} className={cn('truncate', last ? 'text-primary' : 'text-navy')}>
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to} className="truncate text-navy transition-colors hover:text-primary">
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
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
      <nav className="safe-bottom print:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
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
          {mainNav.slice(1).map(({ to, label, icon: Icon }) => (
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

const THEME_COLOR = { light: '#1557E0', dark: '#0a1124' }

/** Dark mode only covers the signed-in app: the class is removed again when leaving it (landing/login stay light). */
function useApplyTheme() {
  const theme = useTheme((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
    // Always print in light colours (e.g. payslip PDFs), then restore
    const beforePrint = () => root.classList.remove('dark')
    const afterPrint = () => root.classList.toggle('dark', theme === 'dark')
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
      root.classList.remove('dark')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR.light)
    }
  }, [theme])
}

function ThemeToggle() {
  const theme = useTheme((s) => s.theme)
  const toggle = useTheme((s) => s.toggle)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="relative rounded-full p-2.5 text-ink transition hover:bg-primary-50 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
    >
      <motion.span key={theme} initial={{ rotate: -90, scale: 0.6, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} className="block">
        {dark ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5" />}
      </motion.span>
    </button>
  )
}

/** Solid house with chimney and door cut-out (lucide's House turns into a blob when filled). viewBox is trimmed to the shape so it sits on the text baseline. */
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="1.8 3.2 20.4 17.8" fill="currentColor" aria-hidden className={className}>
      <path d="M12 3.2 1.8 12h2.7v8.3a.7.7 0 0 0 .7.7H10v-5.5h4V21h4.8a.7.7 0 0 0 .7-.7V12h2.7L18 8.4V4.5h-2.5v1.8z" />
    </svg>
  )
}
