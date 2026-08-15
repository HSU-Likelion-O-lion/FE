/** 서재 책 읽기 상태 */
export type BookStatus = "unread" | "reading" | "finished";

/** 서재 책 데이터 */
export type LibraryBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  coverUrl: string;
  status: BookStatus;
  bookId?: number;
  userBookId?: number;
};

/** 메이트에 꺼내둔 책 */
export type MateBookItem = {
  id: string;
  title: string;
  coverUrl: string;
  /** 마지막 읽은 날 (일 단위, 0이면 오늘) */
  lastReadDaysAgo: number;
};

/** API 연동 전/후 — 빈 배열이면 초기(빈) 상태, 2권 이상이면 화살표 표시 */
export type MateBooks = MateBookItem[];

export const MATE_BOOK_LIMIT = 5;
