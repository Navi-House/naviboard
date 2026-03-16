"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart3, Coins, Cpu, Zap, Hash, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from "recharts";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatSkeleton } from "@/components/loading-skeleton";
import { DataTable, type Column } from "@/components/data-table";

interface ModelStats {
  provider: string; model: string; requests: number;
  inputTokens: number; outputTokens: number;
  cacheReadTokens: number; cacheWriteTokens: number;
  totalTokens: number; totalCost: number;
}

interface DailyStats {
  date: string; requests: number; totalTokens: number; totalCost: number;
  models: Record<string, number>;
}

interface Summary {
  totalRequests: number; totalTokens: number; totalCost: number;
  modelCount: number; range: number;
}

interface UsageData {
  summary: Summary; models: ModelStats[]; daily: DailyStats[];
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#d97706", google: "#3b82f6", ollama: "#10b981", openai: "#8b5cf6",
};
const CHART_COLORS = ["#d97706", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f59e0b", "#ec4899"];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function formatCost(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chartTooltipStyle: any = {
  contentStyle: {
    background: "rgba(15,15,20,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    fontSize: 12,
    backdropFilter: "blur(12px)",
  },
  labelStyle: { color: "#999" },
};

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/usage?range=${range}`);
    setData(await res.json());
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const pieData = data?.models.map((m, i) => ({
    name: m.model, value: m.totalTokens, fill: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  const dailyChartData = data?.daily.map(d => ({
    date: d.date.slice(5),
    requests: d.requests,
    tokens: d.totalTokens,
    cost: d.totalCost,
  })) || [];

  const rangeActions = (
    <div className="flex items-center gap-2">
      {[7, 30, 90].map(r => (
        <button key={r} onClick={() => setRange(r)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
            range === r
              ? "bg-gradient-to-r from-violet-500/20 to-blue-500/20 text-foreground border border-violet-500/20"
              : "glass-card text-muted-foreground hover:text-foreground/70"
          }`}>{r}d</button>
      ))}
    </div>
  );

  const modelColumns: Column<ModelStats>[] = [
    {
      key: "provider", label: "Provider", sortable: true,
      render: (m, i) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[m.provider] || CHART_COLORS[i % CHART_COLORS.length] }} />
          <span className="text-xs text-muted-foreground capitalize">{m.provider}</span>
        </div>
      ),
    },
    {
      key: "model", label: "Model", sortable: true,
      render: (m) => <span className="font-mono text-xs font-medium">{m.model}</span>,
    },
    {
      key: "requests", label: "Requests", align: "right" as const, sortable: true,
      render: (m) => <span className="font-mono">{m.requests.toLocaleString()}</span>,
    },
    {
      key: "inputTokens", label: "Input", align: "right" as const, sortable: true,
      render: (m) => <span className="font-mono text-muted-foreground">{formatTokens(m.inputTokens)}</span>,
    },
    {
      key: "outputTokens", label: "Output", align: "right" as const, sortable: true,
      render: (m) => <span className="font-mono text-muted-foreground">{formatTokens(m.outputTokens)}</span>,
    },
    {
      key: "cacheReadTokens", label: "Cache R/W", align: "right" as const,
      render: (m) => <span className="font-mono text-muted-foreground/60 text-xs">{formatTokens(m.cacheReadTokens)} / {formatTokens(m.cacheWriteTokens)}</span>,
    },
    {
      key: "totalTokens", label: "Total", align: "right" as const, sortable: true,
      render: (m) => <span className="font-mono font-medium">{formatTokens(m.totalTokens)}</span>,
    },
    {
      key: "totalCost", label: "Cost", align: "right" as const, sortable: true,
      render: (m) => (
        <span className={`font-mono font-medium ${m.totalCost > 0 ? "text-emerald-500" : "text-muted-foreground/60"}`}>
          {formatCost(m.totalCost)}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={BarChart3}
        iconColor="text-blue-400"
        iconGradient="from-blue-500/20 to-blue-600/5"
        title="LLM Usage"
        description="Token consumption and model activity"
        onRefresh={load}
        actions={rangeActions}
      />

      {loading ? (
        <StatSkeleton count={4} />
      ) : !data || data.summary.totalRequests === 0 ? (
        <EmptyState icon={BarChart3} title="No usage data for this period" />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Hash} label="Total Requests" value={data.summary.totalRequests.toLocaleString()}
              iconColor="text-violet-400" iconGradient="from-violet-500/20 to-violet-600/5" delay={0} />
            <StatCard icon={Zap} label="Total Tokens" value={formatTokens(data.summary.totalTokens)}
              iconColor="text-blue-400" iconGradient="from-blue-500/20 to-blue-600/5" delay={80} />
            <StatCard icon={Coins} label="Total Cost" value={formatCost(data.summary.totalCost)}
              iconColor="text-emerald-400" iconGradient="from-emerald-500/20 to-emerald-600/5" delay={160} />
            <StatCard icon={Cpu} label="Models Used" value={data.summary.modelCount.toString()}
              iconColor="text-amber-400" iconGradient="from-amber-500/20 to-amber-600/5" delay={240} />
          </div>

          {/* Daily Activity Chart */}
          {dailyChartData.length > 1 && (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Daily Activity
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData}>
                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#888", fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip {...chartTooltipStyle}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [Number(value).toLocaleString(), "Requests"]}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Model Breakdown + Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Requests by Model
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.models.map(m => ({
                    model: m.model.length > 20 ? m.model.slice(0, 18) + "…" : m.model,
                    requests: m.requests,
                    provider: m.provider,
                  }))}>
                    <XAxis dataKey="model" tick={{ fill: "#888", fontSize: 10 }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#888", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                      {data.models.map((m, i) => (
                        <Cell key={i} fill={PROVIDER_COLORS[m.provider] || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Token Share
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" labelLine={false} />
                    <Tooltip {...chartTooltipStyle}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => formatTokens(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {data.models.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PROVIDER_COLORS[m.provider] || CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground truncate flex-1">{m.model}</span>
                    <span className="text-muted-foreground/60 font-mono">{formatTokens(m.totalTokens)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Details Table */}
          <DataTable
            icon={Cpu}
            title="Model Breakdown"
            columns={modelColumns}
            data={data.models}
            keyFn={(_, i) => i}
            footer={
              <tr className="border-t-2 border-border font-medium">
                <td colSpan={2} className="p-4 text-xs text-muted-foreground uppercase tracking-wider">Total</td>
                <td className="p-4 text-right font-mono">{data.summary.totalRequests.toLocaleString()}</td>
                <td className="p-4 text-right font-mono text-muted-foreground">{formatTokens(data.models.reduce((s, m) => s + m.inputTokens, 0))}</td>
                <td className="p-4 text-right font-mono text-muted-foreground">{formatTokens(data.models.reduce((s, m) => s + m.outputTokens, 0))}</td>
                <td className="p-4 text-right font-mono text-muted-foreground/60 text-xs">
                  {formatTokens(data.models.reduce((s, m) => s + m.cacheReadTokens, 0))} / {formatTokens(data.models.reduce((s, m) => s + m.cacheWriteTokens, 0))}
                </td>
                <td className="p-4 text-right font-mono">{formatTokens(data.summary.totalTokens)}</td>
                <td className="p-4 text-right font-mono text-emerald-500">{formatCost(data.summary.totalCost)}</td>
              </tr>
            }
          />
        </>
      )}
    </div>
  );
}
