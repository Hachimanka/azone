import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, FileText, PartyPopper, Settings } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { Announcement, AnnouncementCategory } from '@/services/types'
import { formatDate } from '@/lib/format'

const categoryStyle: Record<AnnouncementCategory, { tone: BadgeTone; icon: typeof FileText }> = {
  HR: { tone: 'primary', icon: CalendarDays },
  General: { tone: 'success', icon: Settings },
  Policy: { tone: 'violet', icon: FileText },
  Event: { tone: 'warning', icon: PartyPopper },
}

export function AnnouncementCard({ item }: { item: Announcement }) {
  const { tone, icon: Icon } = categoryStyle[item.category]
  return (
    <Link to={`/app/announcements/${item.id}`} className="card card-hover group flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={tone} size="sm" className="normal-case">
            {item.category}
          </Badge>
          <h3 className="mt-2.5 font-bold text-navy transition-colors group-hover:text-primary">{item.title}</h3>
          <p className="mt-1 text-xs text-muted">
            {formatDate(item.publishedAt)} <span className="mx-1">•</span> {item.author}
          </p>
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon className="size-6" />
        </span>
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{item.excerpt}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Read more <ArrowRight className="hover-arrow size-4 transition-transform" />
      </span>
    </Link>
  )
}
