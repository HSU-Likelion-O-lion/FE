import { apiRequest } from "./client";
import type { ReflectionItem, ShareJobStatus } from "./types";

export type ReflectionShareTheme = {
  themeId: number;
  name: string;
  swatch: string;
  previewUrl: string;
};

export async function getReflections() {
  return apiRequest<{
    coverProgress: number;
    reflections: ReflectionItem[];
  }>("/api/reflections");
}

export async function createReflection(sessionId: number, content: string) {
  return apiRequest<{ reflectionId: number; coverProgress: number }>(
    "/api/reflections",
    { method: "POST", body: { sessionId, content } },
  );
}

export async function updateReflection(reflectionId: number, content: string) {
  return apiRequest<{ reflectionId: number }>(
    `/api/reflections/${reflectionId}`,
    { method: "PATCH", body: { content } },
  );
}

export async function deleteReflection(reflectionId: number) {
  return apiRequest<{ coverProgress: number }>(
    `/api/reflections/${reflectionId}`,
    { method: "DELETE" },
  );
}

export async function getPublishableReflections() {
  return apiRequest<{
    canPublish: boolean;
    needed: number | null;
    reflections: ReflectionItem[] | null;
  }>("/api/reflections/publishable");
}

/** 사유록 공유 테마 목록 */
export async function getReflectionShareThemes() {
  return apiRequest<{ themes: ReflectionShareTheme[] }>(
    "/api/reflection-shares/themes",
  );
}

/** 사유록 공유 이미지 생성 시작 */
export async function createReflectionShare(
  reflectionId: number,
  themeId: number,
) {
  return apiRequest<{ shareId: number; status: ShareJobStatus }>(
    `/api/reflections/${reflectionId}/shares`,
    { method: "POST", body: { themeId } },
  );
}

/** 사유록 공유 이미지 생성 상태 조회 (폴링) */
export async function getReflectionShareStatus(shareId: number) {
  return apiRequest<{ status: ShareJobStatus; imageUrl?: string | null }>(
    `/api/reflection-shares/${shareId}`,
  );
}

/**
 * reflectionId가 없으면 본문(·책 제목)으로 내 사유록에서 찾아 복구.
 * 쉼터 postId만 있는 진입에서 공유 API용 id를 맞출 때 사용.
 */
export async function resolveReflectionId(opts: {
  reflectionId?: number | null;
  content?: string | null;
  bookTitle?: string | null;
}): Promise<number | null> {
  if (opts.reflectionId != null && opts.reflectionId > 0) {
    return opts.reflectionId;
  }
  const content = opts.content?.trim();
  if (!content) return null;

  try {
    const { reflections } = await getReflections();
    const byContent = reflections.filter((r) => r.content.trim() === content);
    if (byContent.length === 0) return null;
    if (opts.bookTitle) {
      const byBook = byContent.find((r) => r.bookTitle === opts.bookTitle);
      if (byBook) return byBook.reflectionId;
    }
    return byContent[0]?.reflectionId ?? null;
  } catch {
    return null;
  }
}
