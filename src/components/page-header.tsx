"use client";
import { type LucideIcon } from "lucide-react";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconGradient?: string;
  title: string;
  description: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconColor = "text-violet-400",
  iconGradient = "from-violet-500/10 to-blue-500/10",
  title,
  description,
  onRefresh,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-3 tracking-tight">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${iconGradient} border border-gray-200/80 dark:border-white/[0.06]`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-12">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground/60 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
