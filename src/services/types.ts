/**
 * AZONE ↔ aznar-api contract.
 * Money is always a decimal string (e.g. "24500.00") — never a float.
 * Dates are ISO strings.
 */

export type Employee = {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  fullName: string
  position: string
  department: string
  employmentType: 'Regular' | 'Probationary' | 'Contractual'
  email: string
  phone: string
  address: string
  birthday: string
  dateHired: string
  manager: string
  workSchedule: string
  govIds: { sss: string; philhealth: string; pagibig: string; tin: string }
  emergencyContact: { name: string; relation: string; phone: string }
}

export type Session = { token: string; employee: Employee }

export type MoneyLine = { label: string; amount: string }

export type Payslip = {
  id: string
  periodStart: string
  periodEnd: string
  payDate: string
  gross: string
  totalDeductions: string
  net: string
  earnings: MoneyLine[]
  deductions: MoneyLine[]
  status: 'released' | 'processing'
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'rest' | 'holiday'

export type AttendanceDay = {
  date: string
  timeIn: string | null
  breakOut: string | null
  breakIn: string | null
  timeOut: string | null
  status: AttendanceStatus
  hoursWorked: number
}

export type PunchKind = 'timeIn' | 'breakOut' | 'breakIn' | 'timeOut'

export type AttendanceSummary = { presentDays: number; workingDays: number; lateCount: number; absences: number }

export type LeaveType = 'vacation' | 'sick' | 'emergency' | 'birthday'

export type LeaveBalance = { type: LeaveType; label: string; available: number; used: number; total: number }

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export type LeaveRequest = {
  id: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: RequestStatus
  filedAt: string
}

export type NewLeaveRequest = Pick<LeaveRequest, 'type' | 'startDate' | 'endDate' | 'reason'>

export type RequestKind = 'coe' | 'schedule_change' | 'overtime' | 'reimbursement' | 'other'

export type EmployeeRequest = {
  id: string
  kind: RequestKind
  title: string
  details: string
  status: RequestStatus
  filedAt: string
}

export type NewEmployeeRequest = Pick<EmployeeRequest, 'kind' | 'details'>

export type AnnouncementCategory = 'HR' | 'General' | 'Policy' | 'Event'

export type Announcement = {
  id: string
  category: AnnouncementCategory
  title: string
  excerpt: string
  body: string
  publishedAt: string
  author: string
  pinned?: boolean
}

export type Notification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  link?: string
  kind: 'payslip' | 'leave' | 'announcement' | 'request' | 'attendance'
}

export type CompanyInfo = {
  name: string
  about: string
  mission: string
  vision: string
  values: { title: string; description: string }[]
  offices: { name: string; address: string; phone: string }[]
  hotlines: { label: string; value: string }[]
  holidays: { date: string; name: string; type: 'Regular' | 'Special' }[]
}

export interface AzoneApi {
  login(email: string, password: string): Promise<Session>
  getMe(): Promise<Employee>
  updateContact(input: Pick<Employee, 'phone' | 'address' | 'emergencyContact'>): Promise<Employee>

  getPayslips(): Promise<Payslip[]>
  getPayslip(id: string): Promise<Payslip>

  getToday(): Promise<AttendanceDay>
  punch(kind: PunchKind): Promise<AttendanceDay>
  getAttendance(month: string): Promise<AttendanceDay[]>
  getAttendanceSummary(): Promise<AttendanceSummary>

  getLeaveBalances(): Promise<LeaveBalance[]>
  getLeaveRequests(): Promise<LeaveRequest[]>
  fileLeave(input: NewLeaveRequest): Promise<LeaveRequest>

  getRequests(): Promise<EmployeeRequest[]>
  createRequest(input: NewEmployeeRequest): Promise<EmployeeRequest>

  getAnnouncements(): Promise<Announcement[]>
  getAnnouncement(id: string): Promise<Announcement>

  getNotifications(): Promise<Notification[]>
  markNotificationsRead(ids?: string[]): Promise<void>

  getCompany(): Promise<CompanyInfo>
}
