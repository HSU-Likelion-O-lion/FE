/** 공통 API 응답 래퍼 */
export type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  httpStatus: number;
  message: string;
  data: T;
};

export type Plan = "BASIC" | "PLUS" | "PRO";

export type BookStatusApi = "BEFORE_READING" | "READING" | "DONE";

export type JobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type ShareJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type InterruptionReason =
  | "TASTE_MISMATCH"
  | "NOTIFICATION"
  | "EBOOK_SWITCH"
  | "UNAVOIDABLE"
  | "OTHER"
  | "CONTINUE";

export type TargetMinutes = 15 | 30 | 60;

export type BookSummary = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string | null;
  publisher?: string | null;
};

export type BookItem = {
  userBookId: number;
  book: BookSummary;
  status: BookStatusApi;
};

export type Day = {
  date: string;
  achieved: boolean;
};

export type Pin = {
  userBookId: number;
  pinnedOrder: number;
};

export type ReflectionItem = {
  reflectionId: number;
  content: string;
  bookTitle: string;
  createdAt: string;
};

export type CommunityPost = {
  postId: number;
  anonymousNickname: string;
  content: string;
  isMine: boolean;
  isHearted: boolean;
  heartCount: number | null;
};

export type CommunityRoom = {
  roomId: number;
  bookId: number;
  bookTitle: string;
};

export type RecommendedBook = {
  bookId: number;
  title: string;
  coverImageUrl: string | null;
  shortDesc: string | null;
};

export type EssayChapter = {
  chapterNo: number;
  title: string;
  reflections: string[];
};
