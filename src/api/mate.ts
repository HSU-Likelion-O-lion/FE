import { apiRequest, ApiError } from "./client";
import { ensureOnBookshelf } from "./bookshelf";
import type { Day, Pin } from "./types";

export async function getMateDashboard() {
  return apiRequest<{
    week: Day[];
    pins: Pin[];
    badgeCount: number;
  }>("/api/mate/dashboard");
}

export async function getMatePins() {
  return apiRequest<{ pins: Pin[] }>("/api/mate/pins");
}

export async function pinMateBook(userBookId: number) {
  try {
    return await apiRequest<{ pinnedOrder: number }>("/api/mate/pins", {
      method: "POST",
      body: { userBookId },
    });
  } catch (err) {
    // 이미 핀된 경우(StrictMode 중복 호출 등) → 성공으로 처리
    if (err instanceof ApiError && err.httpStatus === 409) {
      return { pinnedOrder: -1 };
    }
    throw err;
  }
}

export async function unpinMateBook(userBookId: number) {
  try {
    return await apiRequest<null>(`/api/mate/pins/${userBookId}`, {
      method: "DELETE",
    });
  } catch (err) {
    // 이미 해제됐거나 없는 핀(COMMON_404_1) → 성공으로 처리
    if (err instanceof ApiError && err.httpStatus === 404) {
      return null;
    }
    throw err;
  }
}

/** StrictMode 등에서 동일 bookId 메이트 지정이 겹칠 때 1회로 합침 */
const assignMateInflight = new Map<
  number,
  Promise<{ userBookId: number }>
>();

/** 서재에 담겨 있으면 핀만, 없으면 담은 뒤 핀 */
export async function assignMateFromBook(bookId: number) {
  const existing = assignMateInflight.get(bookId);
  if (existing) return existing;

  const promise = (async () => {
    const shelf = await ensureOnBookshelf(bookId);
    await pinMateBook(shelf.userBookId);
    return { userBookId: shelf.userBookId };
  })().finally(() => {
    assignMateInflight.delete(bookId);
  });

  assignMateInflight.set(bookId, promise);
  return promise;
}
