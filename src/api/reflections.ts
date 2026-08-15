import { apiRequest } from "./client";
import type { ReflectionItem } from "./types";

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
