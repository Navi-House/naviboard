"use client";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`glass-card animate-shimmer rounded-2xl ${className}`} />
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-12 border-b border-border animate-shimmer" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-b border-border/50 animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

export { Skeleton };
