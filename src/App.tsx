import { lazy, Suspense, useEffect } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/Button'
import { useAuth } from '@/store/auth'
import { AppLayout } from '@/layouts/AppLayout'
import { UpdateToast } from '@/components/pwa/UpdateToast'

// Route-level code splitting: the landing page and each app screen load on demand
const LandingPage = lazy(() => import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const PayslipsPage = lazy(() => import('@/pages/PayslipsPage').then((m) => ({ default: m.PayslipsPage })))
const PayslipDetailPage = lazy(() => import('@/pages/PayslipDetailPage').then((m) => ({ default: m.PayslipDetailPage })))
const LeavesPage = lazy(() => import('@/pages/LeavesPage').then((m) => ({ default: m.LeavesPage })))
const DtrPage = lazy(() => import('@/pages/DtrPage').then((m) => ({ default: m.DtrPage })))
const RequestsPage = lazy(() => import('@/pages/RequestsPage').then((m) => ({ default: m.RequestsPage })))
const AnnouncementsPage = lazy(() => import('@/pages/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })))
const AnnouncementDetailPage = lazy(() => import('@/pages/AnnouncementsPage').then((m) => ({ default: m.AnnouncementDetailPage })))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const CompanyPage = lazy(() => import('@/pages/CompanyPage').then((m) => ({ default: m.CompanyPage })))
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })))

function RequireAuth() {
  const session = useAuth((s) => s.session)
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // Signed in with an HR-issued password: nothing else opens until it is replaced
  if (session.mustChangePassword) return <Navigate to="/change-password" replace />
  return <Outlet />
}

/** Installed app opens at /app — skip the marketing page when already signed in. */
function Home() {
  const session = useAuth((s) => s.session)
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  return standalone ? <Navigate to={session ? '/app' : '/login'} replace /> : <LandingPage />
}

export default function App() {
  const { pathname } = useLocation()
  // Dark mode belongs to the signed-in app only. index.html may switch it on before a redirect away from
  // /app (e.g. to /change-password or /login); AppLayout never mounts then, so clear it here.
  // (Child effects run first, so on /app routes AppLayout has already applied the user's theme.)
  useEffect(() => {
    if (!pathname.startsWith('/app')) document.documentElement.classList.remove('dark')
  }, [pathname])

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="payslips" element={<PayslipsPage />} />
              <Route path="payslips/:id" element={<PayslipDetailPage />} />
              <Route path="leaves" element={<LeavesPage />} />
              <Route path="dtr" element={<DtrPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="company" element={<CompanyPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <UpdateToast />
    </>
  )
}

function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <span className="size-8 animate-spin rounded-full border-3 border-primary-100 border-t-primary" aria-label="Loading" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-7xl font-extrabold text-primary-100">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className={buttonVariants()}>
        Go home
      </Link>
    </div>
  )
}
