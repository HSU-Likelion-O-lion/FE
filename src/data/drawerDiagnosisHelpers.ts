/** 서랍 진단 UI 헬퍼 */

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
