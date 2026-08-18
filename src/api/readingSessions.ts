import { apiRequest } from "./client";
import type { InterruptionReason, TargetMinutes } from "./types";

export type ReadingSessionStart = {
  sessionId: number;
  status: string;
  startedAt: string;
};

export type ActiveSession = {
  sessionId: number;
  status: string;
  remainingSeconds: number;
};

export async function startReadingSession(
  userBookId: number,
  targetMinutes: TargetMinutes,
) {
  return apiRequest<ReadingSessionStart>("/api/reading-sessions", {
    method: "POST",
    body: { userBookId, targetMinutes },
  });
}

export async function getActiveReadingSession() {
  return apiRequest<{ session: ActiveSession | null }>(
    "/api/reading-sessions/active",
  );
}

export async function completeReadingSession(sessionId: number) {
  return apiRequest<{ status: string; aiQuestion: string }>(
    `/api/reading-sessions/${sessionId}/complete`,
    { method: "PATCH" },
  );
}

/** 테스트 계정 전용 — 목표 시간과 무관하게 세션 즉시 완료 */
export async function skipReadingSession(sessionId: number) {
  return apiRequest<{ status: string; aiQuestion: string }>(
    `/api/reading-sessions/${sessionId}/skip`,
    { method: "PATCH" },
  );
}

export async function abandonReadingSession(sessionId: number) {
  return apiRequest<{ status: string }>(
    `/api/reading-sessions/${sessionId}/abandon`,
    { method: "PATCH" },
  );
}

export async function resumeReadingSession(sessionId: number) {
  return apiRequest<{ status: string; remainingSeconds: number }>(
    `/api/reading-sessions/${sessionId}/resume`,
    { method: "PATCH" },
  );
}

export async function heartbeatReadingSession(
  sessionId: number,
  elapsedSeconds: number,
) {
  return apiRequest<{ remainingSeconds: number; valid: boolean }>(
    `/api/reading-sessions/${sessionId}/heartbeat`,
    { method: "POST", body: { elapsedSeconds } },
  );
}

export async function recordInterruption(
  sessionId: number,
  payload: {
    reason: InterruptionReason;
    customText?: string;
    occurredAt: string;
  },
) {
  return apiRequest<{ interruptionId: number }>(
    `/api/reading-sessions/${sessionId}/interruptions`,
    { method: "POST", body: payload },
  );
}

export async function deleteRecoverySession(sessionId: number) {
  return apiRequest<null>(`/api/reading-sessions/${sessionId}/recovery`, {
    method: "DELETE",
  });
}
