'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-primary to-violet-400 text-white shadow-[0_4px_14px_rgba(108,99,255,0.35)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.45)] hover:-translate-y-px active:translate-y-0',
        secondary:
          'bg-white/[0.06] border border-white/10 text-foreground hover:bg-white/10 hover:border-white/16',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-white/05 hover:border-white/16',
        ghost:
          'text-muted-foreground hover:text-foreground hover:bg-white/06',
        destructive:
          'bg-destructive/15 border border-destructive/25 text-destructive hover:bg-destructive/25',
        success:
          'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 px-3.5 py-2 text-xs rounded-lg',
        lg: 'h-12 px-7 py-3 text-base rounded-xl',
        xl: 'h-14 px-8 py-4 text-base rounded-2xl',
        icon: 'h-9 w-9 rounded-xl',
        'icon-sm': 'h-7 w-7 rounded-lg text-xs',
        'icon-lg': 'h-11 w-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading…</span>
          </>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
