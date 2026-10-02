import { Building2, CalendarDays, Clock, FileText, House, Megaphone, Send, UserRound, Bell } from 'lucide-react'

export const mainNav = [
  { to: '/app', label: 'Dashboard', icon: House, end: true },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
  { to: '/app/payslips', label: 'Payslip', icon: FileText },
  { to: '/app/leaves', label: 'Leaves', icon: CalendarDays },
  { to: '/app/dtr', label: 'DTR', icon: Clock },
  { to: '/app/requests', label: 'Requests', icon: Send },
  { to: '/app/announcements', label: 'Announcements', icon: Megaphone },
]

export const secondaryNav = [
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/company', label: 'Company', icon: Building2 },
]
