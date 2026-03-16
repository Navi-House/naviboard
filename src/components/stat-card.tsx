"use client";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconGradient?: string;
  trend?: { value: string; positive?: boolean };
  suffix?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = "text-violet-400",
  iconGradient = "from-violet-500/20 to-violet-600/5",
  trend,
  suffix,
  className = "",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/[0.1] animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${iconGradient}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight animate-count-up">{value}</span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-emerald-500" : "text-red-400"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
