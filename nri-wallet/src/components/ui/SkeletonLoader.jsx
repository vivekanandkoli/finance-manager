import React from 'react';

/**
 * Skeleton Loader Component for better perceived performance
 */
export const SkeletonLoader = React.memo(({ 
  width = '100%', 
  height = '20px',
  className = '',
  count = 1,
  circle = false
}) => {
  const skeletonClass = `animate-pulse bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`;
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={{ width, height }}
        />
      ))}
    </>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

/**
 * Card Skeleton for expense/transaction cards
 */
export const CardSkeleton = React.memo(() => (
  <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonLoader width="150px" height="24px" />
      <SkeletonLoader width="80px" height="24px" />
    </div>
    <SkeletonLoader width="100%" height="16px" count={2} className="mb-2" />
    <div className="flex gap-2">
      <SkeletonLoader width="60px" height="28px" />
      <SkeletonLoader width="60px" height="28px" />
    </div>
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Table Skeleton for data tables
 */
export const TableSkeleton = React.memo(({ rows = 5, columns = 4 }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex gap-4 pb-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader key={i} width="150px" height="20px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} width="150px" height="16px" />
        ))}
      </div>
    ))}
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

/**
 * Dashboard Card Skeleton
 */
export const DashboardCardSkeleton = React.memo(() => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <SkeletonLoader width="120px" height="16px" className="mb-4" />
    <SkeletonLoader width="180px" height="36px" className="mb-2" />
    <SkeletonLoader width="100px" height="14px" />
  </div>
));

DashboardCardSkeleton.displayName = 'DashboardCardSkeleton';

export default SkeletonLoader;
