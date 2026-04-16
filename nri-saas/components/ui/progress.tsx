import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils/cn'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: 'purple' | 'green' | 'blue' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  purple: 'bg-gradient-to-r from-violet-500 to-primary',
  green:  'bg-gradient-to-r from-emerald-500 to-green-400',
  blue:   'bg-gradient-to-r from-sky-500 to-blue-400',
  amber:  'bg-gradient-to-r from-amber-500 to-yellow-400',
  red:    'bg-gradient-to-r from-red-500 to-rose-400',
}

const sizeMap = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, color = 'purple', size = 'md', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative w-full overflow-hidden rounded-full bg-white/[0.08]', sizeMap[size], className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full rounded-full transition-all duration-700 ease-out', colorMap[color])}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
