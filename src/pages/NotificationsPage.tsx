import { useNavigate } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { Bell, CalendarDays, Clock, FileText, Megaphone, Send } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconTile } from '@/components/ui/IconTile'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui/Misc'
import { useMarkNotificationsRead, useNotifications } from '@/services/queries'
import type { Notification } from '@/services/types'
import { cn } from '@/lib/cn'

const icons: Record<Notification['kind'], typeof Bell> = {
  payslip: FileText,
  leave: CalendarDays,
  announcement: Megaphone,
  request: Send,
  attendance: Clock,
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const navigate = useNavigate()
  const hasUnread = data?.some((n) => !n.read)

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Notifications are kept for 30 days, then deleted automatically."
        actions={
          hasUnread && (
            <Button variant="soft" size="sm" onClick={() => markRead.mutate(undefined)}>
              Mark all as read
            </Button>
          )
        }
      />
      <Card className="divide-y divide-line">
        {isLoading ? (
          <Skeleton className="m-5 h-24" />
        ) : !data?.length ? (
          <EmptyState icon={Bell} title="You're all caught up" />
        ) : (
          data.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead.mutate([n.id])
                if (n.link) navigate(n.link)
              }}
              className={cn('flex w-full items-start gap-4 p-4 text-left transition hover:bg-primary-50/60 sm:p-5', !n.read && 'bg-primary-50/40')}
            >
              <IconTile icon={icons[n.kind]} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{n.title}</p>
                <p className="text-sm text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-muted/80">{formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              {!n.read && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
            </button>
          ))
        )}
      </Card>
    </>
  )
}
