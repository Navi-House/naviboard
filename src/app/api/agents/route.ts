export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { run } from "@/lib/exec";

export async function GET() {
  try {
    const agentsOut = run('openclaw agents list --json 2>/dev/null || echo "[]"');
    const agents = JSON.parse(agentsOut);

    const sessionsOut = run('openclaw sessions --json 2>/dev/null || echo "{}"');
    const sessionsData = JSON.parse(sessionsOut);
    const sessions = sessionsData.sessions || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = agents.map((a: any) => {
      // Find sessions belonging to this agent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const agentSessions = sessions.filter((s: any) => s.agentId === a.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mainSession = agentSessions.find((s: any) => s.key === `agent:${a.id}:main`);
      const totalTokens = agentSessions.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, s: any) => sum + (s.totalTokens || 0), 0
      );

      return {
        id: a.id,
        name: a.identityName || a.id,
        emoji: a.identityEmoji || "🤖",
        model: a.model || "—",
        workspace: a.workspace,
        isDefault: a.isDefault || false,
        bindings: a.bindings || 0,
        routes: a.routes || [],
        sessionCount: agentSessions.length,
        totalTokens,
        contextTokens: mainSession?.contextTokens || 0,
        contextPercent: mainSession ? Math.round((mainSession.totalTokens / mainSession.contextTokens) * 100) : 0,
        lastActive: mainSession?.ageMs != null ? formatAge(mainSession.ageMs) : "—",
        status: mainSession?.ageMs != null && mainSession.ageMs < 300000 ? "active" : "idle",
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}

function formatAge(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
