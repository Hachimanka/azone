import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Megaphone,
  Menu,
  Send,
  ShieldCheck,
  Smartphone,
  UserRound,
  WifiOff,
  X,
  Zap,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/Button'
import { InstallButton } from '@/components/pwa/InstallButton'
import { useAuth } from '@/store/auth'
import { cn } from '@/lib/cn'
import { Reveal, SectionHeading } from './Reveal'
import { DesktopMockup, PhoneMockup } from './Mockups'
import { ContactForm } from './ContactForm'

const navLinks = [
  { href: '#overview', label: 'Overview' },
  { href: '#features', label: 'Features' },
  { href: '#connected', label: 'AZONE + APAY' },
  { href: '#mobile', label: 'Mobile App' },
  { href: '#contact', label: 'Contact' },
]

export function LandingPage() {
  return (
    <div className="overflow-x-clip bg-white">
      <Navbar />
      <Hero />
      <TeamsStrip />
      <Overview />
      <Features />
      <StatsBand />
      <Connected />
      <MobileApp />
      <Contact />
      <Footer />
    </div>
  )
}

/* ---------------------------------- Navbar --------------------------------- */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const signedIn = useAuth((s) => !!s.session)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'safe-top fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'border-b border-line bg-white/90 shadow-card backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-ink transition hover:text-primary after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <InstallButton variant="ghost" />
          {!signedIn && (
            <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
          )}
          <Link to={signedIn ? '/app' : '/login'} className={buttonVariants({ size: 'sm' })}>
            {signedIn ? 'Open AZONE' : 'Get started'} <ArrowRight className="size-4" />
          </Link>
        </div>
        <button className="rounded-lg p-2 text-navy lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-line bg-white px-4 pt-2 pb-6 lg:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 font-medium text-ink hover:bg-primary-50 hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-3 grid gap-2">
            <InstallButton variant="soft" size="md" />
            <Link to={signedIn ? '/app' : '/login'} className={buttonVariants({ className: 'w-full' })}>
              {signedIn ? 'Open AZONE' : 'Sign in to AZONE'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ----------------------------------- Hero ---------------------------------- */

function Hero() {
  const benefits = [
    'Payslips the moment payroll is released',
    'Time in, file leaves and requests in two taps',
    'Install it on your phone — works offline',
  ]

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,#dbe6fc_0%,transparent_70%),radial-gradient(40%_40%_at_0%_30%,#eef3fd_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(#e6ecf7_1px,transparent_1px),linear-gradient(90deg,#e6ecf7_1px,transparent_1px)] mask-[radial-gradient(70%_60%_at_50%_0%,black,transparent)] bg-size-[44px_44px] opacity-50" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-card"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">NEW</span>
            By Aznar, for every Aznar employee
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Your work life, <span className="bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">all in one zone.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            AZONE is the Aznar employee platform. Check your payslip, track attendance, file leaves and stay on top of company news — from your desk
            or your phone.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/login" className={buttonVariants({ size: 'lg' })}>
              Sign in to AZONE <ArrowRight className="size-4" />
            </Link>
            <a href="#features" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              Explore features
            </a>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-8 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <CheckCircle2 className="size-5 text-primary" /> {b}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <DesktopMockup className="max-sm:hidden" />
          <PhoneMockup className="animate-float-slow w-[220px] max-sm:mx-auto sm:absolute sm:-right-4 sm:-bottom-16 sm:w-[190px] lg:-right-8" />

          <div className="animate-float card absolute -top-6 -left-6 hidden items-center gap-3 p-3 pr-5 sm:flex">
            <span className="flex size-9 items-center justify-center rounded-full bg-success-50 text-success">
              <BadgeCheck className="size-5" />
            </span>
            <span>
              <span className="block text-[11px] text-muted">Payslip released</span>
              <span className="block text-sm font-bold text-navy">₱24,500 net pay</span>
            </span>
          </div>
          <div className="animate-float-slow card absolute -bottom-8 left-10 hidden items-center gap-3 p-3 pr-5 sm:flex [animation-delay:1.5s]">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Clock className="size-5" />
            </span>
            <span>
              <span className="block text-[11px] text-muted">Timed in</span>
              <span className="block text-sm font-bold text-navy">8:03 AM today</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------- Teams strip -------------------------------- */

const teams = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Operations',
  'Sales & Marketing',
  'Customer Service',
  'Logistics',
  'Engineering',
  'Administration',
  'Procurement',
]

function TeamsStrip() {
  return (
    <section className="border-y border-line bg-bg py-10">
      <p className="text-center text-sm font-semibold text-muted">One platform for every team across Aznar</p>
      <div className="relative mt-6 overflow-hidden mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-4 hover:[animation-play-state:paused]">
          {[...teams, ...teams].map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-ink shadow-card transition hover:border-primary-200 hover:text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Overview --------------------------------- */

function Overview() {
  return (
    <section id="overview" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="One connected platform"
          title="Your people deserve better than scattered forms"
          description="No more chasing HR for payslips or filling up paper leave forms. AZONE gives every employee one simple home for their work information."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="card card-hover group h-full overflow-hidden">
              <div className="p-8">
                <span className="text-xs font-bold tracking-wider text-primary uppercase">For employees</span>
                <h3 className="mt-2 text-2xl font-bold">See everything that matters to you</h3>
                <p className="mt-3 text-muted">Your pay, attendance, leave credits and requests on one dashboard — always up to date with payroll.</p>
              </div>
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 px-8 pt-8">
                <DesktopMockup className="origin-top-left transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]" />
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="card card-hover group h-full overflow-hidden">
              <div className="p-8">
                <span className="text-xs font-bold tracking-wider text-primary uppercase">For HR & managers</span>
                <h3 className="mt-2 text-2xl font-bold">Less paperwork, faster approvals</h3>
                <p className="mt-3 text-muted">Leave and document requests arrive digitally and flow straight into APAY for payroll.</p>
              </div>
              <div className="flex h-56 flex-col justify-center gap-3 bg-gradient-to-br from-primary-50 to-primary-100 px-8">
                {[
                  { icon: CalendarDays, t: 'Vacation leave · 2 days', s: 'Approved', tone: 'text-success bg-success-50' },
                  { icon: BadgeCheck, t: 'Certificate of Employment', s: 'Pending', tone: 'text-warning bg-warning-50' },
                  { icon: Clock, t: 'Overtime · 3 hours', s: 'Approved', tone: 'text-success bg-success-50' },
                ].map(({ icon: Icon, t, s, tone }, i) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card transition-transform duration-300 group-hover:translate-x-2"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-navy">{t}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase', tone)}>{s}</span>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Features --------------------------------- */

const features = [
  {
    icon: UserRound,
    tag: 'Identify',
    title: 'Profile',
    text: 'Your employment details, government IDs and emergency contacts in one secure profile.',
  },
  { icon: Clock, tag: 'Track', title: 'Attendance / DTR', text: 'Time in and out from your phone and review your daily time record any time.' },
  { icon: CalendarDays, tag: 'Rest', title: 'Leaves', text: 'See your leave credits and file vacation, sick or emergency leave in seconds.' },
  { icon: Send, tag: 'Request', title: 'Requests', text: 'Request a COE, overtime, schedule change or reimbursement — no paper forms.' },
  { icon: FileText, tag: 'Get paid', title: 'Payslips', text: 'View a full breakdown of earnings and deductions, and save it as PDF.' },
  {
    icon: Megaphone,
    tag: 'Stay informed',
    title: 'Announcements',
    text: 'Company news, policies and holiday schedules delivered with notifications.',
  },
]

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-bg py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="One employee journey. Six connected tools."
          description="Everything you used to ask HR for, now a tap away."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, tag, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <article className="card card-hover group relative h-full overflow-hidden p-7">
                <span className="absolute top-5 right-6 text-5xl font-extrabold text-primary-50 transition-colors duration-300 group-hover:text-primary-100">
                  0{i + 1}
                </span>
                <span className="relative flex size-13 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-lift">
                  <Icon className="size-6" />
                </span>
                <p className="relative mt-6 text-xs font-bold tracking-wider text-primary uppercase">{tag}</p>
                <h3 className="relative mt-1 text-xl font-bold">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{text}</p>
                <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more <ArrowRight className="hover-arrow size-4 transition-transform" />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary-400 transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Stats band -------------------------------- */

function StatsBand() {
  const stats = [
    { value: '100%', label: 'Digital payslips' },
    { value: '24/7', label: 'Access anywhere' },
    { value: '2 taps', label: 'To time in' },
    { value: '0', label: 'Paper forms' },
  ]
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary-600 to-primary-700 px-8 py-14 text-white sm:px-14">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/5" />
        <div className="relative grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-white/75">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ---------------------------- AZONE + APAY section --------------------------- */

function Connected() {
  return (
    <section id="connected" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Aznar ecosystem"
          title="AZONE and APAY, working as one"
          description="AZONE is where you see your information. APAY is where HR and Payroll process it. They stay separate and secure, and share data through one Aznar API."
        />
        <Reveal className="mt-14">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <div className="card card-hover p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white">
                <UserRound className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl font-bold">AZONE</h3>
              <p className="text-sm font-semibold text-primary">Employee Platform</p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink">
                {['Dashboard & profile', 'Payslips, DTR & leaves', 'Requests & announcements'].map((x) => (
                  <li key={x} className="flex gap-2">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-3 py-2 lg:px-4">
              <div className="h-10 w-0.5 bg-gradient-to-b from-transparent to-primary-200 lg:hidden" />
              <div className="relative flex size-24 items-center justify-center rounded-full bg-primary-50">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary-100 opacity-60 [animation-duration:2.5s]" />
                <span className="relative flex size-16 flex-col items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-lift">
                  <Lock className="size-5" />
                  API
                </span>
              </div>
              <p className="max-w-[10rem] text-center text-xs font-medium text-muted">Aznar Identity & secure shared services</p>
              <div className="h-10 w-0.5 bg-gradient-to-b from-primary-200 to-transparent lg:hidden" />
            </div>

            <div className="card card-hover p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-navy text-white">
                <FileText className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl font-bold">APAY</h3>
              <p className="text-sm font-semibold text-primary">Payroll Platform</p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink">
                {['Payroll periods & processing', 'Allowances, deductions & overtime', 'Government contributions & reports'].map((x) => (
                  <li key={x} className="flex gap-2">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------- Mobile app -------------------------------- */

function MobileApp() {
  const points = [
    { icon: Smartphone, title: 'Installs like an app', text: 'Add AZONE to your home screen — no app store needed.' },
    { icon: WifiOff, title: 'Works offline', text: 'Your latest payslip and announcements stay available without signal.' },
    { icon: Zap, title: 'Fast and light', text: 'Opens instantly and updates itself in the background.' },
    { icon: ShieldCheck, title: 'Secure by design', text: 'Your Aznar login protects your personal and payroll data.' },
  ]
  return (
    <section id="mobile" className="scroll-mt-20 overflow-hidden bg-bg py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal className="relative order-2 flex justify-center lg:order-1">
          <div className="absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 blur-3xl" />
          <PhoneMockup className="relative w-[250px] -rotate-6 transition-transform duration-500 hover:rotate-0" />
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading
            center={false}
            eyebrow="Mobile app"
            title="Take AZONE wherever you go"
            description="AZONE is a Progressive Web App. Install it on Android or iPhone straight from your browser and use it like any other app."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="card card-hover h-full p-5">
                  <Icon className="size-6 text-primary" />
                  <p className="mt-3 font-bold text-navy">{title}</p>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <InstallButton variant="primary" size="lg" label="Install AZONE" />
            <p className="text-sm text-muted">On iPhone: Share → Add to Home Screen</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Contact --------------------------------- */

function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <SectionHeading
            center={false}
            eyebrow="Get in touch"
            title="Make space for more meaningful work"
            description="Can't sign in or have a question about AZONE? Send the HR helpdesk a message."
          />
          <Reveal className="mt-10 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'hr@aznar.com' },
              { icon: Phone, label: 'HR Helpdesk', value: '(032) 555 0100 · local 120' },
              { icon: MapPin, label: 'Head Office', value: 'Cebu Business Park, Cebu City' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-muted">{label}</span>
                  <span className="block font-semibold text-navy">{value}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------------------------- Footer ---------------------------------- */

function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="text-2xl font-extrabold">AZNAR</p>
          <p className="mt-1 text-sm text-white/60">Employee Platform</p>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            AZONE brings your payslips, attendance, leaves and company news together — built for the people of Aznar.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">Platform</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/login" className="transition hover:text-white">
                Sign in to AZONE
              </Link>
            </li>
            <li>
              <a href="https://apay.aznar.com" className="transition hover:text-white">
                APAY (HR & Payroll)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Aznar. All rights reserved.</p>
          <a href="#" className="transition hover:text-white">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
