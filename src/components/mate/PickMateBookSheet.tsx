import { useEffect, useRef, useState, type TouchEvent } from "react";
import { getMe } from "../../api";
import iconModalClose from "../../assets/mate/icon-modal-close.svg";
import Button from "../Button";
import BookStatusBadge from "./BookStatusBadge";
import { matePinLimitForPlan, type LibraryBook } from "./types";

const DISMISS_THRESHOLD = 80;

type PickMateBookSheetProps = {
  open: boolean;
  books: LibraryBook[];
  /** 현재 메이트에 올려둔 책 id (시트가 열릴 때 선택 상태로 반영) */
  selectedMateIds: string[];
  /** 요금제 핀 한도 — 없으면 시트 오픈 시 /users/me 로 조회 */
  pinLimit?: number;
  onClose: () => void;
  onConfirm: (selected: LibraryBook[]) => void;
};

export default function PickMateBookSheet({
  open,
  books,
  selectedMateIds,
  pinLimit: pinLimitProp,
  onClose,
  onConfirm,
}: PickMateBookSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pinLimit, setPinLimit] = useState(
    () => pinLimitProp ?? matePinLimitForPlan("BASIC"),
  );
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (pinLimitProp != null) {
      setPinLimit(pinLimitProp);
    }
  }, [pinLimitProp]);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setDragging(false);
      return;
    }

    setSelectedIds(selectedMateIds);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let cancelled = false;
    if (pinLimitProp == null) {
      void getMe()
        .then((me) => {
          if (!cancelled) setPinLimit(matePinLimitForPlan(me.plan));
        })
        .catch(() => {
          if (!cancelled) setPinLimit(matePinLimitForPlan("BASIC"));
        });
    }

    return () => {
      cancelled = true;
      document.body.style.overflow = prev;
    };
    // 시트 오픈 시에만 메이트 선택 상태를 시드한다 (편집 중 리셋 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleTouchStart = (e: TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const delta = e.touches[0].clientY - startYRef.current;
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragY >= DISMISS_THRESHOLD) {
      onClose();
      return;
    }
    setDragY(0);
  };

  const toggleBook = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= pinLimit) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    const selected = books
      .filter((book) => selectedIds.includes(book.id))
      .slice(0, pinLimit);
    onConfirm(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center min-[431px]:items-center min-[431px]:px-5">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pick-mate-book-sheet-title"
        className="relative z-10 flex max-h-[min(607px,85dvh)] w-full max-w-[430px] flex-col rounded-t-[24px] bg-white pb-[env(safe-area-inset-bottom)] will-change-transform min-[431px]:h-[min(720px,90dvh)] min-[431px]:max-h-[min(720px,90dvh)] min-[431px]:w-[533px] min-[431px]:max-w-[533px] min-[431px]:rounded-[24px] min-[431px]:pb-8 min-[431px]:pt-8"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
      >
        {/* 모바일: 드래그 핸들 / 웹: 숨김 */}
        <div
          className="touch-none shrink-0 min-[431px]:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex cursor-grab justify-center pt-[14px] pb-[11px] active:cursor-grabbing">
            <span className="h-2 w-[50px] rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col items-start px-5 min-[431px]:px-8">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id="pick-mate-book-sheet-title"
                className="text-h2 text-left text-gray-900 min-[431px]:text-[28px] min-[431px]:leading-9"
              >
                메이트에 올려둘 책
              </h2>
              <p className="mt-1 text-left text-body1 text-gray-400">
                서재에서 최대 {pinLimit}권까지 선택할 수 있어요
              </p>
            </div>
            {/* 웹: 우상단 X */}
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="hidden size-[26px] shrink-0 items-center justify-center min-[431px]:flex"
            >
              <img
                src={iconModalClose}
                alt=""
                className="size-full object-contain"
              />
            </button>
          </div>
          <p className="mt-3 text-left text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-primary-400 min-[431px]:mt-4">
            현재선택 : {selectedIds.length} / {pinLimit}권
          </p>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto min-[431px]:mt-5">
          {books.length === 0 ? (
            <p className="px-5 py-8 text-center text-body2 text-gray-400 min-[431px]:px-8">
              꺼낼 수 있는 책이 없어요.
            </p>
          ) : (
            <ul className="flex flex-col">
              {books.map((book) => {
                const selected = selectedIds.includes(book.id);
                const atLimit = !selected && selectedIds.length >= pinLimit;

                return (
                  <li key={book.id}>
                    <button
                      type="button"
                      disabled={atLimit}
                      onClick={() => toggleBook(book.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-2.5 px-5 py-3 text-left transition-colors min-[431px]:gap-6 min-[431px]:px-8 ${
                        selected ? "bg-primary-10" : "bg-white"
                      } ${atLimit ? "opacity-50" : ""}`}
                    >
                      <div className="relative h-[124px] w-[79px] shrink-0 overflow-hidden rounded-tr-[4px] rounded-bl-[4px] shadow-[3px_3px_4px_rgba(99,75,4,0.31)]">
                        <img
                          src={book.coverUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col items-start py-[11px]">
                        <p className="truncate text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-800">
                          {book.title}
                        </p>
                        <p className="mt-0.5 text-body2 text-gray-500">
                          {book.author}
                        </p>
                        {book.publisher ? (
                          <p className="text-body2 text-gray-500">
                            {book.publisher}
                          </p>
                        ) : null}
                        <div className="mt-2">
                          <BookStatusBadge status={book.status} />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 justify-center bg-linear-to-t from-white via-white to-transparent px-5 pb-5 pt-3 min-[431px]:px-8 min-[431px]:pb-0 min-[431px]:pt-4">
          <Button
            text="선택완료"
            variant="primary"
            size="h-[54px] w-full px-5 py-3 min-[431px]:w-[399px]"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
