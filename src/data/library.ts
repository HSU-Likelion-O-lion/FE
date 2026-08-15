import type { BookStatus, LibraryBook } from "../components/mate/types";

export type LibraryShelfBook = LibraryBook & {
  userBookId?: number;
  bookId?: number;
  finishedAt?: string;
  wished?: boolean;
};

export type LibraryReason = {
  id: string;
  bookTitle?: string;
  dateLabel: string;
  excerpt: string;
};

export type LibraryStats = {
  userName: string;
  finishedCount: number;
  totalHours: number;
  totalMinutes: number;
  streakDays: number;
};

export const REASON_GOAL = 30;

export type EssayChapter = {
  chapter: number;
  title: string;
  pages: number;
};

export type EssayDraft = {
  title: string;
  author: string;
  chapters: EssayChapter[];
  /** 1장 미리보기 헤딩 */
  previewHeading: string;
  /** 1장만 미리보기 본문 */
  body: string[];
};

export type ShelfFilter = "all" | BookStatus | "wished";

export const SHELF_FILTERS: { id: ShelfFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "finished", label: "다 읽은 책" },
  { id: "reading", label: "읽고 있는 책" },
  { id: "wished", label: "찜한 책" },
];

export function filterShelfBooks(
  books: LibraryShelfBook[],
  filter: ShelfFilter,
): LibraryShelfBook[] {
  if (filter === "all") return books;
  if (filter === "wished") return books.filter((b) => b.wished);
  return books.filter((b) => b.status === filter);
}

export function shelfFilterCountLabel(filter: ShelfFilter, count: number) {
  const labels: Record<ShelfFilter, string> = {
    all: "전체",
    finished: "다 읽은 책",
    reading: "읽고 있는 책",
    wished: "찜한 책",
    unread: "읽지 않은 책",
  };
  return { label: labels[filter], count };
}
