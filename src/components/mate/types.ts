/** 개별 책 데이터 */
export type MateBookItem = {
  title: string;
  coverUrl: string;
  /** 마지막 읽은 날 (일 단위, 0이면 오늘) */
  lastReadDaysAgo: number;
};

/** API 연동 전/후 — 빈 배열이면 초기(빈) 상태, 2권 이상이면 화살표 표시 */
export type MateBooks = MateBookItem[];
