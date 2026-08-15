import { apiRequest, API_BASE_URL } from "./client";
import { getAccessToken } from "./authStorage";
import type { EssayChapter, JobStatus } from "./types";

/** Swagger EssayListResponse가 Item을 재사용 — 런타임 필드에 대응 */
export type EssayListItem = {
  essayId?: number;
  reflectionId?: number;
  content?: string;
  title?: string;
  createdAt: string;
};

export async function getEssays() {
  return apiRequest<{ essays: EssayListItem[] }>("/api/essays");
}

export async function createEssay(reflectionIds: number[]) {
  return apiRequest<{ essayId: number; jobStatus: JobStatus }>("/api/essays", {
    method: "POST",
    body: { reflectionIds },
  });
}

export async function getEssay(essayId: number) {
  return apiRequest<{
    essayId: number;
    title: string | null;
    authorName: string;
    status: JobStatus;
    publishedAt: string | null;
    createdAt: string;
    chapters: EssayChapter[];
  }>(`/api/essays/${essayId}`);
}

export async function getEssayDraft(essayId: number) {
  return apiRequest<{ chapters: EssayChapter[] }>(
    `/api/essays/${essayId}/draft`,
  );
}

export async function getEssayJobStatus(essayId: number) {
  return apiRequest<{ status: JobStatus }>(
    `/api/essays/${essayId}/job-status`,
  );
}

export async function publishEssay(essayId: number, title: string) {
  return apiRequest<{
    essayId: number;
    title: string;
    publishedAt: string;
  }>(`/api/essays/${essayId}/publish`, {
    method: "POST",
    body: { title },
  });
}

export async function cancelEssay(essayId: number) {
  return apiRequest<null>(`/api/essays/${essayId}/cancel`, { method: "POST" });
}

export async function retryEssay(essayId: number) {
  return apiRequest<{ essayId: number; jobStatus: JobStatus }>(
    `/api/essays/${essayId}/retry`,
    { method: "POST" },
  );
}

/** PDF blob 다운로드 (공통 envelope이 아닐 수 있음) */
export async function downloadEssayPdf(essayId: number): Promise<Blob> {
  const token = getAccessToken();
  const url = `${API_BASE_URL}/api/essays/${essayId}/download`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("에세이 PDF 다운로드에 실패했습니다.");
  }
  return res.blob();
}
