import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { RequestStatus } from '@/services/types'

const tones: Record<RequestStatus, BadgeTone> = { pending: 'warning', approved: 'success', rejected: 'danger' }

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge tone={tones[status]} size="sm">
      {status}
    </Badge>
  )
}
