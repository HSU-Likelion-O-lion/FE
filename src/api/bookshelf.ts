import { apiRequest, ApiError } from "./client";
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

/** 서재에 없으면 담고, 있으면 기존 userBookId 반환 */
export async function ensureOnBookshelf(bookId: number): Promise<{
  userBookId: number;
  status: BookStatusApi;
  created: boolean;
}> {
  const { books } = await getBookshelf();
  const existing = books.find((b) => b.book.bookId === bookId);
  if (existing) {
    return {
      userBookId: existing.userBookId,
      status: existing.status as BookStatusApi,
      created: false,
    };
  }

  try {
    const added = await addToBookshelf(bookId);
    return { ...added, created: true };
  } catch (err) {
    // 레이스/이미 담김(409) → 다시 조회
    if (err instanceof ApiError && err.httpStatus === 409) {
      const refreshed = await getBookshelf();
      const again = refreshed.books.find((b) => b.book.bookId === bookId);
      if (again) {
        return {
          userBookId: again.userBookId,
          status: again.status as BookStatusApi,
          created: false,
        };
      }
    }
    throw err;
  }
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
