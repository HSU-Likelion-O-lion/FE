import { apiRequest } from "./client";
import type { BookItem, BookStatusApi } from "./types";

export async function getBookshelf(status?: BookStatusApi) {
  return apiRequest<{ books: BookItem[] }>("/api/bookshelf", {
    query: status ? { status } : undefined,
  });
}

export async function addToBookshelf(bookId: number) {
  return apiRequest<{ userBookId: number; status: BookStatusApi }>(
    "/api/bookshelf",
    { method: "POST", body: { bookId } },
  );
}

export async function updateBookshelfStatus(
  userBookId: number,
  status: BookStatusApi,
) {
  return apiRequest<{ userBookId: number; status: BookStatusApi }>(
    `/api/bookshelf/${userBookId}`,
    { method: "PATCH", body: { status } },
  );
}

export async function removeFromBookshelf(userBookId: number) {
  return apiRequest<null>(`/api/bookshelf/${userBookId}`, {
    method: "DELETE",
  });
}
