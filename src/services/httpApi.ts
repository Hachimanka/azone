import { useAuth } from '@/store/auth'
import type { AzoneApi, Session } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAuth.getState().session?.token
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 401) useAuth.getState().logout()
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.message ?? res.statusText, res.status)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

const json = (body: unknown) => JSON.stringify(body)

/** Real aznar-api adapter — AZONE routes live under /azone, auth under /auth. */
export const httpApi: AzoneApi = {
  login: (email, password) => request<Session>('/auth/login', { method: 'POST', body: json({ email, password, app: 'azone' }) }),
  requestPasswordReset: (email) => request<void>('/auth/forgot-password', { method: 'POST', body: json({ email }) }),
  changePassword: (currentPassword, newPassword) =>
    request<Session>('/azone/me/password', { method: 'POST', body: json({ currentPassword, newPassword }) }),
  getMe: () => request('/azone/me'),
  updateContact: (input) => request('/azone/me/contact', { method: 'PATCH', body: json(input) }),
  setAvatar: (dataUrl) => request('/azone/me/avatar', { method: 'PUT', body: json({ dataUrl }) }),
  removeAvatar: () => request('/azone/me/avatar', { method: 'DELETE' }),

  getPayslips: () => request('/azone/payslips'),
  getPayslip: (id) => request(`/azone/payslips/${id}`),

  getToday: () => request('/azone/attendance/today'),
  getAttendance: (month) => request(`/azone/attendance?month=${month}`),
  getAttendanceSummary: () => request('/azone/attendance/summary'),

  getLeaveBalances: () => request('/azone/leaves/balances'),
  getLeaveRequests: () => request('/azone/leaves'),
  fileLeave: (input) => request('/azone/leaves', { method: 'POST', body: json(input) }),

  getRequests: () => request('/azone/requests'),
  createRequest: (input) => request('/azone/requests', { method: 'POST', body: json(input) }),

  getAnnouncements: () => request('/azone/announcements'),
  getAnnouncement: (id) => request(`/azone/announcements/${id}`),

  getNotifications: () => request('/azone/notifications'),
  markNotificationsRead: (ids) => request('/azone/notifications/read', { method: 'POST', body: json({ ids }) }),

  getCompany: () => request('/azone/company'),
}
