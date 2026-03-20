import { readFileSync } from "fs";

export const dynamic = "force-dynamic";

const IDENTITY_PATH = "/home/ubuntu/.openclaw/workspace/IDENTITY.md";

function parseIdentity() {
  let name = "Navi";
  let emoji = "🤖";
  try {
    const content = readFileSync(IDENTITY_PATH, "utf-8");
    const nameMatch = content.match(/\*\*Name:\*\*\s*([^\n]+)/i);
    const emojiMatch = content.match(/\*\*Emoji:\*\*\s*([^\n]+)/i);
    if (nameMatch && nameMatch[1]) name = nameMatch[1].trim();
    if (emojiMatch && emojiMatch[1]) emoji = emojiMatch[1].trim();
  } catch {
    // ignore
  }
  return { name, emoji };
}

export async function GET() {
  const data = parseIdentity();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}
