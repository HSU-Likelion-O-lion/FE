import { apiRequest } from "./client";
import type { Day } from "./types";

export async function getStreaks() {
  return apiRequest<{ week: Day[] }>("/api/streaks");
}

export async function getBadges() {
  return apiRequest<{
    badgeCount: number;
    badges: { earnedAt: string }[];
  }>("/api/badges");
}

export async function getReadingStatistics() {
  return apiRequest<{
    continueCount: number;
    ebookSwitchCount: number;
    byWeekday: { weekday: string; focusedMinutes: number }[];
    byHour: { hour: number; focusedMinutes: number }[];
  }>("/api/reading-statistics");
}
