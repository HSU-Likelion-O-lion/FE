import { apiRequest } from "./client";

export type CapsuleItem = {
  openedDate: string;
  quoteText: string;
  bookTitle: string;
};

export async function getTodayCapsule() {
  return apiRequest<{
    opened: boolean;
    quoteText: string | null;
    bookTitle: string | null;
  }>("/api/inspiration-capsule/today");
}

export async function openTodayCapsule() {
  return apiRequest<{ quoteText: string; bookTitle: string }>(
    "/api/inspiration-capsule/today/open",
    { method: "POST" },
  );
}

export async function getCapsuleHistory() {
  return apiRequest<{ capsules: CapsuleItem[] }>(
    "/api/inspiration-capsule/history",
  );
}
