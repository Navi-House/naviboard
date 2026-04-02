"use client";
import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { Clock, Play, Trash2, ToggleLeft, ToggleRight, Terminal, Cpu } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/loading-skeleton";
import { StatusBadge } from "@/components/status-badge";

interface CronJob {
  id?: string;
  name?: string;
  schedule?: string;
  enabled?: boolean;
  source?: "openclaw" | "system";
  nextRun?: string;
  lastRun?: string;
  payload?: string;
  [key: string]: unknown;
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/cron");
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function doAction(action: string, id: string) {
    await apiFetch("/api/cron", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    loadJobs();
  }

  const isSystem = (job: CronJob) => job.source === "system";

  return (
    <div>
      <PageHeader
        icon={Clock}
        title="Cron Jobs"
        description="Scheduled tasks and automation"
        onRefresh={loadJobs}
      />

      {loading ? (
        <ListSkeleton count={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          emoji="⏰"
          title="No cron jobs found"
          description="Use openclaw cron add to create jobs"
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const id = job.id || String(i);
            const sys = isSystem(job);
            return (
              <div
                key={id}
                className="glass-card gradient-border p-5 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/[0.1] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-sm">{job.name || id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        sys
                          ? "bg-amber-500/10 text-amber-500/80 border border-amber-500/10"
                          : "bg-violet-500/10 text-violet-400/80 border border-violet-500/10"
                      }`}>
                        {sys ? <><Terminal className="w-3 h-3" /> system</> : <><Cpu className="w-3 h-3" /> openclaw</>}
                      </span>
                      {job.enabled !== false && (
                        <StatusBadge status="active" label="" pulse />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-1.5 font-mono tracking-wide">
                      {job.schedule || "—"}
                    </div>
                    {job.nextRun && (
                      <div className="text-[11px] text-muted-foreground/40 mt-1">
                        Next: {new Date(job.nextRun).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!sys && (
                      <>
                        <button
                          onClick={() => doAction(job.enabled ? "disable" : "enable", id)}
                          className="p-2 rounded-lg hover:bg-accent transition-all duration-200"
                          title={job.enabled ? "Disable" : "Enable"}
                        >
                          {job.enabled
                            ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                            : <ToggleLeft className="w-5 h-5 text-muted-foreground/40" />
                          }
                        </button>
                        <button
                          onClick={() => doAction("run", id)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground/60 hover:text-violet-400 transition-all duration-200"
                          title="Run now"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this job?")) doAction("remove", id); }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {job.payload && (
                      <button
                        onClick={() => setExpanded(expanded === id ? null : id)}
                        className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 px-3 py-1.5 rounded-lg hover:bg-accent transition-all duration-200"
                      >
                        {expanded === id ? "hide" : "details"}
                      </button>
                    )}
                  </div>
                </div>

                {expanded === id && job.payload && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                    <pre className="text-xs text-muted-foreground/60 font-mono whitespace-pre-wrap break-all bg-secondary/50 rounded-lg p-3">
                      {job.payload}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
