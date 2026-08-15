import { apiRequest } from "./client";
import type { Day, Pin } from "./types";

export async function getMateDashboard() {
  return apiRequest<{
    week: Day[];
    pins: Pin[];
    badgeCount: number;
  }>("/api/mate/dashboard");
}

export async function getMatePins() {
  return apiRequest<{ pins: Pin[] }>("/api/mate/pins");
}

export async function pinMateBook(userBookId: number) {
  return apiRequest<{ pinnedOrder: number }>("/api/mate/pins", {
    method: "POST",
    body: { userBookId },
  });
}

export async function unpinMateBook(userBookId: number) {
  return apiRequest<null>(`/api/mate/pins/${userBookId}`, {
    method: "DELETE",
  });
}
