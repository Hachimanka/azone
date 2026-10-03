import type { ReactNode } from 'react'
import * as RD from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Always required: it's what screen readers announce, even when `header` replaces the visible title. */
  title: string
  description?: string
  /** Replaces the default title block with a custom (coloured) banner; the close button turns white over it. */
  header?: ReactNode
  /** Pinned action bar below the scrolling body. */
  footer?: ReactNode
  children: ReactNode
}

/** Bottom sheet on phones, centered modal on desktop. Header and footer stay put; only the body scrolls. */
export function Dialog({ open, onOpenChange, title, description, header, footer, children }: DialogProps) {
  // Bottom padding must clear the phone home indicator, but never drop below the normal 1.5rem
  const safeBottom = 'pb-[max(1.5rem,env(safe-area-inset-bottom))]'

  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="dialog-overlay fixed inset-0 z-50 bg-navy/30 backdrop-blur-[3px] print:hidden dark:bg-black/60" />
        <RD.Content className="dialog-sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border-t border-line bg-surface shadow-float sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border">
          {/* Grab handle so the phone bottom sheet reads as a sheet */}
          <span
            aria-hidden
            className={cn('absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full sm:hidden', header ? 'bg-white/50' : 'bg-line')}
          />

          {header ? (
            <>
              <RD.Title className="sr-only">{title}</RD.Title>
              <RD.Description className="sr-only">{description ?? title}</RD.Description>
              {header}
            </>
          ) : (
            <div className="border-b border-line px-6 pt-6 pb-4 pr-14">
              <RD.Title className="text-lg leading-snug font-bold text-navy">{title}</RD.Title>
              <RD.Description className={description ? 'mt-1 text-sm text-muted' : 'sr-only'}>{description ?? title}</RD.Description>
            </div>
          )}

          <RD.Close
            aria-label="Close"
            className={cn(
              'absolute top-4 right-4 z-10 rounded-full p-1.5 transition focus:outline-none focus-visible:ring-4',
              header
                ? 'bg-white/15 text-white hover:bg-white/25 focus-visible:ring-white/30'
                : 'text-muted hover:bg-primary-50 hover:text-primary focus-visible:ring-primary-100',
            )}
          >
            <X className="size-5" />
          </RD.Close>

          <div className={cn('flex-1 overflow-y-auto px-6 pt-5', footer ? 'pb-5' : safeBottom)}>{children}</div>

          {footer && <div className={cn('border-t border-line bg-bg/60 px-6 pt-4', safeBottom)}>{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  )
}
