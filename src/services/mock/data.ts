import { addDays, endOfMonth, format, isWeekend, setHours, setMinutes, startOfMonth, subMonths } from 'date-fns'
import type { Announcement, AttendanceDay, CompanyInfo, Employee, EmployeeRequest, LeaveBalance, LeaveRequest, Notification, Payslip } from '../types'

const iso = (d: Date) => format(d, 'yyyy-MM-dd')
const at = (d: Date, h: number, m: number) => setMinutes(setHours(d, h), m).toISOString()

export const employee: Employee = {
  id: 'emp_001',
  employeeNo: 'AZN-2021-0148',
  firstName: 'Leonard',
  lastName: 'Forrosuelo',
  fullName: 'Leonard Forrosuelo',
  position: 'Software Engineer',
  department: 'IT Department',
  employmentType: 'Regular',
  email: 'leonard.forrosuelo@aznar.com',
  phone: '+63 917 555 0148',
  address: 'Banilad, Cebu City, Cebu',
  birthday: '1996-05-14',
  dateHired: '2021-03-01',
  manager: 'Maria Santos',
  workSchedule: 'Mon–Fri · 8:00 AM – 5:00 PM',
  govIds: { sss: '34-•••••••-2', philhealth: '12-•••••••••-7', pagibig: '1211-••••-5530', tin: '•••-•••-482-000' },
  emergencyContact: { name: 'Ana Forrosuelo', relation: 'Spouse', phone: '+63 917 555 0199' },
  avatarUrl: null,
}

/* ---------- Payslips: semi-monthly cut-offs, newest first ---------- */

function lastPeriods(count: number) {
  const periods: { start: Date; end: Date }[] = []
  const now = new Date()
  // The most recent cut-off that has already closed
  let cursor = now.getDate() > 15 ? new Date(now.getFullYear(), now.getMonth(), 15) : endOfMonth(subMonths(now, 1))
  while (periods.length < count) {
    const isSecondHalf = cursor.getDate() > 15
    const start = isSecondHalf ? new Date(cursor.getFullYear(), cursor.getMonth(), 16) : startOfMonth(cursor)
    periods.push({ start, end: cursor })
    cursor = isSecondHalf ? new Date(cursor.getFullYear(), cursor.getMonth(), 15) : endOfMonth(subMonths(cursor, 1))
  }
  return periods
}

const otAmounts = ['1500.00', '0.00', '2250.00', '750.00', '0.00', '1125.00']

// Two years of cut-offs so the Payslips page year filter and pagination have something to work with
export const payslips: Payslip[] = lastPeriods(48).map(({ start, end }, i) => {
  const otAmount = otAmounts[i % otAmounts.length]
  const basic = 25000
  const ot = Number(otAmount)
  const allowance = 2000
  const gross = basic + ot + allowance
  const tax = Math.round((gross - 26500) * 0.2 + 2000)
  const deductions = [
    { label: 'SSS Contribution', amount: '875.00' },
    { label: 'PhilHealth', amount: '625.00' },
    { label: 'Pag-IBIG', amount: '100.00' },
    { label: 'Withholding Tax', amount: `${tax}.00` },
  ]
  const totalDeductions = deductions.reduce((s, d) => s + Number(d.amount), 0)
  return {
    id: `ps_${iso(end)}`,
    periodStart: iso(start),
    periodEnd: iso(end),
    payDate: iso(addDays(end, 0)),
    gross: `${gross}.00`,
    totalDeductions: `${totalDeductions}.00`,
    net: `${gross - totalDeductions}.00`,
    earnings: [
      { label: 'Basic Pay', amount: `${basic}.00` },
      { label: 'Overtime', amount: otAmount },
      { label: 'Rice & Transport Allowance', amount: `${allowance}.00` },
    ],
    deductions,
    status: 'released',
  }
})

/* ---------- Attendance ---------- */

export function buildTodayRecord(): AttendanceDay {
  const now = new Date()
  const today = new Date(now)
  const minutes = now.getHours() * 60 + now.getMinutes()
  const passed = (h: number, m: number) => minutes >= h * 60 + m
  return {
    date: iso(today),
    timeIn: passed(8, 3) ? at(today, 8, 3) : null,
    breakOut: passed(12, 0) ? at(today, 12, 0) : null,
    breakIn: passed(13, 0) ? at(today, 13, 0) : null,
    timeOut: null,
    status: passed(8, 3) ? 'present' : 'absent',
    hoursWorked: 0,
  }
}

const holidays: Record<string, string> = {
  '2026-08-21': 'Ninoy Aquino Day',
  '2026-08-31': 'National Heroes Day',
  '2026-11-01': "All Saints' Day",
  '2026-11-30': 'Bonifacio Day',
}

export function buildMonth(month: string): AttendanceDay[] {
  const [y, m] = month.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = endOfMonth(first)
  const todayIso = iso(new Date())
  const days: AttendanceDay[] = []
  for (let d = first; d <= last; d = addDays(d, 1)) {
    const date = iso(d)
    if (date >= todayIso) break
    const seed = (d.getDate() * 7 + m * 3) % 23
    if (isWeekend(d)) {
      days.push({ date, timeIn: null, breakOut: null, breakIn: null, timeOut: null, status: 'rest', hoursWorked: 0 })
    } else if (holidays[date]) {
      days.push({ date, timeIn: null, breakOut: null, breakIn: null, timeOut: null, status: 'holiday', hoursWorked: 0 })
    } else if (seed === 5) {
      days.push({ date, timeIn: null, breakOut: null, breakIn: null, timeOut: null, status: 'leave', hoursWorked: 0 })
    } else {
      const late = seed === 11 || seed === 17
      const inMin = late ? 14 + (seed % 9) : seed % 6
      days.push({
        date,
        timeIn: at(d, 8, inMin),
        breakOut: at(d, 12, 0),
        breakIn: at(d, 13, 0),
        timeOut: at(d, 17, (seed * 3) % 40),
        status: late ? 'late' : 'present',
        hoursWorked: 8,
      })
    }
  }
  return days
}

/* ---------- Leaves & requests ---------- */

export const leaveBalances: LeaveBalance[] = [
  { type: 'vacation', label: 'Vacation Leave', available: 8, used: 7, total: 15 },
  { type: 'sick', label: 'Sick Leave', available: 10, used: 5, total: 15 },
  { type: 'emergency', label: 'Emergency Leave', available: 3, used: 0, total: 3 },
  { type: 'birthday', label: 'Birthday Leave', available: 0, used: 1, total: 1 },
]

const daysAgo = (n: number) => addDays(new Date(), -n)

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'lv_104',
    type: 'vacation',
    startDate: iso(addDays(new Date(), 12)),
    endDate: iso(addDays(new Date(), 13)),
    days: 2,
    reason: 'Family trip to Bohol',
    status: 'pending',
    filedAt: daysAgo(1).toISOString(),
  },
  {
    id: 'lv_103',
    type: 'sick',
    startDate: iso(daysAgo(20)),
    endDate: iso(daysAgo(20)),
    days: 1,
    reason: 'Flu',
    status: 'approved',
    filedAt: daysAgo(21).toISOString(),
  },
  {
    id: 'lv_102',
    type: 'vacation',
    startDate: iso(daysAgo(48)),
    endDate: iso(daysAgo(46)),
    days: 3,
    reason: 'Personal errands',
    status: 'approved',
    filedAt: daysAgo(60).toISOString(),
  },
  {
    id: 'lv_101',
    type: 'birthday',
    startDate: '2026-05-14',
    endDate: '2026-05-14',
    days: 1,
    reason: 'Birthday leave',
    status: 'approved',
    filedAt: '2026-05-02T09:00:00.000Z',
  },
]

export const requests: EmployeeRequest[] = [
  {
    id: 'rq_210',
    kind: 'coe',
    title: 'Certificate of Employment',
    details: 'For bank loan application',
    status: 'pending',
    filedAt: daysAgo(2).toISOString(),
  },
  {
    id: 'rq_209',
    kind: 'overtime',
    title: 'Overtime Request',
    details: 'Production deployment support, 3 hours',
    status: 'approved',
    filedAt: daysAgo(9).toISOString(),
  },
  {
    id: 'rq_208',
    kind: 'schedule_change',
    title: 'Schedule Change',
    details: 'Shift to 9 AM – 6 PM for one week',
    status: 'rejected',
    filedAt: daysAgo(30).toISOString(),
  },
]

/* ---------- Announcements & notifications ---------- */

export const announcements: Announcement[] = [
  {
    id: 'an_31',
    category: 'HR',
    title: 'Company Holiday Schedule',
    excerpt: 'Please be informed that the company holiday schedule for the remainder of the year has been released.',
    body: 'Please be informed that the company holiday schedule for the remainder of the year has been released.\n\nOffices will be closed on All Saints’ Day (November 1), Bonifacio Day (November 30), Christmas Eve, Christmas Day, Rizal Day and New Year’s Eve. Employees on critical duty will be notified by their department heads.\n\nHoliday pay will be reflected automatically in your payslip through APAY.',
    publishedAt: daysAgo(1).toISOString(),
    author: 'HR Department',
    pinned: true,
  },
  {
    id: 'an_30',
    category: 'General',
    title: 'System Maintenance',
    excerpt: 'The system will be undergoing maintenance this Saturday from 10:00 PM to 2:00 AM.',
    body: 'The system will be undergoing maintenance this Saturday from 10:00 PM to 2:00 AM.\n\nAZONE and APAY may be briefly unavailable during this window. Time-in records will still be captured by the biometric devices and synced afterwards.',
    publishedAt: daysAgo(4).toISOString(),
    author: 'IT Department',
  },
  {
    id: 'an_29',
    category: 'Policy',
    title: 'Updated Leave Policy',
    excerpt: 'Effective next month, the company will be implementing updates to the leave policy.',
    body: 'Effective next month, the company will be implementing updates to the leave policy.\n\n• Vacation leave must be filed at least 5 working days in advance.\n• Unused vacation leave of up to 5 days can be carried over.\n• Sick leave of more than 2 consecutive days requires a medical certificate.\n\nFor questions, reach out to HR.',
    publishedAt: daysAgo(7).toISOString(),
    author: 'HR Department',
  },
  {
    id: 'an_28',
    category: 'Event',
    title: 'Aznar Family Day 2026',
    excerpt: 'Join us for a day of games, food and fun with your family at the company grounds.',
    body: 'Join us for a day of games, food and fun with your family at the company grounds.\n\nRegistration is open until the end of the month. Each employee may bring up to four family members.',
    publishedAt: daysAgo(12).toISOString(),
    author: 'Employee Engagement',
  },
]

export const notifications: Notification[] = [
  {
    id: 'nt_9',
    kind: 'payslip',
    title: 'Your payslip is ready',
    body: 'Payslip for the latest cut-off has been released.',
    createdAt: daysAgo(0).toISOString(),
    read: false,
    link: '/app/payslips',
  },
  {
    id: 'nt_8',
    kind: 'announcement',
    title: 'New announcement from HR',
    body: 'Company Holiday Schedule',
    createdAt: daysAgo(1).toISOString(),
    read: false,
    link: '/app/announcements/an_31',
  },
  {
    id: 'nt_7',
    kind: 'request',
    title: 'Overtime request approved',
    body: 'Your overtime request was approved by Maria Santos.',
    createdAt: daysAgo(8).toISOString(),
    read: true,
    link: '/app/requests',
  },
  {
    id: 'nt_6',
    kind: 'leave',
    title: 'Sick leave approved',
    body: 'Your 1-day sick leave was approved.',
    createdAt: daysAgo(20).toISOString(),
    read: true,
    link: '/app/leaves',
  },
]

/* ---------- Company ---------- */

export const company: CompanyInfo = {
  name: 'Aznar',
  about:
    'Aznar is a Cebu-based group of companies serving communities across the Visayas. We believe great service starts with taking care of our people.',
  mission: 'To build lasting value for our customers, communities and employees through excellence and integrity.',
  vision: 'To be the most trusted and people-centered company in the region.',
  values: [
    { title: 'Integrity', description: 'We do what is right, even when no one is watching.' },
    { title: 'Excellence', description: 'We hold ourselves to high standards in everything we do.' },
    { title: 'Malasakit', description: 'We genuinely care for our colleagues and customers.' },
    { title: 'Teamwork', description: 'We win together, across departments and companies.' },
  ],
  offices: [
    { name: 'Head Office', address: 'Aznar Building, Cebu Business Park, Cebu City', phone: '(032) 555 0100' },
    { name: 'Manila Office', address: 'Ortigas Center, Pasig City', phone: '(02) 8555 0100' },
  ],
  hotlines: [
    { label: 'HR Helpdesk', value: 'hr@aznar.com · local 120' },
    { label: 'Payroll Concerns', value: 'payroll@aznar.com · local 135' },
    { label: 'IT Support', value: 'it@aznar.com · local 200' },
  ],
  holidays: (
    [
      { date: '2026-11-01', name: "All Saints' Day", type: 'Special' },
      { date: '2026-11-30', name: 'Bonifacio Day', type: 'Regular' },
      { date: '2026-12-08', name: 'Feast of the Immaculate Conception', type: 'Special' },
      { date: '2026-12-24', name: 'Christmas Eve', type: 'Special' },
      { date: '2026-12-25', name: 'Christmas Day', type: 'Regular' },
      { date: '2026-12-30', name: 'Rizal Day', type: 'Regular' },
      { date: '2026-12-31', name: 'Last Day of the Year', type: 'Special' },
    ] as const
  ).filter((h) => h.date >= iso(new Date())),
}
