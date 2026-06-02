import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

const downloadsDir = path.join(process.cwd(), "public", "downloads");

function isAuthorized(request: NextRequest) {
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return true;
  const token = request.nextUrl.searchParams.get("token");
  const cookie = request.cookies.get("navi_auth")?.value;
  return token === secret || cookie === secret;
}

async function serveFile(request: NextRequest, params: { file: string }, includeBody: boolean) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const file = path.basename(params.file);
  if (file !== params.file || !file.endsWith(".mp4")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(downloadsDir, file);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(downloadsDir) + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(resolved);
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Content-Length": String(info.size),
      "Content-Disposition": `inline; filename="${file}"`,
      "Cache-Control": "private, max-age=3600",
      "Accept-Ranges": "bytes",
    });

    if (!includeBody) {
      return new NextResponse(null, { status: 200, headers });
    }

    const stream = createReadStream(resolved);
    return new NextResponse(Readable.toWeb(stream) as BodyInit, { status: 200, headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { file: string } }) {
  return serveFile(request, params, true);
}

export async function HEAD(request: NextRequest, { params }: { params: { file: string } }) {
  return serveFile(request, params, false);
}
