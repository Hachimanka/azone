import { forwardRef, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from './Field'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Password field with a lock icon, a Show/Hide eye and a Caps Lock warning (same behaviour as aznar-fleetwatch). */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(({ onKeyDown, onKeyUp, onBlur, className, ...props }, ref) => {
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const checkCapsLock = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState('CapsLock'))

  return (
    <>
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          spellCheck={false}
          autoCapitalize="off"
          className={`pr-11 pl-10 ${className ?? ''}`}
          onKeyDown={(e) => {
            checkCapsLock(e)
            onKeyDown?.(e)
          }}
          onKeyUp={(e) => {
            checkCapsLock(e)
            onKeyUp?.(e)
          }}
          onBlur={(e) => {
            setCapsLock(false)
            onBlur?.(e) // react-hook-form's register() relies on this
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg p-2 text-muted transition hover:bg-primary-50 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {capsLock && <span className="mt-1 block text-xs font-semibold text-warning">Caps Lock is on.</span>}
    </>
  )
})
PasswordInput.displayName = 'PasswordInput'
