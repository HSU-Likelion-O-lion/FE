import type { BookStatus } from "../components/mate/types";
import type { BookItem, BookStatusApi } from "./types";

export function mapApiStatusToUi(status: BookStatusApi | string): BookStatus {
  switch (status) {
    case "READING":
      return "reading";
    case "DONE":
      return "finished";
    case "BEFORE_READING":
    default:
      return "unread";
  }
}

export function mapUiStatusToApi(status: BookStatus): BookStatusApi {
  switch (status) {
    case "reading":
      return "READING";
    case "finished":
      return "DONE";
    case "unread":
    default:
      return "BEFORE_READING";
  }
}

export function mapBookItemToLibraryBook(item: BookItem) {
  return {
    id: String(item.userBookId),
    bookId: item.book.bookId,
    userBookId: item.userBookId,
    title: item.book.title,
    author: item.book.author,
    genre: "",
    publisher: item.book.publisher?.trim() ?? "",
    coverUrl: item.book.coverImageUrl ?? "",
    status: mapApiStatusToUi(item.status),
  };
}

export function formatReflectionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function sumFocusedMinutes(
  stats: {
    byWeekday?: { focusedMinutes: number }[];
    byHour?: { focusedMinutes: number }[];
  } | null,
): number {
  if (!stats) return 0;
  const fromWeek =
    stats.byWeekday?.reduce((acc, w) => acc + (w.focusedMinutes || 0), 0) ?? 0;
  if (fromWeek > 0) return fromWeek;
  return stats.byHour?.reduce((acc, h) => acc + (h.focusedMinutes || 0), 0) ?? 0;
}

export function countStreakDays(
  week: { date: string; achieved: boolean }[],
): number {
  const sorted = [...week].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (!sorted[i].achieved) break;
    streak += 1;
  }
  return streak;
}
