import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { NewEmployeeRequest, NewLeaveRequest, PunchKind } from './types'

export const keys = {
  me: ['me'] as const,
  payslips: ['payslips'] as const,
  payslip: (id: string) => ['payslips', id] as const,
  today: ['attendance', 'today'] as const,
  month: (m: string) => ['attendance', 'month', m] as const,
  summary: ['attendance', 'summary'] as const,
  leaveBalances: ['leaves', 'balances'] as const,
  leaves: ['leaves', 'list'] as const,
  requests: ['requests'] as const,
  announcements: ['announcements'] as const,
  announcement: (id: string) => ['announcements', id] as const,
  notifications: ['notifications'] as const,
  company: ['company'] as const,
}

export const usePayslips = () => useQuery({ queryKey: keys.payslips, queryFn: api.getPayslips })
export const usePayslip = (id: string) => useQuery({ queryKey: keys.payslip(id), queryFn: () => api.getPayslip(id) })
export const useToday = () => useQuery({ queryKey: keys.today, queryFn: api.getToday })
export const useAttendanceMonth = (month: string) => useQuery({ queryKey: keys.month(month), queryFn: () => api.getAttendance(month) })
export const useAttendanceSummary = () => useQuery({ queryKey: keys.summary, queryFn: api.getAttendanceSummary })
export const useLeaveBalances = () => useQuery({ queryKey: keys.leaveBalances, queryFn: api.getLeaveBalances })
export const useLeaveRequests = () => useQuery({ queryKey: keys.leaves, queryFn: api.getLeaveRequests })
export const useRequests = () => useQuery({ queryKey: keys.requests, queryFn: api.getRequests })
export const useAnnouncements = () => useQuery({ queryKey: keys.announcements, queryFn: api.getAnnouncements })
export const useAnnouncement = (id: string) => useQuery({ queryKey: keys.announcement(id), queryFn: () => api.getAnnouncement(id) })
export const useNotifications = () => useQuery({ queryKey: keys.notifications, queryFn: api.getNotifications })
export const useCompany = () => useQuery({ queryKey: keys.company, queryFn: api.getCompany, staleTime: Infinity })

export function usePunch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (kind: PunchKind) => api.punch(kind),
    onSuccess: (day) => {
      qc.setQueryData(keys.today, day)
      qc.invalidateQueries({ queryKey: keys.summary })
    },
  })
}

export function useFileLeave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewLeaveRequest) => api.fileLeave(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }),
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEmployeeRequest) => api.createRequest(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.requests }),
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids?: string[]) => api.markNotificationsRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  })
}
