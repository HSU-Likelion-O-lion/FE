import { useEffect, useState, type ReactNode } from "react";
import arrowCircle from "../../assets/mate/arrow-circle.svg";
import arrowChevron from "../../assets/mate/arrow-chevron.svg";
import iconPlus from "../../assets/mate/icon-plus.svg";
import type { MateBookItem } from "./types";

type MateBookSectionProps = {
  books: MateBookItem[];
  /** 서재에 꺼낼 수 있는 책이 있으면 pick 슬라이드 표시 */
  canPick?: boolean;
  onStartFocus?: (book: MateBookItem) => void;
  onPickBooks?: () => void;
};

function formatLastRead(daysAgo: number) {
  if (daysAgo <= 0) return "오늘";
  return `${daysAgo}일 전`;
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 책" : "다음 책"}
      onClick={onClick}
      className={`absolute top-[88px] z-30 flex size-8 items-center justify-center min-[431px]:top-[112px] min-[431px]:size-[42px] ${
        direction === "prev" ? "left-0" : "right-0"
      }`}
    >
      <img
        src={arrowCircle}
        alt=""
        className="absolute inset-[-4px] size-10 max-w-none min-[431px]:inset-[-5px] min-[431px]:size-[52.5px]"
      />
      <img
        src={arrowChevron}
        alt=""
        className={`relative h-[13.5px] w-[7.5px] object-contain min-[431px]:h-[18px] min-[431px]:w-[10px] ${
          direction === "prev" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

function BookShelf({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[223px] w-[259px]">
      {children}

      {/* 선반 앞 유리 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[6px] top-[180px] z-10 h-7 w-[247px] rounded-t-[7px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2px]"
      />

      {/* 선반 */}
      <div className="absolute bottom-0 left-0 z-20 h-[15px] w-full bg-white shadow-[0_0_4px_rgba(19,19,20,0.14)]">
        <div className="absolute inset-0 shadow-[inset_0_-3px_4px_rgba(27,27,29,0.12)]" />
      </div>
    </div>
  );
}

export default function MateBookSection({
  books,
  canPick = true,
  onStartFocus,
  onPickBooks,
}: MateBookSectionProps) {
  // 인덱스 0..books.length — 마지막은 pick 슬라이드 (canPick일 때)
  const slideCount = canPick ? books.length + 1 : Math.max(books.length, 1);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, slideCount - 1));
  }, [slideCount]);

  const isPickSlide = canPick && index === books.length;
  const book = !isPickSlide ? (books[index] ?? books[0]) : undefined;
  const showArrows = slideCount > 1;

  if (!canPick && books.length === 0) return null;

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goNext = () => {
    setIndex((prev) => (prev + 1) % slideCount);
  };

  return (
    <section className="relative mt-[65px] flex w-full flex-col items-center px-5">
      {/*
        모바일: 섹션 폭 기준 left/right.
        웹: Figma 656:6473 — 책+화살표 프레임 458px (화살표가 뷰포트 끝으로 밀리지 않도록).
      */}
      <div className="relative flex w-full items-start justify-center min-[431px]:mx-auto min-[431px]:w-[458px]">
        {showArrows && <ArrowButton direction="prev" onClick={goPrev} />}

        <BookShelf>
          {isPickSlide ? (
            <div
              aria-hidden
              className="absolute left-1/2 top-0 z-0 flex h-[208px] w-[140px] -translate-x-1/2 items-center justify-center rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[2px] border-2 border-dashed border-gray-200 bg-gray-50"
            >
              <img src={iconPlus} alt="" className="size-6 object-contain" />
            </div>
          ) : (
            book && (
              <div className="absolute left-1/2 top-0 z-0 h-[208px] w-[140px] -translate-x-1/2 overflow-hidden rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[2px]">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="size-full object-cover object-bottom"
                />
              </div>
            )
          )}
        </BookShelf>

        {showArrows && <ArrowButton direction="next" onClick={goNext} />}
      </div>

      {isPickSlide ? (
        <>
          <h2 className="mt-5 text-center text-h3 text-gray-800">
            메이트에 올려둘 책 고르기
          </h2>
          <p className="mt-2 text-center text-body2 text-gray-400">
            서재에서 최대 5권까지 선택할 수 있어요.
          </p>
          <button
            type="button"
            onClick={onPickBooks}
            className="mt-6 rounded-[25px] bg-white px-5 py-3 text-center text-[16px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 drop-shadow-[0_0_2px_rgba(169,173,190,0.57)]"
          >
            꺼낼 책 고르기
          </button>
        </>
      ) : (
        book && (
          <>
            <h2 className="mt-5 text-center text-h3 text-gray-800">
              {book.title}
            </h2>
            <p className="mt-2 text-center text-body2 text-gray-400">
              최근에 읽은 책 ㅣ 마지막 읽은 날 :{" "}
              {formatLastRead(book.lastReadDaysAgo)}
            </p>
            <button
              type="button"
              onClick={() => onStartFocus?.(book)}
              className="mt-6 rounded-[25px] bg-white px-5 py-3 text-center text-[16px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 drop-shadow-[0_0_2px_rgba(169,173,190,0.57)] mb-5"
            >
              집중시작
            </button>
          </>
        )
      )}
    </section>
  );
}
