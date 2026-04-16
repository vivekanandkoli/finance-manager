import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-primary/15 text-primary border border-primary/20',
        success:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
        warning:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        danger:   'bg-red-500/15 text-red-400 border border-red-500/20',
        blue:     'bg-sky-500/15 text-sky-400 border border-sky-500/20',
        gray:     'bg-white/08 text-muted-foreground border border-white/10',
        nre:      'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
        nro:      'bg-sky-500/12 text-sky-400 border border-sky-500/20',
        fcnr:     'bg-violet-500/12 text-violet-400 border border-violet-500/20',
        outline:  'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
