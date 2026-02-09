import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Vercel 서버리스 프록시: /api/v1/* → API_BASE_URL/api/v1/*
 * - vercel.json rewrite로 /api/v1/:path* 요청이 이 핸들러로 전달됨
 * - API_BASE_URL은 Vercel 대시보드 환경 변수로만 설정 (서버 전용, 브라우저 노출 없음)
 * - 클라이언트는 상대 경로 /api/v1/... 로만 요청
 */

const FORWARD_HEADERS = [
  "content-type",
  "x-user-id",
  "authorization",
] as const;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl || typeof baseUrl !== "string") {
    res.status(500).json({
      code: "CONFIG_ERROR",
      message: "API_BASE_URL이 서버에 설정되지 않았습니다.",
    });
    return;
  }

  // rewrite 시 path 세그먼트가 쿼리로 전달됨 (예: /api/v1/admin/budget → path=admin/budget)
  const pathSeg = req.query.path;
  const pathSuffix =
    typeof pathSeg === "string" && pathSeg
      ? `/${pathSeg}`
      : Array.isArray(pathSeg) && pathSeg.length > 0
        ? `/${pathSeg.join("/")}`
        : "";
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1${pathSuffix}`;
  const query =
    req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const targetUrl = query ? `${url}${query}` : url;

  const headers: Record<string, string> = {};
  FORWARD_HEADERS.forEach((name) => {
    const value = req.headers[name];
    if (value && typeof value === "string") headers[name] = value;
  });

  try {
    const fetchOptions: RequestInit = {
      method: req.method ?? "GET",
      headers: { ...headers },
    };
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const backendRes = await fetch(targetUrl, fetchOptions);
    const contentType = backendRes.headers.get("content-type");
    const data = await backendRes.text();
    res.status(backendRes.status);

    if (contentType?.includes("application/json")) {
      try {
        res.json(JSON.parse(data));
      } catch {
        res.send(data);
      }
    } else {
      res.setHeader("Content-Type", contentType ?? "text/plain");
      res.send(data);
    }
  } catch (err) {
    console.error("[api proxy error]", err);
    res.status(502).json({
      code: "PROXY_ERROR",
      message: "백엔드 요청 중 오류가 발생했습니다.",
    });
  }
}
