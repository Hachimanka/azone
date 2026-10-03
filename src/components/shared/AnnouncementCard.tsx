import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ChevronRight, FileText, PartyPopper, Settings } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { Announcement, AnnouncementCategory } from '@/services/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const categoryStyle: Record<AnnouncementCategory, { tone: BadgeTone; icon: typeof FileText }> = {
  HR: { tone: 'primary', icon: CalendarDays },
  General: { tone: 'success', icon: Settings },
  Policy: { tone: 'violet', icon: FileText },
  Event: { tone: 'warning', icon: PartyPopper },
}

export const announcementTone = (category: AnnouncementCategory) => categoryStyle[category].tone

/** Per-category accent for the compact card: top stripe + icon tile, matching the badge colour. */
const categoryAccent: Record<AnnouncementCategory, { stripe: string; tile: string }> = {
  HR: { stripe: 'bg-primary', tile: 'bg-primary-50 text-primary' },
  General: { stripe: 'bg-success', tile: 'bg-success-50 text-success' },
  Policy: { stripe: 'bg-violet', tile: 'bg-violet-50 text-violet' },
  Event: { stripe: 'bg-warning', tile: 'bg-warning-50 text-warning' },
}

/** Links to the detail page, or calls `onOpen` instead when given (e.g. to show it in a dialog). */
export function AnnouncementCard({ item, onOpen, compact }: { item: Announcement; onOpen?: (item: Announcement) => void; compact?: boolean }) {
  const { tone, icon: Icon } = categoryStyle[item.category]
  const className = cn('card card-hover group flex flex-col text-left', compact ? 'relative overflow-hidden py-3 pr-3 pl-4 sm:p-4' : 'p-4 sm:p-5')
  const content = compact ? (
    <CompactContent item={item} />
  ) : (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={tone} size="sm" className="normal-case">
            {item.category}
          </Badge>
          <h3 className="mt-2 line-clamp-1 text-[15px] font-bold text-navy sm:mt-2.5 sm:line-clamp-none sm:text-base transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[11px] text-muted sm:text-xs">
            {formatDate(item.publishedAt)} <span className="mx-1">•</span> {item.author}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 bg-gradient-to-br from-primary-50 to-primary-100 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon className="size-5 sm:size-6" />
        </span>
      </div>
      <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted sm:mt-3 sm:text-sm">{item.excerpt}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary sm:mt-4 sm:text-sm">
        Read more <ArrowRight className="hover-arrow size-4 transition-transform" />
      </span>
    </>
  )

  return onOpen ? (
    <button type="button" onClick={() => onOpen(item)} className={className}>
      {content}
    </button>
  ) : (
    <Link to={`/app/announcements/${item.id}`} className={className}>
      {content}
    </Link>
  )
}

/** Tighter layout for narrow grids (e.g. two per row on the dashboard on phones): icon beside the badge, excerpt only from `sm` up. */
function CompactContent({ item }: { item: Announcement }) {
  const { tone, icon: Icon } = categoryStyle[item.category]
  const accent = categoryAccent[item.category]
  return (
    <>
      {/* Category stripe: down the left edge on phones (row layout), across the top from sm up (card layout) */}
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1 sm:inset-x-0 sm:top-0 sm:bottom-auto sm:h-1 sm:w-auto', accent.stripe)} />

      {/* Phones: one per row, laid out horizontally */}
      <div className="flex items-center gap-3 sm:hidden">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', accent.tile)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            <Badge tone={tone} size="sm" className="normal-case">
              {item.category}
            </Badge>
            <span className="truncate text-[11px] text-muted">{formatDate(item.publishedAt)}</span>
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-navy">{item.title}</h3>
        </div>
        <ChevronRight className="size-5 shrink-0 text-orange-600 dark:text-amber-300" />
      </div>

      {/* sm and up: vertical card */}
      <div className="hidden flex-1 flex-col sm:flex">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={tone} size="sm" className="normal-case">
            {item.category}
          </Badge>
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6',
              accent.tile,
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-[15px] leading-snug font-bold text-navy transition-colors group-hover:text-orange-600 dark:group-hover:text-amber-300">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-muted">{formatDate(item.publishedAt)}</p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-semibold text-orange-600 dark:text-amber-300">
          Read more <ArrowRight className="hover-arrow size-3.5 transition-transform" />
        </span>
      </div>
    </>
  )
}

/** Vivid per-category gradient for the announcement dialog header (fixed colours so it pops in light and dark mode). */
const bannerGradient: Record<AnnouncementCategory, string> = {
  HR: 'from-blue-600 via-blue-700 to-indigo-800',
  General: 'from-emerald-500 via-emerald-600 to-teal-700',
  Policy: 'from-violet-500 via-violet-600 to-purple-800',
  Event: 'from-amber-500 via-orange-500 to-orange-700',
}

/** Coloured header for the announcement dialog: category icon + pill, title, date and author. */
export function AnnouncementBanner({ item }: { item: Announcement }) {
  const Icon = categoryStyle[item.category].icon
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br px-6 pt-7 pb-6 pr-14 text-white', bannerGradient[item.category])}>
      <span aria-hidden className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-white/15 blur-sm" />
      <span aria-hidden className="pointer-events-none absolute -bottom-16 left-1/3 size-36 rounded-full bg-white/10" />

      <div className="relative flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
          <Icon className="size-6" />
        </span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold ring-1 ring-white/30">{item.category}</span>
      </div>
      <h2 className="relative mt-4 text-xl leading-snug font-bold text-white sm:text-2xl">{item.title}</h2>
      <p className="relative mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-white/85">
        <CalendarDays className="size-4" />
        {formatDate(item.publishedAt, 'MMMM d, yyyy')}
        <span aria-hidden>·</span>
        {item.author}
      </p>
    </div>
  )
}
