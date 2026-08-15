import { apiRequest, ApiError } from "./client";
import { parseEmotionCardId } from "../data/emotionCards";
import type { RecommendedBook } from "./types";

export type EmotionCard = {
  cardId: number;
  content: string;
};

function normalizeCards(raw: unknown): EmotionCard[] {
  if (!Array.isArray(raw)) return [];
  const out: EmotionCard[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const cardId = parseEmotionCardId(row.cardId ?? row.id ?? row.code);
    const content =
      typeof row.content === "string"
        ? row.content
        : typeof row.text === "string"
          ? row.text
          : "";
    if (cardId == null || !content) continue;
    out.push({ cardId, content });
  }
  return out;
}

/** StrictMode 등에서 동일 GET이 겹칠 때 네트워크 1회로 합침 */
let randomCardsInflight: Promise<{ cards: EmotionCard[] }> | null = null;
const diagnosisDetailInflight = new Map<
  number,
  Promise<{
    diagnosisId: number;
    createdAt: string;
    recommendedBooks: RecommendedBook[];
  }>
>();
let diagnosesListInflight: Promise<{
  diagnoses: { diagnosisId: number; createdAt: string }[];
}> | null = null;

export async function getRandomEmotionCards(options?: {
  signal?: AbortSignal;
}) {
  if (!randomCardsInflight) {
    randomCardsInflight = (async () => {
      const data = await apiRequest<{ cards: unknown }>(
        "/api/emotion-cards/random",
        { signal: options?.signal },
      );
      const cards = normalizeCards(data?.cards);
      if (cards.length === 0) {
        throw new ApiError(
          "감정 카드를 불러오지 못했습니다.",
          "EMPTY_CARDS",
          200,
        );
      }
      return { cards };
    })().finally(() => {
      randomCardsInflight = null;
    });
  }
  return randomCardsInflight;
}

export async function submitEmotionDiagnosis(
  swipes: { cardId: number | string; liked: boolean }[],
) {
  const normalized = swipes.map((s) => {
    const cardId = parseEmotionCardId(s.cardId);
    if (cardId == null) {
      throw new Error(`잘못된 카드 ID: ${String(s.cardId)}`);
    }
    return { cardId, liked: Boolean(s.liked) };
  });

  return apiRequest<{
    diagnosisId: number;
    recommendedBooks: RecommendedBook[];
  }>("/api/emotion-diagnoses", {
    method: "POST",
    body: { swipes: normalized },
  });
}

export async function getEmotionDiagnoses(options?: { signal?: AbortSignal }) {
  if (!diagnosesListInflight) {
    diagnosesListInflight = apiRequest<{
      diagnoses: { diagnosisId: number; createdAt: string }[];
    }>("/api/emotion-diagnoses", { signal: options?.signal }).finally(() => {
      diagnosesListInflight = null;
    });
  }
  return diagnosesListInflight;
}

export async function getEmotionDiagnosis(
  diagnosisId: number,
  options?: { signal?: AbortSignal },
) {
  const existing = diagnosisDetailInflight.get(diagnosisId);
  if (existing) return existing;

  const request = apiRequest<{
    diagnosisId: number;
    createdAt: string;
    recommendedBooks: RecommendedBook[];
  }>(`/api/emotion-diagnoses/${diagnosisId}`, {
    signal: options?.signal,
  }).finally(() => {
    diagnosisDetailInflight.delete(diagnosisId);
  });

  diagnosisDetailInflight.set(diagnosisId, request);
  return request;
}
