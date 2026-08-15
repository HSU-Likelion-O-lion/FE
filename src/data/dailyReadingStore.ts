/**
 * 오늘 메이트(집중 독서) 완료 여부.
 * - 하루 1회만 완료하면 그날 쉼터 입장 가능
 * - 로컬 캐시 + `getCommunityAccess().canEnter` 병행
 */
import { getCommunityAccess } from "../api";

const MATE_DAILY_KEY = "sseudam-mate-daily-complete";
/** @deprecated 이전 키 — 마이그레이션용 */
const LEGACY_READING_KEY = "sseudam-daily-reading-complete";

export type MateDailyComplete = {
  /** 로컬 날짜 YYYY-MM-DD */
  date: string;
  /** 완료한 집중 분 (선택 메타) */
  minutes?: number;
};

function todayKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parsePayload(raw: string): MateDailyComplete | null {
  try {
    const data = JSON.parse(raw) as MateDailyComplete;
    if (typeof data.date !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

/** 메이트 집중 타이머 완료 시 호출 — 오늘 날짜로 저장 */
export function markMateCompletedToday(minutes?: number) {
  const payload: MateDailyComplete = {
    date: todayKey(),
    ...(typeof minutes === "number" ? { minutes } : {}),
  };
  localStorage.setItem(MATE_DAILY_KEY, JSON.stringify(payload));
  localStorage.removeItem(LEGACY_READING_KEY);
}

export function loadMateDailyComplete(): MateDailyComplete | null {
  const raw =
    localStorage.getItem(MATE_DAILY_KEY) ??
    localStorage.getItem(LEGACY_READING_KEY);
  if (!raw) return null;
  return parsePayload(raw);
}

/** 오늘 메이트를 한 번이라도 완료했는지 (쉼터 입장 조건, 로컬) */
export function hasCompletedMateToday(): boolean {
  const data = loadMateDailyComplete();
  return data != null && data.date === todayKey();
}

/**
 * 쉼터 입장 가능 여부 — API `canEnter` 우선, 실패 시 로컬 완료 여부.
 */
export async function checkCanEnterCommunity(): Promise<boolean> {
  try {
    const { canEnter } = await getCommunityAccess();
    if (canEnter) {
      if (!hasCompletedMateToday()) {
        markMateCompletedToday();
      }
      return true;
    }
    return false;
  } catch {
    return hasCompletedMateToday();
  }
}

export function clearMateDailyComplete() {
  localStorage.removeItem(MATE_DAILY_KEY);
  localStorage.removeItem(LEGACY_READING_KEY);
}

/* —— 하위 호환 별칭 (기존 import 유지) —— */
export type DailyReadingComplete = MateDailyComplete;
export const markDailyReadingComplete = markMateCompletedToday;
export const loadDailyReadingComplete = loadMateDailyComplete;
export const hasDailyReadingComplete = hasCompletedMateToday;
export const clearDailyReadingComplete = clearMateDailyComplete;
