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

/** 요금제별 메이트 핀 한도 — BASIC 3 / PLUS 5 / PRO 7 */
export function matePinLimitForPlan(
  plan: "BASIC" | "PLUS" | "PRO" | null | undefined,
): number {
  switch (plan) {
    case "PLUS":
      return 5;
    case "PRO":
      return 7;
    case "BASIC":
    default:
      return 3;
  }
}
