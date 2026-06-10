import React from 'react';

const Skeleton = ({ className = '', count = 1, height = 'h-4', width = 'w-full' }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`bg-neutral-200 rounded animate-pulse ${height} ${width} ${className}`}
      />
    ))}
  </>
);

export const SkeletonTable = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton height="h-10" width="w-full" />
      </div>
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-6 space-y-4">
    <Skeleton height="h-6" width="w-32" />
    <Skeleton height="h-4" />
    <Skeleton height="h-4" width="w-48" />
  </div>
);

export default Skeleton;
