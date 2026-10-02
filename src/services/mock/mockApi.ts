import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns'
import type { AzoneApi, AttendanceDay, EmployeeRequest, LeaveRequest, PunchKind, RequestKind } from '../types'
import * as db from './data'

/** In-memory stand-in for aznar-api, so the app works before the backend exists. */

const wait = <T>(value: T, ms = 350): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))

class NotFoundError extends Error {
  status = 404
}

let today: AttendanceDay = db.buildTodayRecord()
const punchOrder: PunchKind[] = ['timeIn', 'breakOut', 'breakIn', 'timeOut']

const requestTitles: Record<RequestKind, string> = {
  coe: 'Certificate of Employment',
  schedule_change: 'Schedule Change',
  overtime: 'Overtime Request',
  reimbursement: 'Reimbursement',
  other: 'General Request',
}

export const mockApi: AzoneApi = {
  async login(email) {
    return wait({ token: `mock.${btoa(email)}`, employee: db.employee }, 700)
  },
  getMe: () => wait(db.employee),
  async updateContact(input) {
    Object.assign(db.employee, input)
    return wait(db.employee, 500)
  },

  getPayslips: () => wait(db.payslips),
  async getPayslip(id) {
    const slip = db.payslips.find((p) => p.id === id)
    if (!slip) throw new NotFoundError('Payslip not found')
    return wait(slip)
  },

  async getToday() {
    if (today.date !== format(new Date(), 'yyyy-MM-dd')) today = db.buildTodayRecord()
    return wait(today)
  },
  async punch(kind) {
    const next = punchOrder.find((k) => today[k] === null)
    if (next !== kind) throw new Error(`Expected ${next ?? 'no more'} punch`)
    today = { ...today, [kind]: new Date().toISOString(), status: 'present' }
    if (kind === 'timeOut' && today.timeIn) {
      const worked = (Date.now() - parseISO(today.timeIn).getTime()) / 36e5 - 1
      today.hoursWorked = Math.max(0, Math.round(worked * 10) / 10)
    }
    return wait(today, 500)
  },
  getAttendance: (month) => wait(db.buildMonth(month)),
  async getAttendanceSummary() {
    const days = db.buildMonth(format(new Date(), 'yyyy-MM'))
    const now = new Date()
    const all = eachDayOfInterval({ start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0) })
    const presentDays = days.filter((d) => d.status === 'present' || d.status === 'late').length + (today.timeIn ? 1 : 0)
    return wait({
      presentDays,
      workingDays: all.filter((d) => !isWeekend(d)).length,
      lateCount: days.filter((d) => d.status === 'late').length,
      absences: days.filter((d) => d.status === 'absent').length,
    })
  },

  getLeaveBalances: () => wait(db.leaveBalances),
  getLeaveRequests: () => wait(db.leaveRequests),
  async fileLeave(input) {
    const workdays = eachDayOfInterval({ start: parseISO(input.startDate), end: parseISO(input.endDate) }).filter((d) => !isWeekend(d))
    const leave: LeaveRequest = {
      ...input,
      id: `lv_${Date.now()}`,
      days: Math.max(1, workdays.length),
      status: 'pending',
      filedAt: new Date().toISOString(),
    }
    db.leaveRequests.unshift(leave)
    return wait(leave, 600)
  },

  getRequests: () => wait(db.requests),
  async createRequest(input) {
    const request: EmployeeRequest = {
      ...input,
      id: `rq_${Date.now()}`,
      title: requestTitles[input.kind],
      status: 'pending',
      filedAt: new Date().toISOString(),
    }
    db.requests.unshift(request)
    return wait(request, 600)
  },

  getAnnouncements: () => wait(db.announcements),
  async getAnnouncement(id) {
    const item = db.announcements.find((a) => a.id === id)
    if (!item) throw new NotFoundError('Announcement not found')
    return wait(item)
  },

  getNotifications: () => wait(db.notifications, 200),
  async markNotificationsRead(ids) {
    db.notifications.forEach((n) => {
      if (!ids || ids.includes(n.id)) n.read = true
    })
    return wait(undefined, 150)
  },

  getCompany: () => wait(db.company),
}
