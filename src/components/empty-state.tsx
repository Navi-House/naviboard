"use client";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
      {emoji && <div className="text-4xl mb-4">{emoji}</div>}
      {Icon && !emoji && (
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-gray-200/80 dark:border-white/[0.06]">
            <Icon className="w-8 h-8 text-muted-foreground/40" />
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/60 mt-1.5">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
