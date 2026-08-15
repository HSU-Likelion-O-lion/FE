import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BookStatusBadge from "../components/mate/BookStatusBadge";
import type { BookStatus } from "../components/mate/types";
import { useIsDesktop } from "../hooks/useIsDesktop";
import {
  getBookshelf,
  mapBookItemToLibraryBook,
  mapUiStatusToApi,
  removeFromBookshelf,
  updateBookshelfStatus,
} from "../api";
import {
  SHELF_FILTERS,
  filterShelfBooks,
  shelfFilterCountLabel,
  type LibraryShelfBook,
  type ShelfFilter,
} from "../data/library";
import iconBack from "../assets/library/icon-back.svg";
import iconCalendar from "../assets/library/icon-calendar.svg";
import promoBook from "../assets/library/promo-book.png";

/** 내 책장 목록 (Figma 547:3820, 552:4266) — 웹은 서재 성장탭에 임베드 */
export default function LibraryBookshelfPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [books, setBooks] = useState<LibraryShelfBook[]>([]);
  const [filter, setFilter] = useState<ShelfFilter>("all");
  const [statusTarget, setStatusTarget] = useState<LibraryShelfBook | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shelf = await getBookshelf();
        if (cancelled) return;
        setBooks(shelf.books.map((item) => mapBookItemToLibraryBook(item)));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        alert(
          err instanceof Error
            ? err.message
            : "책장을 불러오지 못했습니다.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => filterShelfBooks(books, filter),
    [books, filter],
  );
  const { label, count } = shelfFilterCountLabel(filter, filtered.length);

  const updateStatus = async (book: LibraryShelfBook, status: BookStatus) => {
    const userBookId = book.userBookId ?? Number(book.id);
    if (!userBookId || Number.isNaN(userBookId)) return;
    setBusy(true);
    try {
      await updateBookshelfStatus(userBookId, mapUiStatusToApi(status));
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, status } : b)),
      );
      setStatusTarget(null);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  };

  const removeBook = async (book: LibraryShelfBook) => {
    const userBookId = book.userBookId ?? Number(book.id);
    if (!userBookId || Number.isNaN(userBookId)) return;
    if (!window.confirm("이 책을 책장에서 삭제할까요?")) return;
    setBusy(true);
    try {
      await removeFromBookshelf(userBookId);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      setStatusTarget(null);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "삭제에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (isDesktop) {
    return <Navigate to="/library?section=growth" replace />;
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#fdfdff]">
      <header className="sticky top-0 z-20 shrink-0 bg-[#fdfdff] pt-[calc(20px+env(safe-area-inset-top))]">
        <div className="relative flex h-11 items-center justify-center px-5">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate("/library")}
            className="absolute left-5 flex size-6 items-center justify-center"
          >
            <img
              src={iconBack}
              alt=""
              className="size-6 dark:invert object-contain"
            />
          </button>
          <h1 className="text-h3 text-gray-900">내 책장</h1>
        </div>

        <div className="relative flex h-12 border-b-2 border-gray-100">
          {SHELF_FILTERS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`relative flex flex-1 items-center justify-center text-[16px] tracking-[-0.025em] ${
                  active ? "font-medium text-gray-800" : "text-gray-500"
                }`}
              >
                {tab.label}
                {active ? (
                  <span className="absolute inset-x-[10%] bottom-0 h-0.5 bg-primary-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="flex items-center px-5 py-2.5">
          <p className="text-[16px] text-[#42403a]">
            {label}{" "}
            <span className="font-semibold text-primary-400">{count}</span>
          </p>
        </div>

        <div className="relative mx-auto h-[108px] w-[calc(100%-40px)] overflow-hidden rounded-xl bg-gradient-to-t from-[rgba(170,168,233,0.81)] to-[rgba(112,108,235,0.81)] opacity-[0.85]">
          <p className="absolute left-4 top-3.5 text-[20px] font-semibold leading-[30px] tracking-[-0.025em] text-[#fefefe]">
            독자의 마음을 뜨겁게 한 책
          </p>
          <p className="absolute left-4 top-[42px] text-[13px] leading-[23px] tracking-[-0.025em] text-[#f2f1ec]">
            치치새가 사는 숲
          </p>
          <button
            type="button"
            className="absolute left-4 top-[74px] flex h-[22px] items-center rounded-[21px] bg-[#fefefe] px-2 text-caption text-[#8e8b7e]"
          >
            보러가기 ›
          </button>
          <img
            src={promoBook}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-[234px] top-[-10px] h-[124px] w-[112px] max-w-none object-contain"
          />
        </div>

        <ul className="mt-3 flex flex-col gap-3 px-5 pb-8">
          {filtered.map((book) => (
            <li key={book.id}>
              <button
                type="button"
                onClick={() => setStatusTarget(book)}
                className="flex w-full gap-6 py-2.5 text-left"
              >
                <img
                  src={book.coverUrl}
                  alt=""
                  className="h-[124px] w-[79px] shrink-0 rounded-tr-[4px] rounded-bl-[4px] object-cover shadow-[3px_3px_4px_rgba(99,75,4,0.25)]"
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-button1 text-gray-800">{book.title}</p>
                  <p className="mt-1 text-body2 leading-[23px] text-[#5c5950]">
                    {book.author}
                  </p>
                  <p className="text-body2 leading-[23px] text-[#5c5950]">
                    {book.genre} ㅣ {book.publisher}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BookStatusBadge status={book.status} />
                    {book.finishedAt ? (
                      <span className="inline-flex h-6 items-center gap-1 rounded-[6px] bg-[rgba(205,204,243,0.26)] px-1 py-0.5">
                        <img
                          src={iconCalendar}
                          alt=""
                          className="size-[13px] shrink-0 object-contain"
                        />
                        <span className="whitespace-nowrap text-caption text-[rgba(56,64,118,0.54)]">
                          {book.finishedAt}
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="py-16 text-center text-body2 text-gray-400">
              해당 조건의 책이 없습니다.
            </li>
          ) : null}
        </ul>
      </div>

      {statusTarget ? (
        <StatusSheet
          book={statusTarget}
          busy={busy}
          onClose={() => setStatusTarget(null)}
          onSelect={(status) => updateStatus(statusTarget, status)}
          onRemove={() => removeBook(statusTarget)}
        />
      ) : null}
    </main>
  );
}

function StatusSheet({
  book,
  busy,
  onClose,
  onSelect,
  onRemove,
}: {
  book: LibraryShelfBook;
  busy: boolean;
  onClose: () => void;
  onSelect: (status: BookStatus) => void;
  onRemove: () => void;
}) {
  const options: { status: BookStatus; label: string }[] = [
    { status: "unread", label: "읽지 않은 책" },
    { status: "reading", label: "읽고 있는 책" },
    { status: "finished", label: "다 읽은 책" },
  ];

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px]">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="status-sheet-title"
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-[#fdfdff] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto mb-6 h-2 w-[50px] rounded-full bg-gray-200" />
        <h2 id="status-sheet-title" className="text-h2 text-[#1f2937]">
          {book.title}
        </h2>
        <p className="mt-1 text-body1 text-gray-400">{book.author}</p>
        <div className="mt-8 flex flex-col gap-4">
          {options.map((opt) => {
            const selected = book.status === opt.status;
            return (
              <button
                key={opt.status}
                type="button"
                disabled={busy}
                onClick={() => onSelect(opt.status)}
                className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 disabled:opacity-60 ${
                  selected
                    ? "bg-primary-10 text-gray-900 shadow-[0_0_2px_#5d6bc4]"
                    : "bg-[#f5f6fa] text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#f5f6fa] text-button1 text-red-500 disabled:opacity-60"
          >
            책장에서 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
