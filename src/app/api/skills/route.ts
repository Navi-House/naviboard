export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { run } from "@/lib/exec";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

interface Skill {
  name: string;
  emoji: string;
  description: string;
  source: string;
  status: "ready" | "missing";
  missing?: { bins?: string[]; anyBins?: string[]; env?: string[]; config?: string[]; os?: string[] };
  homepage?: string;
}

function parseSkillMd(skillDir: string): { name: string; description: string; emoji: string } | null {
  const skillMd = join(skillDir, "SKILL.md");
  if (!existsSync(skillMd)) return null;

  try {
    const content = readFileSync(skillMd, "utf-8");
    let name = "";
    let description = "";
    let emoji = "📦";

    // Parse YAML frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const nameMatch = fm.match(/^name:\s*(.+)$/m);
      const descMatch = fm.match(/^description:\s*(.+)$/m);
      const emojiMatch = fm.match(/^emoji:\s*(.+)$/m);
      if (nameMatch) name = nameMatch[1].trim();
      if (descMatch) description = descMatch[1].trim();
      if (emojiMatch) emoji = emojiMatch[1].trim();
    }

    // Fallback: use directory name
    if (!name) {
      name = skillDir.split("/").pop() || "";
    }

    // Fallback description: first non-empty, non-heading line after frontmatter
    if (!description) {
      const lines = content.replace(/^---[\s\S]*?---\n?/, "").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
          description = trimmed;
          break;
        }
      }
    }

    return { name, description, emoji };
  } catch {
    return null;
  }
}

function scanSkillDirs(): Skill[] {
  const skills: Skill[] = [];
  const home = process.env.HOME || "/home/ubuntu";
  
  // Scan workspace skills
  const workspaceSkills = join(home, ".openclaw/workspace/skills");
  if (existsSync(workspaceSkills)) {
    try {
      for (const entry of readdirSync(workspaceSkills, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const parsed = parseSkillMd(join(workspaceSkills, entry.name));
        if (parsed) {
          skills.push({
            ...parsed,
            source: "workspace",
            status: "ready",
          });
        }
      }
    } catch { /* ignore */ }
  }

  // Scan bundled OpenClaw skills
  const bundledPaths = [
    join(home, ".npm-global/lib/node_modules/openclaw/skills"),
    "/usr/lib/node_modules/openclaw/skills",
    "/usr/local/lib/node_modules/openclaw/skills",
  ];
  for (const bundledDir of bundledPaths) {
    if (!existsSync(bundledDir)) continue;
    try {
      for (const entry of readdirSync(bundledDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        // Skip if already found in workspace
        if (skills.some(s => s.name === entry.name)) continue;
        const parsed = parseSkillMd(join(bundledDir, entry.name));
        if (parsed) {
          skills.push({
            ...parsed,
            source: "bundled",
            status: "ready",
          });
        }
      }
    } catch { /* ignore */ }
  }

  return skills;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("search");
  if (query) {
    const out = run(`npx clawhub search "${query}" 2>/dev/null || echo ""`);
    return NextResponse.json({ results: out });
  }

  // First try openclaw CLI (faster, more complete)
  const out = run("openclaw skills list --json 2>/dev/null");
  try {
    const data = JSON.parse(out);
    if (data.skills && data.skills.length > 0) {
      const skills: Skill[] = (data.skills || []).map(
        (s: Record<string, unknown>) => {
          const missingData = s.missing as Record<string, string[]> | undefined;
          const hasMissing =
            missingData &&
            Object.values(missingData).some(
              (v) => Array.isArray(v) && v.length > 0
            );
          return {
            name: s.name || "",
            emoji: s.emoji || "📦",
            description: s.description || "",
            source: s.source || "unknown",
            status: hasMissing ? "missing" : "ready",
            missing: hasMissing ? missingData : undefined,
            homepage: s.homepage || undefined,
          };
        }
      );
      return NextResponse.json({ skills });
    }
  } catch {
    // CLI failed — fall through to filesystem scan
  }

  // Fallback: scan filesystem directly
  const skills = scanSkillDirs();
  return NextResponse.json({ skills });
}

export async function POST(req: NextRequest) {
  const { action, name } = await req.json();
  let result = "";
  switch (action) {
    case "install":
      result = run(`npx clawhub install ${name} 2>&1`);
      break;
    case "uninstall":
      result = run(`npx clawhub uninstall ${name} 2>&1`);
      break;
    default:
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
  }
  return NextResponse.json({ ok: true, output: result });
}
