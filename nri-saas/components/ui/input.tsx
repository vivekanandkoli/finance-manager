import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm flex items-center">
              {prefix}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'input-base',
              prefix && 'pl-10',
              suffix && 'pr-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm flex items-center">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
