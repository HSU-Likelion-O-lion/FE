/**
 * 오늘 메이트(집중 독서) 완료 여부.
 * - 하루 1회만 완료하면 그날 쉼터 입장 가능
 * - 현재: localStorage
 * - 이후: 백엔드 API 응답으로 교체 (같은 함수 시그니처 유지)
 */
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

/** 오늘 메이트를 한 번이라도 완료했는지 (쉼터 입장 조건) */
export function hasCompletedMateToday(): boolean {
  const data = loadMateDailyComplete();
  return data != null && data.date === todayKey();
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
