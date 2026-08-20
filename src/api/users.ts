import { apiRequest } from "./client";
import { getStoredUser, setStoredUser } from "./authStorage";
import type { Plan } from "./types";

export type UserMe = {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
};

/** 서버 기본값(`/mascot.png`)·빈 값은 FE 기본 아바타로 대체 */
export function resolveProfileImageUrl(
  url: string | null | undefined,
  fallback: string,
): string {
  if (!url?.trim()) return fallback;
  const normalized = url.trim();
  if (
    normalized === "/mascot.png" ||
    normalized === "mascot.png" ||
    normalized.endsWith("/mascot.png")
  ) {
    return fallback;
  }
  return normalized;
}

export async function getMe() {
  const data = await apiRequest<UserMe>("/api/users/me");
  setStoredUser({
    userId: data.userId,
    nickname: data.nickname,
    email: data.email,
  });
  return data;
}

export async function checkEmailAvailable(email: string) {
  return apiRequest<{ available: boolean }>("/api/users/check-email", {
    auth: false,
    query: { email },
  });
}

export async function checkNicknameAvailable(nickname: string) {
  return apiRequest<{ available: boolean }>("/api/users/check-nickname", {
    auth: false,
    query: { nickname },
  });
}

export async function updateMe(nickname: string) {
  const data = await apiRequest<{
    userId: number;
    nickname: string;
    updatedAt: string;
  }>("/api/users/me", {
    method: "PATCH",
    body: { nickname },
  });
  const prev = getStoredUser();
  setStoredUser({
    userId: data.userId,
    nickname: data.nickname,
    email: prev?.email,
  });
  return data;
}

export async function updatePlan(plan: Plan) {
  return apiRequest<{ userId: number; plan: Plan }>("/api/users/me/plan", {
    method: "PATCH",
    body: { plan },
  });
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<{ profileImageUrl: string }>("/api/users/me/profile-image", {
    method: "POST",
    formData,
  });
}

export async function deleteMe() {
  return apiRequest<null>("/api/users/me", { method: "DELETE" });
}
