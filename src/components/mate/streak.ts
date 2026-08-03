/** 로컬 기준 YYYY-MM-DD */
export function formatLocalDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildConsecutiveDaysEndingToday(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = count - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    dates.push(formatLocalDate(day));
  }
  return dates;
}

/**
 * 목데이터 — 오늘 포함 연속 7일 독서 기록.
 * 연속이 끊긴 케이스를 보려면 날짜를 빼면 됨.
 */
export const MOCK_READING_DATES: string[] = buildConsecutiveDaysEndingToday(7);

/** endDate부터 하루씩 거슬러 올라가며 연속 독서 일수 */
export function getConsecutiveReadingDays(
  dates: string[],
  endDate: Date = new Date(),
): number {
  const set = new Set(dates);
  let count = 0;
  const cursor = new Date(endDate);
  cursor.setHours(0, 0, 0, 0);

  while (set.has(formatLocalDate(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

export function hasSevenDayStreak(
  dates: string[] = MOCK_READING_DATES,
  endDate: Date = new Date(),
): boolean {
  return getConsecutiveReadingDays(dates, endDate) >= 7;
}
