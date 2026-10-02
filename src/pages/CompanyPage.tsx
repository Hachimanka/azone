import { Building2, CalendarHeart, Eye, Headset, MapPin, Target } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { IconTile } from '@/components/ui/IconTile'
import { PageHeader, Skeleton } from '@/components/ui/Misc'
import { useCompany } from '@/services/queries'
import { formatDate } from '@/lib/format'

export function CompanyPage() {
  const { data, isLoading } = useCompany()
  if (isLoading || !data) return <Skeleton className="h-96" />

  return (
    <>
      <PageHeader eyebrow="About us" title="Company Information" description={data.about} />

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="card-hover p-6">
          <IconTile icon={Target} />
          <h2 className="mt-4 font-bold">Our Mission</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{data.mission}</p>
        </Card>
        <Card className="card-hover p-6">
          <IconTile icon={Eye} />
          <h2 className="mt-4 font-bold">Our Vision</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{data.vision}</p>
        </Card>
      </div>

      <h2 className="mt-8 mb-4 text-lg font-bold">Core Values</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {data.values.map((v, i) => (
          <Card key={v.title} className="card-hover p-5">
            <span className="text-3xl font-extrabold text-primary-200">0{i + 1}</span>
            <p className="mt-2 font-bold text-navy">{v.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{v.description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <CardHeader icon={Building2} title="Offices" />
          <ul className="mt-4 space-y-4">
            {data.offices.map((o) => (
              <li key={o.name} className="flex gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block font-semibold text-navy">{o.name}</span>
                  <span className="block text-muted">{o.address}</span>
                  <span className="block text-muted">{o.phone}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <CardHeader icon={Headset} title="Hotlines" />
          <ul className="mt-4 space-y-3 text-sm">
            {data.hotlines.map((h) => (
              <li key={h.label}>
                <span className="block font-semibold text-navy">{h.label}</span>
                <span className="block text-muted">{h.value}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6">
          <CardHeader icon={CalendarHeart} title="Upcoming Holidays" />
          <ul className="mt-4 divide-y divide-line text-sm">
            {data.holidays.slice(0, 6).map((h) => (
              <li key={h.date} className="flex items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="block font-semibold text-navy">{h.name}</span>
                  <span className="block text-xs text-muted">{formatDate(h.date, 'EEEE, MMMM d')}</span>
                </span>
                <Badge size="sm" tone={h.type === 'Regular' ? 'primary' : 'neutral'}>
                  {h.type}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
