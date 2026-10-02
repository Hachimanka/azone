import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Megaphone } from 'lucide-react'
import { PageHeader, Skeleton, EmptyState } from '@/components/ui/Misc'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AnnouncementCard } from '@/components/shared/AnnouncementCard'
import { useAnnouncement, useAnnouncements } from '@/services/queries'
import type { AnnouncementCategory } from '@/services/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const filters: ('All' | AnnouncementCategory)[] = ['All', 'HR', 'General', 'Policy', 'Event']

export function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncements()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const items = data?.filter((a) => filter === 'All' || a.category === filter) ?? []

  return (
    <>
      <PageHeader eyebrow="Company news" title="Announcements" description="Updates from HR, IT and management." />
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition',
              filter === f ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink hover:border-primary-200 hover:text-primary',
            )}
          >
            {f}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing here yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <AnnouncementCard key={a.id} item={a} />
          ))}
        </div>
      )}
    </>
  )
}

export function AnnouncementDetailPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useAnnouncement(id)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/announcements" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary">
        <ArrowLeft className="size-4" /> All announcements
      </Link>
      <Card className="p-6 sm:p-10">
        {isError ? (
          <EmptyState icon={Megaphone} title="Announcement not found" />
        ) : isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <article>
            <Badge size="sm" className="normal-case">
              {data.category}
            </Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{data.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {formatDate(data.publishedAt, 'MMMM d, yyyy')} · {data.author}
            </p>
            <div className="mt-6 space-y-4 leading-relaxed text-ink">
              {data.body.split('\n\n').map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          </article>
        )}
      </Card>
    </div>
  )
}
