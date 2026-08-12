import type { BookStatus, LibraryBook } from "../components/mate/types";
import cover1 from "../assets/library/cover-1.png";
import cover2 from "../assets/library/cover-2.png";
import cover3 from "../assets/library/cover-3.png";
import bookCover1 from "../assets/mate/book-cover-1.jpg";
import bookCover2 from "../assets/mate/book-cover-2.png";
import bookCover3 from "../assets/mate/book-cover-3.png";
import bookCover from "../assets/mate/book-cover.png";

export type LibraryShelfBook = LibraryBook & {
  finishedAt?: string;
  wished?: boolean;
};

export type LibraryReason = {
  id: string;
  bookTitle: string;
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

/** 나의 사유록 — 빈 배열이면 empty UI. 홈 미리보기는 앞 2건만 사용 */
export const MOCK_LIBRARY_REASONS: LibraryReason[] = [
  {
    id: "reason-1",
    bookTitle: "채식주의자",
    dateLabel: "26.07.22",
    excerpt:
      "앞으로 타인의 기준에 맞춰 자신을 잃지 말고, 마음이 보내는 신호를 외면하지 말아야겠다.",
  },
  {
    id: "reason-2",
    bookTitle: "급류",
    dateLabel: "26.07.17",
    excerpt:
      "내 삶이 흔들릴 때일수록, 나를 잃지 않는 것이 가장 큰 용기라고 생각했습니다.",
  },
  {
    id: "reason-3",
    bookTitle: "작별하지 않는다",
    dateLabel: "26.07.16",
    excerpt:
      "있잖아요, 누군가를 잊지 않으려는 마음은, 오늘을 살아갈 힘이 되기도 하는것같아요.",
  },
  {
    id: "reason-4",
    bookTitle: "행복할거야. 이래도 되...",
    dateLabel: "26.07.13",
    excerpt:
      "가끔은 조금 느리게 가도 괜찮아요. 당신의 속도에도 언젠가 결실을 맞이,,하겠죠 화이팅.",
  },
  {
    id: "reason-5",
    bookTitle: "우리는 우리를 잊지 못하고",
    dateLabel: "26.07.12",
    excerpt:
      "지 못하는 마음도 괜찮습니다. 언젠가는 아픔보다 따뜻한 추억으로 남게 됩니다.",
  },
  {
    id: "reason-6",
    bookTitle: "보라색 히비스커스",
    dateLabel: "26.07.11",
    excerpt:
      "당신의 목소리를 숨기지 마세요. 세상은 있는 그대로의 당신도 충분히 소중합니다.",
  },
  {
    id: "reason-7",
    bookTitle: "불안을 이기는 철학",
    dateLabel: "26.07.10",
    excerpt: "결국 모든 것은 지나간다는 평범한 진리 새삼 다르게 다가온다.",
  },
  {
    id: "reason-8",
    bookTitle: "마음의 직원",
    dateLabel: "26.07.09",
    excerpt: "흔들려도 괜찮아요. 다시 자리를 찾아가는 과정이 곧 성장입니다.",
  },
  {
    id: "reason-9",
    bookTitle: "고요할수록 밝아지는 것들",
    dateLabel: "26.07.08",
    excerpt: "조용한 시간에 마주한 마음이 더 선명하게 말을 걸어옵니다.",
  },
  {
    id: "reason-10",
    bookTitle: "일억 번째 여름",
    dateLabel: "26.07.07",
    excerpt: "여름의 빛처럼, 잠깐이어도 따뜻했던 순간을 기억하기로 했습니다.",
  },
  {
    id: "reason-11",
    bookTitle: "치치새가 사는 숲",
    dateLabel: "26.07.06",
    excerpt: "숲속처럼 천천히, 내 호흡에 맞춰 하루를 걸어가 봅니다.",
  },
  {
    id: "reason-12",
    bookTitle: "함께여서 다행이야",
    dateLabel: "26.07.05",
    excerpt: "혼자가 아니라는 감각이 오늘의 용기를 조금 더 키워줍니다.",
  },
  {
    id: "reason-13",
    bookTitle: "몰입의 기술",
    dateLabel: "26.07.04",
    excerpt: "한 페이지에 집중하는 시간이 나를 다시 모아주는 것 같아요.",
  },
  {
    id: "reason-14",
    bookTitle: "여름을 한 입 베어 물었더니",
    dateLabel: "26.07.03",
    excerpt: "작은 기쁨을 씹어 삼키듯, 오늘의 감정을 온전히 느껴봅니다.",
  },
  {
    id: "reason-15",
    bookTitle: "불안을 이기는 철학",
    dateLabel: "26.07.02",
    excerpt: "불안을 없애기보다, 옆에 두고 함께 걷는 법을 배우고 있습니다.",
  },
  {
    id: "reason-16",
    bookTitle: "채식주의자",
    dateLabel: "26.07.22",
    excerpt:
      "앞으로 타인의 기준에 맞춰 자신을 잃지 말고, 마음이 보내는 신호를 외면하지 말아야겠다.",
  },
  {
    id: "reason-17",
    bookTitle: "급류",
    dateLabel: "26.07.17",
    excerpt:
      "내 삶이 흔들릴 때일수록, 나를 잃지 않는 것이 가장 큰 용기라고 생각했습니다.",
  },
  {
    id: "reason-18",
    bookTitle: "작별하지 않는다",
    dateLabel: "26.07.16",
    excerpt:
      "있잖아요, 누군가를 잊지 않으려는 마음은, 오늘을 살아갈 힘이 되기도 하는것같아요.",
  },
  {
    id: "reason-19",
    bookTitle: "행복할거야. 이래도 되...",
    dateLabel: "26.07.13",
    excerpt:
      "가끔은 조금 느리게 가도 괜찮아요. 당신의 속도에도 언젠가 결실을 맞이,,하겠죠 화이팅.",
  },
  {
    id: "reason-20",
    bookTitle: "우리는 우리를 잊지 못하고",
    dateLabel: "26.07.12",
    excerpt:
      "지 못하는 마음도 괜찮습니다. 언젠가는 아픔보다 따뜻한 추억으로 남게 됩니다.",
  },
  {
    id: "reason-21",
    bookTitle: "보라색 히비스커스",
    dateLabel: "26.07.11",
    excerpt:
      "당신의 목소리를 숨기지 마세요. 세상은 있는 그대로의 당신도 충분히 소중합니다.",
  },
  {
    id: "reason-22",
    bookTitle: "불안을 이기는 철학",
    dateLabel: "26.07.10",
    excerpt: "결국 모든 것은 지나간다는 평범한 진리 새삼 다르게 다가온다.",
  },
  {
    id: "reason-23",
    bookTitle: "마음의 직원",
    dateLabel: "26.07.09",
    excerpt: "흔들려도 괜찮아요. 다시 자리를 찾아가는 과정이 곧 성장입니다.",
  },
  {
    id: "reason-24",
    bookTitle: "고요할수록 밝아지는 것들",
    dateLabel: "26.07.08",
    excerpt: "조용한 시간에 마주한 마음이 더 선명하게 말을 걸어옵니다.",
  },
  {
    id: "reason-25",
    bookTitle: "일억 번째 여름",
    dateLabel: "26.07.07",
    excerpt: "여름의 빛처럼, 잠깐이어도 따뜻했던 순간을 기억하기로 했습니다.",
  },
  {
    id: "reason-26",
    bookTitle: "치치새가 사는 숲",
    dateLabel: "26.07.06",
    excerpt: "숲속처럼 천천히, 내 호흡에 맞춰 하루를 걸어가 봅니다.",
  },
  {
    id: "reason-27",
    bookTitle: "함께여서 다행이야",
    dateLabel: "26.07.05",
    excerpt: "혼자가 아니라는 감각이 오늘의 용기를 조금 더 키워줍니다.",
  },
  {
    id: "reason-28",
    bookTitle: "몰입의 기술",
    dateLabel: "26.07.04",
    excerpt: "한 페이지에 집중하는 시간이 나를 다시 모아주는 것 같아요.",
  },
  {
    id: "reason-29",
    bookTitle: "여름을 한 입 베어 물었더니",
    dateLabel: "26.07.03",
    excerpt: "작은 기쁨을 씹어 삼키듯, 오늘의 감정을 온전히 느껴봅니다.",
  },
  {
    id: "reason-30",
    bookTitle: "불안을 이기는 철학",
    dateLabel: "26.07.02",
    excerpt: "불안을 없애기보다, 옆에 두고 함께 걷는 법을 배우고 있습니다.",
  },
];

export const MOCK_LIBRARY_STATS: LibraryStats = {
  userName: "지훈",
  finishedCount: 4,
  totalHours: 4,
  totalMinutes: 14,
  streakDays: 5,
};

export const MOCK_SHELF_BOOKS: LibraryShelfBook[] = [
  {
    id: "lib-1",
    title: "일억 번째 여름",
    author: "청예",
    genre: "장편소설",
    publisher: "창비",
    coverUrl: cover1,
    status: "finished",
    finishedAt: "2024.10.03.",
  },
  {
    id: "lib-2",
    title: "치치새가 사는 숲",
    author: "장진영",
    genre: "장편소설",
    publisher: "민음사",
    coverUrl: cover2,
    status: "finished",
    finishedAt: "2026.12.18.",
  },
  {
    id: "lib-3",
    title: "함께여서 다행이야",
    author: "모리시타 노리코",
    genre: "장편소설",
    publisher: "티라미수",
    coverUrl: cover3,
    status: "finished",
    finishedAt: "2026.12.18.",
  },
  {
    id: "lib-4",
    title: "불안을 이기는 철학",
    author: "브리지드 딜레이니",
    genre: "장편소설",
    publisher: "창비",
    coverUrl: bookCover1,
    status: "unread",
    wished: true,
  },
  {
    id: "lib-5",
    title: "여름을 한 입 베어 물었더니",
    author: "이꽃",
    genre: "장편소설",
    publisher: "문학동네",
    coverUrl: bookCover2,
    status: "reading",
  },
  {
    id: "lib-6",
    title: "몰입의 기술",
    author: "미하이 칙센트미하이",
    genre: "자기계발",
    publisher: "책읽는수요일",
    coverUrl: bookCover,
    status: "reading",
  },
  {
    id: "lib-7",
    title: "마음의 직원",
    author: "김하나",
    genre: "에세이",
    publisher: "위즈덤하우스",
    coverUrl: bookCover3,
    status: "unread",
  },
  {
    id: "lib-8",
    title: "고요할수록 밝아지는 것들",
    author: "혜민",
    genre: "에세이",
    publisher: "수오서재",
    coverUrl: bookCover2,
    status: "finished",
    finishedAt: "2025.03.12.",
  },
  {
    id: "lib-9",
    title: "작별하지 않는다",
    author: "한강",
    genre: "장편소설",
    publisher: "문학동네",
    coverUrl: bookCover1,
    status: "unread",
    wished: true,
  },
];

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
  /** 1장 미리보기 헤딩 (Figma 749:7320) */
  previewHeading: string;
  /** 1장만 미리보기 본문 */
  body: string[];
};

/** 에세이 초안 미리보기 mock (모바일 본문보기 749:7320 / 웹 718:7353) */
export const MOCK_ESSAY_DRAFT: EssayDraft = {
  title: "무너져도 괜찮은 밤",
  author: "전지훈",
  chapters: [
    { chapter: 1, title: "불안의 밤", pages: 5 },
    { chapter: 2, title: "온전한 나를 마주하며", pages: 12 },
    { chapter: 3, title: "다시 내일을 향해", pages: 24 },
  ],
  previewHeading: "제1장. 불안의 밤",
  body: [
    "밤이 되면 낮 동안 애써 외면했던 생각들이 떠오른다.\n괜찮다고 넘겼던 말과 표정, 이미 지나간 실수까지 다시 꺼내 보게 된다.",
    "‘나는 잘하고 있는 걸까.’\n‘이대로 괜찮은 걸까.’",
    "답을 찾으려고 할수록 마음은 오히려 더 복잡해진다. 우리는 불안을 없애야만 앞으로 나아갈 수 있다고 생각하지만, 어쩌면 불안은 사라져야 하는 감정이 아닐지도 모른다. 지금의 내가 무엇을 두려워하고 있는지, 무엇을 소중하게 여기고 있는지를 알려주는 마음의 신호일 수도 있다.",
    "그러니 오늘만큼은 애써 괜찮아지려고 하지 않아도 된다.\n조금 흔들려도, 잠시 멈춰 있어도 괜찮다.\n하루를 잘 버텨낸 것만으로도 충분한 밤이 있으니까.",
  ],
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
