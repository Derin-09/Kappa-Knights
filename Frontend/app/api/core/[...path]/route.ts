// app/api/core/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CORE_BASE } from "@/lib/config";

async function proxy(req: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  const url = `${CORE_BASE}/api/${path.join("/")}`;
  const method = req.method;

  // Build headers, forward Authorization and Content-Type
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  // Prepare body only for methods that can have one
  let body: BodyInit | undefined = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const text = await req.text();
    body = text || undefined;
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    // Avoid caching proxies by default
    cache: "no-store",
  });

  const resBody = await res.arrayBuffer();
  const nextHeaders = new Headers();
  // Pass through content-type if available
  const resCT = res.headers.get("content-type");
  if (resCT) nextHeaders.set("content-type", resCT);

  return new NextResponse(resBody, { status: res.status, headers: nextHeaders });
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context);
}
export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context);
}
export async function PUT(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context);
}
export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context);
}
