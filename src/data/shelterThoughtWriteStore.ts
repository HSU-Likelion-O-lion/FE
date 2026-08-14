const STORAGE_KEY = "sseudam-shelter-thought-writes";

/** 단기간 사유 작성 제한 (mock) — 추후 API로 교체 */
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1시간

function loadTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is number => typeof t === "number");
  } catch {
    return [];
  }
}

function saveTimestamps(times: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
}

function recentWrites(now = Date.now()) {
  return loadTimestamps().filter((t) => now - t < WINDOW_MS);
}

/** 단기간에 너무 많은 사유를 남겼는지 */
export function isThoughtWriteRateLimited() {
  return recentWrites().length >= LIMIT;
}

/** 사유 작성 성공 시 호출 */
export function recordThoughtWrite() {
  const now = Date.now();
  const next = [...recentWrites(now), now];
  saveTimestamps(next);
}
