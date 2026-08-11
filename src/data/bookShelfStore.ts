import type { LibraryBook, MateBookItem } from "../components/mate/types";
import { MATE_BOOK_LIMIT } from "../components/mate/types";

const LIBRARY_KEY = "sseudam-library-books";
const MATE_KEY = "sseudam-mate-books";
const RECOMMEND_SESSION_KEY = "sseudam-recommend-session";

export type RecommendSession = {
  keywords: string[];
  bookIds: string[];
  viewedIds: string[];
  mateSet: boolean;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadLibraryBooks(): LibraryBook[] {
  const list = readJson<LibraryBook[]>(LIBRARY_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveLibraryBooks(books: LibraryBook[]) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
}

export function addLibraryBook(book: LibraryBook) {
  const prev = loadLibraryBooks().filter((b) => b.id !== book.id);
  const next = [book, ...prev];
  saveLibraryBooks(next);
  return next;
}

export function loadMateBooks(): MateBookItem[] {
  const list = readJson<MateBookItem[]>(MATE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveMateBooks(books: MateBookItem[]) {
  localStorage.setItem(MATE_KEY, JSON.stringify(books.slice(0, MATE_BOOK_LIMIT)));
}

/** 서재에도 담고 메이트 맨 앞에 올린다 */
export function addMateAndLibrary(book: LibraryBook) {
  addLibraryBook(book);
  const mateItem: MateBookItem = {
    id: book.id,
    title: book.title,
    coverUrl: book.coverUrl,
    lastReadDaysAgo: 0,
  };
  const prev = loadMateBooks().filter((b) => b.id !== book.id);
  const next = [mateItem, ...prev].slice(0, MATE_BOOK_LIMIT);
  saveMateBooks(next);
  return next;
}

export function loadRecommendSession(): RecommendSession | null {
  try {
    const raw = sessionStorage.getItem(RECOMMEND_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecommendSession;
  } catch {
    return null;
  }
}

export function saveRecommendSession(session: RecommendSession) {
  sessionStorage.setItem(RECOMMEND_SESSION_KEY, JSON.stringify(session));
}

export function clearRecommendSession() {
  sessionStorage.removeItem(RECOMMEND_SESSION_KEY);
}

export function startRecommendSession(keywords: string[], bookIds: string[]) {
  const session: RecommendSession = {
    keywords,
    bookIds,
    viewedIds: [],
    mateSet: false,
  };
  saveRecommendSession(session);
  return session;
}

export function markRecommendBookViewed(bookId: string) {
  const session = loadRecommendSession();
  if (!session) return null;
  if (!session.viewedIds.includes(bookId)) {
    session.viewedIds = [...session.viewedIds, bookId];
    saveRecommendSession(session);
  }
  return session;
}

export function markRecommendMateSet() {
  const session = loadRecommendSession();
  if (!session) return null;
  session.mateSet = true;
  saveRecommendSession(session);
  return session;
}

/** 메이트 지정 없이 추천 3권 소개를 모두 봤는지 */
export function shouldGoDrawerAfterIntros() {
  const session = loadRecommendSession();
  if (!session || session.mateSet) return false;
  if (session.bookIds.length === 0) return false;
  return session.bookIds.every((id) => session.viewedIds.includes(id));
}
