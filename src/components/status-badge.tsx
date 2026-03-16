"use client";

interface StatusBadgeProps {
  status: "active" | "idle" | "enabled" | "disabled" | "running" | "error" | "warning";
  label?: string;
  pulse?: boolean;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  enabled: { dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  running: { dot: "bg-cyan-400", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  idle: { dot: "bg-gray-400 dark:bg-white/20", text: "text-gray-500 dark:text-white/40", bg: "bg-gray-50 dark:bg-white/[0.04]" },
  disabled: { dot: "bg-gray-400 dark:bg-white/20", text: "text-gray-500 dark:text-white/40", bg: "bg-gray-50 dark:bg-white/[0.04]" },
  error: { dot: "bg-red-400", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  warning: { dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
};

export function StatusBadge({ status, label, pulse }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.idle;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.text} ${style.bg}`}>
      <span className="relative flex h-2 w-2">
        {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-40`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      {displayLabel}
    </span>
  );
}
