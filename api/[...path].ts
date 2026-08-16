import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * 브라우저 → 같은 출처 /api/* → 이 함수 → VITE_API_BASE_URL
 * (CORS 회피. 백엔드 URL은 Vercel 환경변수에만 둠)
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const base = process.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return res.status(500).json({
      isSuccess: false,
      code: "CONFIG_ERROR",
      httpStatus: 500,
      message: "VITE_API_BASE_URL이 설정되지 않았습니다.",
      data: null,
    });
  }

  const parts = req.query.path;
  const sub = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  const qIndex = req.url?.indexOf("?") ?? -1;
  const search = qIndex >= 0 ? req.url!.slice(qIndex) : "";
  const target = `${base}/api/${sub}${search}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower === "content-length" ||
      lower.startsWith("x-vercel") ||
      lower.startsWith("x-forwarded-")
    ) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method || "GET";
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = new Uint8Array(await readBody(req));
  }

  try {
    const upstream = await fetch(target, init);
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "transfer-encoding" ||
        lower === "connection" ||
        lower === "content-encoding"
      ) {
        return;
      }
      res.setHeader(key, value);
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.send(buf);
  } catch {
    return res.status(502).json({
      isSuccess: false,
      code: "BAD_GATEWAY",
      httpStatus: 502,
      message: "백엔드 요청에 실패했습니다.",
      data: null,
    });
  }
}
