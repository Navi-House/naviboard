"use client";
import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { Bot } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CardSkeleton } from "@/components/loading-skeleton";
import { AgentCard, type Agent } from "@/components/agent-card";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/agents");
    const data = await res.json();
    setAgents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader
        icon={Bot}
        title="Agents"
        description="Configured AI agents"
        onRefresh={load}
      />

      {loading ? (
        <CardSkeleton count={2} />
      ) : agents.length === 0 ? (
        <EmptyState emoji="🤖" title="No agents configured" />
      ) : (
        <div className="grid gap-4">
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} delay={i * 80} />
          ))}
        </div>
      )}
    </div>
  );
}
