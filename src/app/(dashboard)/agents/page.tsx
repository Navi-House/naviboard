"use client";
import { useEffect, useState, useCallback } from "react";
import { Bot, RefreshCw, Zap, Globe, FolderOpen, Activity } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  model: string;
  workspace: string;
  isDefault: boolean;
  bindings: number;
  routes: string[];
  sessionCount: number;
  totalTokens: number;
  contextTokens: number;
  contextPercent: number;
  lastActive: string;
  status: string;
}

const MODEL_COLORS: Record<string, string> = {
  claude: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  gpt: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  gemini: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  ollama: "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20",
  default: "bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/40 border border-gray-200 dark:border-white/10",
};

function getModelStyle(model: string): string {
  const lower = model.toLowerCase();
  for (const [key, val] of Object.entries(MODEL_COLORS)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return MODEL_COLORS.default;
}

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-3 tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-gray-200/80 dark:border-white/[0.06]">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            Agents
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/30 mt-1 ml-12">Configured AI agents</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-600 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-all duration-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2].map(i => <div key={i} className="glass-card h-40 animate-shimmer" />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-3xl mb-3">🤖</div>
          <p className="text-gray-600 dark:text-white/40 text-sm">No agents configured</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className="glass-card gradient-border p-6 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/[0.1] animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{agent.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{agent.name}</span>
                      {agent.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-white/30 font-mono">{agent.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.status === "active" ? "bg-emerald-400" : "bg-gray-400 dark:bg-white/20"}`} />
                  <span className={`text-xs font-medium ${agent.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-white/30"}`}>
                    {agent.status === "active" ? "Active" : "Idle"}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest block mb-1">Model</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${getModelStyle(agent.model)}`}>
                    <Zap className="w-3 h-3" />
                    {agent.model.split("/").pop()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest block mb-1">Sessions</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-white/60">{agent.sessionCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest block mb-1">Tokens Used</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-white/60">{formatTokens(agent.totalTokens)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest block mb-1">Last Active</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-white/60">{agent.lastActive}</span>
                </div>
              </div>

              {/* Context usage bar */}
              {agent.contextTokens > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 dark:text-white/20 uppercase tracking-widest">Context Window</span>
                    <span className="text-[10px] text-gray-500 dark:text-white/30">{agent.contextPercent}% used</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        agent.contextPercent > 80 ? "bg-red-500" : agent.contextPercent > 50 ? "bg-amber-500" : "bg-violet-500"
                      }`}
                      style={{ width: `${Math.min(agent.contextPercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer details */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-white/25">
                <div className="flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" />
                  <span className="font-mono truncate max-w-[200px]">{agent.workspace.replace(/^\/home\/\w+\//, "~/")}</span>
                </div>
                {agent.routes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{agent.routes[0]}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>{agent.bindings} binding{agent.bindings !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
