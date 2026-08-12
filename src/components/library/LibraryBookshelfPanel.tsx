import { useMemo, useState } from "react";
import BookStatusBadge from "../mate/BookStatusBadge";
import type { BookStatus } from "../mate/types";
import {
  MOCK_SHELF_BOOKS,
  SHELF_FILTERS,
  filterShelfBooks,
  shelfFilterCountLabel,
  type LibraryShelfBook,
  type ShelfFilter,
} from "../../data/libraryMock";
import iconCalendar from "../../assets/library/icon-calendar.svg";
import iconModalClose from "../../assets/mate/icon-modal-close.svg";
import promoBook from "../../assets/library/promo-book.png";

type LibraryBookshelfPanelProps = {
  className?: string;
};

/** 웹 성장 기록 우측 — 내 책장 필터/목록 (Figma 716:6207) */
export default function LibraryBookshelfPanel({
  className = "",
}: LibraryBookshelfPanelProps) {
  const [books, setBooks] = useState(MOCK_SHELF_BOOKS);
  const [filter, setFilter] = useState<ShelfFilter>("finished");
  const [statusTarget, setStatusTarget] = useState<LibraryShelfBook | null>(
    null,
  );

  const filtered = useMemo(
    () => filterShelfBooks(books, filter),
    [books, filter],
  );
  const { label, count } = shelfFilterCountLabel(filter, filtered.length);

  const updateStatus = (bookId: string, status: BookStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, status } : b)),
    );
    setStatusTarget(null);
  };

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="relative flex h-12 shrink-0 border-b-2 border-gray-100">
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
                <span className="absolute inset-x-[8%] bottom-0 h-0.5 bg-primary-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-10">
        <div className="relative mx-auto mt-4 h-[108px] w-full overflow-hidden rounded-xl bg-gradient-to-t from-[rgba(170,168,233,0.81)] to-[rgba(112,108,235,0.81)] opacity-[0.85]">
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
            className="pointer-events-none absolute right-2 top-[-10px] h-[124px] w-[112px] max-w-none object-contain"
          />
        </div>

        <p className="mt-4 text-[16px] text-[#42403a]">
          {label}{" "}
          <span className="font-semibold text-primary-400">{count}</span>
        </p>

        <ul className="mt-3 flex flex-col gap-3">
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
                  className="h-[124px] w-[79px] shrink-0 rounded-tr-[4px] rounded-bl-[4px] object-cover shadow-[3px_3px_4px_rgba(99,75,4,0.25)] min-[431px]:h-[164px] min-[431px]:w-[104px] min-[431px]:rounded-tr-[5px] min-[431px]:rounded-bl-[5px]"
                />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-button1 text-gray-800 min-[431px]:text-[21px] min-[431px]:tracking-[-0.025em]">
                    {book.title}
                  </p>
                  <p className="mt-1 text-body2 leading-[23px] text-[#5c5950] min-[431px]:text-[18.5px] min-[431px]:leading-[30px]">
                    {book.author}
                  </p>
                  <p className="text-body2 leading-[23px] text-[#5c5950] min-[431px]:text-[18.5px] min-[431px]:leading-[30px]">
                    {book.genre} ㅣ {book.publisher}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BookStatusBadge status={book.status} />
                    {book.finishedAt ? (
                      <span className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-[rgba(205,204,243,0.26)] px-1.5 py-0.5">
                        <img
                          src={iconCalendar}
                          alt=""
                          className="size-[13px] shrink-0 object-contain min-[431px]:size-[17px]"
                        />
                        <span className="whitespace-nowrap text-caption text-[rgba(56,64,118,0.54)] min-[431px]:text-[16px]">
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
        <StatusModal
          book={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSelect={(status) => updateStatus(statusTarget.id, status)}
        />
      ) : null}
    </div>
  );
}

function StatusModal({
  book,
  onClose,
  onSelect,
}: {
  book: LibraryShelfBook;
  onClose: () => void;
  onSelect: (status: BookStatus) => void;
}) {
  const options: { status: BookStatus; label: string }[] = [
    { status: "unread", label: "읽지 않은 책" },
    { status: "reading", label: "읽고 있는 책" },
    { status: "finished", label: "다 읽은 책" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="status-modal-title"
        className="relative w-full max-w-[565px] rounded-[24px] bg-[#fdfdff] p-8"
      >
        <div className="relative pr-10">
          <h2
            id="status-modal-title"
            className="text-[24px] font-semibold leading-[1.5] tracking-[-0.025em] text-[#1f2937]"
          >
            {book.title}
          </h2>
          <p className="mt-2 text-body1 text-gray-400">{book.author}</p>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-0 right-0 flex size-[26px] items-center justify-center"
          >
            <img
              src={iconModalClose}
              alt=""
              className="size-[26px] object-contain"
            />
          </button>
        </div>
        <div className="mt-7 flex flex-col gap-[22px]">
          {options.map((opt) => {
            const selected = book.status === opt.status;
            return (
              <button
                key={opt.status}
                type="button"
                onClick={() => onSelect(opt.status)}
                className={`flex h-[54px] w-full items-center justify-start rounded-2xl px-5 text-left text-button1 ${
                  selected
                    ? "bg-primary-10 text-gray-900 shadow-[0_0_3px_#5d6bc4]"
                    : "bg-[#f5f6fa] text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
