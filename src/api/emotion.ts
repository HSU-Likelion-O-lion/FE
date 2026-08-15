import { apiRequest } from "./client";
import type { RecommendedBook } from "./types";

export type EmotionCard = {
  cardId: number;
  content: string;
};

export async function getRandomEmotionCards() {
  return apiRequest<{ cards: EmotionCard[] }>("/api/emotion-cards/random");
}

export async function submitEmotionDiagnosis(
  swipes: { cardId: number; liked: boolean }[],
) {
  return apiRequest<{
    diagnosisId: number;
    recommendedBooks: RecommendedBook[];
  }>("/api/emotion-diagnoses", {
    method: "POST",
    body: { swipes },
  });
}

export async function getEmotionDiagnoses() {
  return apiRequest<{
    diagnoses: { diagnosisId: number; createdAt: string }[];
  }>("/api/emotion-diagnoses");
}

export async function getEmotionDiagnosis(diagnosisId: number) {
  return apiRequest<{
    diagnosisId: number;
    createdAt: string;
    recommendedBooks: RecommendedBook[];
  }>(`/api/emotion-diagnoses/${diagnosisId}`);
}
