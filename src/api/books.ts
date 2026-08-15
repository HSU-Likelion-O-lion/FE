import { apiRequest } from "./client";
import type { BookSummary, RecommendedBook } from "./types";

export type BookDetail = {
  bookId: number;
  title: string;
  author: string;
  coverImageUrl: string | null;
  publisher: string | null;
  description: string | null;
  externalUrl: string | null;
  provider: string | null;
};

export async function searchBooks(q?: string) {
  return apiRequest<{ books: BookSummary[] }>("/api/books/search", {
    query: { q },
  });
}

export async function getBook(bookId: number) {
  return apiRequest<BookDetail>(`/api/books/${bookId}`);
}

export async function getBookCuration(bookId: number, diagnosisId: number) {
  return apiRequest<{ bookId: number; curationText: string }>(
    `/api/books/${bookId}/curation`,
    { query: { diagnosisId } },
  );
}

export async function clickPurchase(bookId: number) {
  return apiRequest<{ redirectUrl: string }>(
    `/api/books/${bookId}/purchase-click`,
    { method: "POST" },
  );
}

export type { RecommendedBook };
