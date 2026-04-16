import { cn } from '@/lib/utils/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />
}

export function StatCardSkeleton() {
  return (
    <div className="card-premium space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="card-premium">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className={`w-full rounded-xl`} style={{ height }} />
    </div>
  )
}

export { Skeleton }
