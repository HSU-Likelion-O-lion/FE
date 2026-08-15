/** 로컬 기준 YYYY-MM-DD */
export function formatLocalDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** API week.achieved 날짜 목록으로 변환 */
export function achievedDatesFromWeek(
  week: { date: string; achieved: boolean }[],
): string[] {
  return week.filter((d) => d.achieved).map((d) => d.date);
}

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
  dates: string[] = [],
  endDate: Date = new Date(),
): boolean {
  return getConsecutiveReadingDays(dates, endDate) >= 7;
}
