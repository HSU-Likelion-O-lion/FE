/** 마음읽기 진단 카드 풀 + 추천 도서 목데이터 */

import cover1 from "../assets/drawer/recommend/cover-1.png";
import cover2 from "../assets/drawer/recommend/cover-2.png";
import cover3 from "../assets/drawer/recommend/cover-3.png";
import thumb1 from "../assets/drawer/home/thumb-1.png";
import thumb2 from "../assets/drawer/home/thumb-2.png";
import thumb3 from "../assets/drawer/home/thumb-3.png";

export type DiagnosisCard = {
  id: string;
  text: string;
  keywords: string[];
};

export type DiagnosisSwipe = {
  cardId: string;
  agreed: boolean;
};

export type RecommendBook = {
  id: string;
  title: string;
  author: string;
  blurb: string;
  meta: string;
  coverUrl: string;
  keywords: string[];
};

export type DiagnosisRecord = {
  id: string;
  bookTitle: string;
  quote: string;
  thumbUrl: string;
  dateLabel: string;
  keywords: string[];
};

export const DIAGNOSIS_CARDS: readonly DiagnosisCard[] = [
  {
    id: "E-01",
    text: "오늘따라 아무것도 하기 싫고 무기력하다.",
    keywords: ["휴식", "에세이", "위로", "번아웃"],
  },
  {
    id: "E-02",
    text: "스마트폰을 손에 쥐고 있지 않으면 왠지 모르게 불안하다.",
    keywords: ["디지털디톡스", "집중력", "도파민"],
  },
  {
    id: "E-03",
    text: "남들의 일상을 보며 내 현실과 비교하고 우울해진 적이 있다.",
    keywords: ["자존감", "마음챙김", "SNS피로도"],
  },
  {
    id: "E-04",
    text: "머릿속에 생각만 많고 막상 첫 시작을 내딛기가 어렵다.",
    keywords: ["동기부여", "자기계발", "실행력"],
  },
  {
    id: "E-05",
    text: "잠자리에 누워도 내일 하루가 전혀 기대되지 않는다.",
    keywords: ["우울증", "치유", "잔잔한위로"],
  },
  {
    id: "E-06",
    text: "최근 들어 사소한 일에도 쉽게 짜증이 나고 날이 서 있다.",
    keywords: ["스트레스관리", "감정조절", "명상"],
  },
  {
    id: "E-07",
    text: "인간관계가 피곤해서 지금은 그저 완벽히 혼자 있고 싶다.",
    keywords: ["고독", "개인주의", "관계정리"],
  },
  {
    id: "E-08",
    text: "어떤 일이나 글에 10분 이상 깊게 집중해 본 지 꽤 오래되었다.",
    keywords: ["몰입", "뇌과학", "주의력"],
  },
  {
    id: "E-09",
    text: "내가 지금 올바른 방향으로 잘 살고 있는 건지 확신이 안 선다.",
    keywords: ["철학", "진로", "인생조언"],
  },
  {
    id: "E-10",
    text: "누구보다 바쁘게 살고 있는데, 문득 묘한 공허함이 밀려온다.",
    keywords: ["삶의의미", "인문학", "성찰"],
  },
  {
    id: "E-11",
    text: "지금 나에게는 따뜻한 위로보다 차갑고 뼈 때리는 조언이 필요하다.",
    keywords: ["팩트폭력", "성공학", "실용서"],
  },
  {
    id: "E-12",
    text: "이유 불문하고 그저 아무 생각 없이 뇌를 끄고 푹 쉬고 싶다.",
    keywords: ["수면", "가벼운소설", "힐링"],
  },
] as const;

export const RECOMMEND_BOOKS: readonly RecommendBook[] = [
  {
    id: "book-stoner",
    title: "스토너",
    author: "존 윌리엄스",
    blurb: "평범한 하루를 성실히 살아낸 시간은 결코 헛되지 않습니다.",
    meta: "RHK ㅣ 영미문학",
    coverUrl: cover2,
    keywords: ["성찰", "인문학", "삶의의미", "위로", "치유"],
  },
  {
    id: "book-contradiction",
    title: "모순",
    author: "양귀자",
    blurb: "모순을 없애려 하기보다, 받아들이는 순간 마음은 가벼워집니다.",
    meta: "쓰다 ㅣ 한국문학",
    coverUrl: cover3,
    keywords: ["에세이", "위로", "성찰", "잔잔한위로", "힐링"],
  },
  {
    id: "book-vegetarian",
    title: "채식주의자",
    author: "한강",
    blurb: "타인의 기준에 맞춰 자신을 잃지 말고, 마음이 보내는 신호를 외면하지 마세요.",
    meta: "창비 ㅣ 한국문학",
    coverUrl: cover1,
    keywords: ["자존감", "철학", "관계정리", "고독", "성찰"],
  },
];

const HISTORY_KEY = "sseudam-drawer-history";

export const SEED_HISTORY: DiagnosisRecord[] = [
  {
    id: "rec-1",
    bookTitle: "채식주의자",
    quote: "타인의 기준에 맞춰 자신을 잃지 말고, 마음이 보내는 신호를 외면하지 마세요.",
    thumbUrl: thumb1,
    dateLabel: "26.07.22 진단",
    keywords: ["자존감", "성찰"],
  },
  {
    id: "rec-2",
    bookTitle: "급류",
    quote: "삶이 흔들릴 때일수록, 나를 잃지 않는 것이 가장 큰 용기입니다.",
    thumbUrl: thumb2,
    dateLabel: "26.07.17 진단",
    keywords: ["용기", "위로"],
  },
  {
    id: "rec-3",
    bookTitle: "작별하지 않는다",
    quote: "누군가를 잊지 않으려는 마음은, 오늘을 살아갈 힘이 되기도 합니다.",
    thumbUrl: thumb3,
    dateLabel: "26.07.16 진단",
    keywords: ["치유", "성찰"],
  },
];

export function pickRandomDiagnosisCards(count = 5): DiagnosisCard[] {
  const pool = [...DIAGNOSIS_CARDS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function accumulateKeywords(swipes: DiagnosisSwipe[]): string[] {
  const counts = new Map<string, number>();

  for (const swipe of swipes) {
    if (!swipe.agreed) continue;
    const card = DIAGNOSIS_CARDS.find((c) => c.id === swipe.cardId);
    if (!card) continue;
    for (const keyword of card.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([keyword]) => keyword);
}

export function getTopKeywords(
  swipes: DiagnosisSwipe[],
): { keywords: string[]; maxCount: number } {
  const counts = new Map<string, number>();

  for (const swipe of swipes) {
    if (!swipe.agreed) continue;
    const card = DIAGNOSIS_CARDS.find((c) => c.id === swipe.cardId);
    if (!card) continue;
    for (const keyword of card.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  let maxCount = 0;
  for (const count of counts.values()) {
    if (count > maxCount) maxCount = count;
  }

  if (maxCount === 0) return { keywords: [], maxCount: 0 };

  const keywords = [...counts.entries()]
    .filter(([, count]) => count === maxCount)
    .map(([keyword]) => keyword)
    .sort((a, b) => a.localeCompare(b, "ko"));

  return { keywords, maxCount };
}

/** 누적 키워드로 추천 도서 3권 필터링 (부족하면 풀에서 채움) */
export function filterBooksByKeywords(
  keywords: string[],
  limit = 3,
): RecommendBook[] {
  if (keywords.length === 0) return [...RECOMMEND_BOOKS].slice(0, limit);

  const scored = RECOMMEND_BOOKS.map((book) => {
    const score = book.keywords.reduce(
      (sum, kw) => sum + (keywords.includes(kw) ? 1 : 0),
      0,
    );
    return { book, score };
  }).sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title, "ko"));

  const picked = scored.filter((s) => s.score > 0).map((s) => s.book);
  if (picked.length >= limit) return picked.slice(0, limit);

  const rest = RECOMMEND_BOOKS.filter((b) => !picked.some((p) => p.id === b.id));
  return [...picked, ...rest].slice(0, limit);
}

export function getHeadlineForKeywords(keywords: string[]): string {
  if (keywords.some((k) => ["휴식", "번아웃", "수면", "힐링"].includes(k))) {
    return "아무것도 하기 싫은 날, 당신을 위로할 3권의 책";
  }
  if (keywords.some((k) => ["자존감", "SNS피로도", "고독"].includes(k))) {
    return "나를 지키는 힘이 필요한 날, 당신을 위한 3권의 책";
  }
  if (keywords.some((k) => ["철학", "진로", "삶의의미", "성찰"].includes(k))) {
    return "방향을 찾는 당신에게 건네는 3권의 책";
  }
  return "지금 마음에 꼭 맞는 3권의 책";
}

export function loadDiagnosisHistory(): DiagnosisRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DiagnosisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDiagnosisRecord(record: DiagnosisRecord) {
  const prev = loadDiagnosisHistory().filter((r) => r.id !== record.id);
  const next = [record, ...prev].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function hasDiagnosisHistory(): boolean {
  return loadDiagnosisHistory().length > 0;
}
