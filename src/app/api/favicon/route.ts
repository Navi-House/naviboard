import { readFileSync } from "fs";

const IDENTITY_PATH = "/home/ubuntu/.openclaw/workspace/IDENTITY.md";

function getEmojiFromIdentity(): string {
  try {
    const content = readFileSync(IDENTITY_PATH, "utf-8");
    const match = content.match(/\*\*Emoji:\*\*\s*([^\n]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {
    // ignore
  }
  return "🤖";
}

export async function GET() {
  const emoji = getEmojiFromIdentity();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="52">${emoji}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}
