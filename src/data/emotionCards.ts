/** E-01 ~ E-12 감정 카드 카탈로그 (API cardId = 뒤 숫자) */

export type EmotionCardDef = {
  /** E-01 형식 */
  code: string;
  /** API에 넘기는 숫자 ID (1~12) */
  cardId: number;
  content: string;
  keywords: string[];
};

export const EMOTION_CARD_CATALOG: EmotionCardDef[] = [
  {
    code: "E-01",
    cardId: 1,
    content: "오늘따라 아무것도 하기 싫고 무기력하다.",
    keywords: ["휴식", "에세이", "위로", "번아웃"],
  },
  {
    code: "E-02",
    cardId: 2,
    content: "스마트폰을 손에 쥐고 있지 않으면 왠지 모르게 불안하다.",
    keywords: ["디지털디톡스", "집중력", "도파민"],
  },
  {
    code: "E-03",
    cardId: 3,
    content: "남들의 일상을 보며 내 현실과 비교하고 우울해진 적이 있다.",
    keywords: ["자존감", "마음챙김", "SNS피로도"],
  },
  {
    code: "E-04",
    cardId: 4,
    content: "머릿속에 생각만 많고 막상 첫 시작을 내딛기가 어렵다.",
    keywords: ["동기부여", "자기계발", "실행력"],
  },
  {
    code: "E-05",
    cardId: 5,
    content: "잠자리에 누워도 내일 하루가 전혀 기대되지 않는다.",
    keywords: ["우울증", "치유", "잔잔한위로"],
  },
  {
    code: "E-06",
    cardId: 6,
    content: "최근 들어 사소한 일에도 쉽게 짜증이 나고 날이 서 있다.",
    keywords: ["스트레스관리", "감정조절", "명상"],
  },
  {
    code: "E-07",
    cardId: 7,
    content: "인간관계가 피곤해서 지금은 그저 완벽히 혼자 있고 싶다.",
    keywords: ["고독", "개인주의", "관계정리"],
  },
  {
    code: "E-08",
    cardId: 8,
    content: "어떤 일이나 글에 10분 이상 깊게 집중해 본 지 꽤 오래되었다.",
    keywords: ["몰입", "뇌과학", "주의력"],
  },
  {
    code: "E-09",
    cardId: 9,
    content: "내가 지금 올바른 방향으로 잘 살고 있는 건지 확신이 안 선다.",
    keywords: ["철학", "진로", "인생조언"],
  },
  {
    code: "E-10",
    cardId: 10,
    content: "누구보다 바쁘게 살고 있는데, 문득 묘한 공허함이 밀려온다.",
    keywords: ["삶의의미", "인문학", "성찰"],
  },
  {
    code: "E-11",
    cardId: 11,
    content: "지금 나에게는 따뜻한 위로보다 차갑고 뼈 때리는 조언이 필요하다.",
    keywords: ["팩트폭력", "성공학", "실용서"],
  },
  {
    code: "E-12",
    cardId: 12,
    content: "이유 불문하고 그저 아무 생각 없이 뇌를 끄고 푹 쉬고 싶다.",
    keywords: ["수면", "가벼운소설", "힐링"],
  },
];

const BY_ID = new Map(EMOTION_CARD_CATALOG.map((c) => [c.cardId, c]));

/** "E-01" | "E-1" | "01" | 1 → 1 */
export function parseEmotionCardId(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const n = Math.trunc(raw);
    return n > 0 ? n : null;
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const matched = trimmed.match(/^(?:E-?)?0*([1-9]\d*)$/i);
  if (matched) return Number(matched[1]);
  const asNum = Number(trimmed);
  if (Number.isFinite(asNum) && asNum > 0) return Math.trunc(asNum);
  return null;
}

export function getEmotionCardDef(cardId: number): EmotionCardDef | undefined {
  return BY_ID.get(cardId);
}

/** 공감(liked)한 카드들의 키워드를 빈도순으로 */
export function collectLikedKeywords(
  swipes: { cardId: number; liked: boolean }[],
): string[] {
  const counts = new Map<string, number>();
  for (const swipe of swipes) {
    if (!swipe.liked) continue;
    const def = BY_ID.get(swipe.cardId);
    if (!def) continue;
    for (const keyword of def.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([keyword]) => keyword);
}
