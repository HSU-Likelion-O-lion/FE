import type { ApiResponse } from "./types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./authStorage";

/** 개발: Vite proxy(`/api`) / 프로덕션: VITE_API_BASE_URL */
const BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
      /\/$/,
      "",
    ) || "";

export class ApiError extends Error {
  code: string;
  httpStatus: number;

  constructor(message: string, code: string, httpStatus: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  /** FormData면 Content-Type 자동 설정하지 않음 */
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** 401 시 refresh 재시도 여부 (기본 true) */
  retryOnUnauthorized?: boolean;
};

function buildUrl(
  path: string,
  query?: RequestOptions["query"],
): string {
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = (await res.json()) as ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (!res.ok || !json.isSuccess || !json.data) {
        clearTokens();
        return false;
      }
      setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    formData,
    query,
    retryOnUnauthorized = true,
  } = options;

  const headers: Record<string, string> = {};
  if (!formData) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: formData
      ? formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (res.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/pdf") ||
    contentType.includes("octet-stream")
  ) {
    if (!res.ok) {
      throw new ApiError("다운로드에 실패했습니다.", "DOWNLOAD_FAILED", res.status);
    }
    return (await res.blob()) as T;
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      "서버 응답을 해석할 수 없습니다.",
      "PARSE_ERROR",
      res.status,
    );
  }

  if (!res.ok || !json.isSuccess) {
    throw new ApiError(
      json.message || "요청에 실패했습니다.",
      json.code || "ERROR",
      json.httpStatus || res.status,
    );
  }

  return json.data;
}

export { BASE_URL as API_BASE_URL };
