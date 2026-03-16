"use client";
import { useState, useMemo, type ReactNode } from "react";
import { type LucideIcon, ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  icon?: LucideIcon;
  title?: string;
  columns: Column<T>[];
  data: T[];
  keyFn: (item: T, index: number) => string | number;
  footer?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  icon: Icon,
  title,
  columns,
  data,
  keyFn,
  footer,
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir, columns]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className={`glass-card rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="p-5 border-b border-border">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {title}
          </h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 text-[10px] uppercase tracking-widest text-muted-foreground font-medium ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  } ${col.sortable ? "cursor-pointer select-none hover:text-foreground/60 transition-colors" : ""} ${col.className || ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, i) => (
              <tr
                key={keyFn(item, i)}
                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-4 ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    } ${col.className || ""}`}
                  >
                    {col.render(item, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  );
}
