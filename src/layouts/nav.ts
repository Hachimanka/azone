import { CalendarDays, Clock, FileText, House, Send } from 'lucide-react'

export const mainNav = [
  { to: '/app', label: 'Dashboard', icon: House, end: true },
  { to: '/app/payslips', label: 'Payslip', icon: FileText },
  { to: '/app/leaves', label: 'Leaves', icon: CalendarDays },
  { to: '/app/dtr', label: 'Attendance', icon: Clock },
  { to: '/app/requests', label: 'Requests', icon: Send },
]
