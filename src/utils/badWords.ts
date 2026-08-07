/** 쉼터 사유 금칙어 — 긴 단어부터 매칭 */
export const BAD_WORDS = [
  "개새끼",
  "개새기",
  "개자식",
  "개소리",
  "개새",
  "미친년",
  "미친놈",
  "씨발",
  "시발",
  "씨바",
  "시바",
  "슈발",
  "쒸발",
  "병신",
  "빙신",
  "븅신",
  "지랄",
  "염병",
  "존나",
  "졸라",
  "좆나",
  "좃나",
  "좆",
  "좃",
  "미친",
] as const;

const BAD_WORD_PATTERN = new RegExp(
  `(${[...BAD_WORDS]
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
  "g",
);

export function containsBadWord(text: string) {
  BAD_WORD_PATTERN.lastIndex = 0;
  return BAD_WORD_PATTERN.test(text);
}

export type HighlightPart = {
  text: string;
  bad: boolean;
};

/** 금칙어 구간을 분리해 하이라이트용 조각으로 반환 */
export function splitBadWordParts(text: string): HighlightPart[] {
  if (!text) return [];
  BAD_WORD_PATTERN.lastIndex = 0;
  const parts: HighlightPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BAD_WORD_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), bad: false });
    }
    parts.push({ text: match[0]!, bad: true });
    lastIndex = index + match[0]!.length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bad: false });
  }

  return parts.length > 0 ? parts : [{ text, bad: false }];
}
