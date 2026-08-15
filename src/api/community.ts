import { apiRequest } from "./client";
import type {
  CommunityPost,
  CommunityRoom,
  ReflectionItem,
  ShareJobStatus,
} from "./types";

export async function getCommunityAccess() {
  return apiRequest<{ canEnter: boolean }>("/api/community/access");
}

export async function getCommunityRooms() {
  return apiRequest<{ rooms: CommunityRoom[] }>("/api/community/rooms");
}

export async function getRoomPosts(roomId: number) {
  return apiRequest<{ posts: CommunityPost[] }>(
    `/api/community/rooms/${roomId}/posts`,
  );
}

export async function getRoomPostPreviews(roomId: number) {
  return apiRequest<{
    previews: { postId: number; firstLine: string }[];
  }>(`/api/community/rooms/${roomId}/posts/preview`);
}

export async function createCommunityPost(payload: {
  roomId: number;
  content: string;
  reflectionId?: number;
}) {
  return apiRequest<{ postId: number; anonymousNickname: string }>(
    "/api/community/posts",
    { method: "POST", body: payload },
  );
}

export async function updateCommunityPost(postId: number, content: string) {
  return apiRequest<{ postId: number }>(`/api/community/posts/${postId}`, {
    method: "PATCH",
    body: { content },
  });
}

export async function deleteCommunityPost(postId: number) {
  return apiRequest<null>(`/api/community/posts/${postId}`, {
    method: "DELETE",
  });
}

export async function heartPost(postId: number) {
  return apiRequest<{ isHearted: boolean }>(
    `/api/community/posts/${postId}/hearts`,
    { method: "POST" },
  );
}

export async function unheartPost(postId: number) {
  return apiRequest<{ isHearted: boolean }>(
    `/api/community/posts/${postId}/hearts`,
    { method: "DELETE" },
  );
}

export async function reportPost(postId: number, reason?: string) {
  return apiRequest<{
    reportId: number;
    status: "NORMAL" | "PENDING_REVIEW" | "BLINDED";
  }>(`/api/community/posts/${postId}/reports`, {
    method: "POST",
    body: { reason },
  });
}

export async function getShareThemes() {
  return apiRequest<{
    themes: { themeId: number; name: string; previewUrl: string }[];
  }>("/api/community/share-themes");
}

export async function createShareImage(postId: number, themeId: number) {
  return apiRequest<{ shareId: number; status: ShareJobStatus }>(
    `/api/community/posts/${postId}/share`,
    { method: "POST", body: { themeId } },
  );
}

export async function getShareStatus(shareId: number) {
  return apiRequest<{ status: ShareJobStatus; imageUrl?: string }>(
    `/api/community/shares/${shareId}`,
  );
}

export type { ReflectionItem };
