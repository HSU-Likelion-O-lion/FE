import { useState } from "react";
import arrowCircle from "../../assets/mate/arrow-circle.svg";
import arrowChevron from "../../assets/mate/arrow-chevron.svg";
import type { MateBookItem } from "./types";

type MateBookSectionProps = {
  books: MateBookItem[];
  onStartFocus?: () => void;
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
      className={`absolute top-[88px] z-30 flex size-8 items-center justify-center ${
        direction === "prev" ? "left-0" : "right-0"
      }`}
    >
      <img
        src={arrowCircle}
        alt=""
        className="absolute inset-[-4px] size-10 max-w-none"
      />
      <img
        src={arrowChevron}
        alt=""
        className={`relative h-[13.5px] w-[7.5px] object-contain ${
          direction === "prev" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

export default function MateBookSection({
  books,
  onStartFocus,
}: MateBookSectionProps) {
  const [index, setIndex] = useState(0);
  const book = books[index] ?? books[0];
  const showArrows = books.length > 1;

  if (!book) return null;

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  const goNext = () => {
    setIndex((prev) => (prev + 1) % books.length);
  };

  return (
    <section className="relative mt-[65px] flex w-full flex-col items-center px-5">
      <div className="relative flex w-full items-start justify-center">
        {showArrows && <ArrowButton direction="prev" onClick={goPrev} />}

        <div className="relative h-[223px] w-[259px]">
          <div className="absolute left-1/2 top-0 z-0 h-[208px] w-[140px] -translate-x-1/2 overflow-hidden rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[2px]">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="size-full object-cover object-bottom"
            />
          </div>

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

        {showArrows && <ArrowButton direction="next" onClick={goNext} />}
      </div>

      <h2 className="mt-5 text-center text-h3 text-gray-800">{book.title}</h2>
      <p className="mt-2 text-center text-body2 text-gray-400">
        최근에 읽은 책 ㅣ 마지막 읽은 날 : {formatLastRead(book.lastReadDaysAgo)}
      </p>

      <button
        type="button"
        onClick={onStartFocus}
        className="mt-6 rounded-[25px] bg-white px-5 py-3 text-center text-[16px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 drop-shadow-[0_0_2px_rgba(169,173,190,0.57)]"
      >
        집중시작
      </button>
    </section>
  );
}
