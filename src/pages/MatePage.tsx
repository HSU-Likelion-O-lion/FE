import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import bookCover from "../assets/mate/book-cover.png";
import iconBadge from "../assets/mate/icon-badge.svg";
import iconCapsule from "../assets/mate/icon-capsule.svg";
import MateBookSection from "../components/mate/MateBookSection";
import MateEmptySection from "../components/mate/MateEmptySection";
import FocusTimeModal from "../components/mate/FocusTimeModal";
import type { MateBookItem, MateBooks } from "../components/mate/types";

export type { MateBookItem, MateBooks };

/** 초기 상태: [] / 여러 권이면 화살표 표시 */
const MOCK_BOOKS: MateBooks = [
  {
    title: "불안을 이기는 철학",
    coverUrl: bookCover,
    lastReadDaysAgo: 1,
  },
  {
    title: "몰입의 기술",
    coverUrl: bookCover,
    lastReadDaysAgo: 3,
  },
];
// const MOCK_BOOKS: MateBooks = [];

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type WeekDay = {
  day: (typeof WEEK_DAYS)[number];
  date: number;
  status: "past" | "today" | "future";
};

const WEEK: WeekDay[] = [
  { day: "일", date: 9, status: "past" },
  { day: "월", date: 10, status: "past" },
  { day: "화", date: 11, status: "today" },
  { day: "수", date: 12, status: "future" },
  { day: "목", date: 13, status: "future" },
  { day: "금", date: 14, status: "future" },
  { day: "토", date: 15, status: "future" },
];

type MatePageProps = {
  books?: MateBooks;
};

export default function MatePage({ books = MOCK_BOOKS }: MatePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("center");
  const [selectedDate, setSelectedDate] = useState(11);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const hasBooks = books.length > 0;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white pb-[97px]">
      <header className="flex items-center gap-3 px-5 pt-[23px]">
        <h1 className="min-w-0 flex-1 text-h2 text-gray-900">
          이번 주 독서 기록
        </h1>
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" aria-label="배지" className="size-6">
            <img src={iconBadge} alt="" className="size-full object-contain" />
          </button>
          <button
            type="button"
            aria-label="영감 캡슐"
            onClick={() => navigate("/mate/capsule")}
            className="size-6"
          >
            <img
              src={iconCapsule}
              alt=""
              className="size-full object-contain"
            />
          </button>
        </div>
      </header>

      <section className="mt-5 flex flex-col px-5" aria-label="주간 날짜">
        <div className="flex items-center justify-center rounded-t-[11px] bg-white px-2 pt-2">
          {WEEK.map((item) => (
            <div
              key={item.day}
              className="flex h-10 flex-1 items-center justify-center"
            >
              <span className="text-body2 text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center rounded-b-[11px] bg-white px-2 pb-2">
          {WEEK.map((item) => {
            const selected = selectedDate === item.date;
            const disabled = item.status === "future";

            return (
              <button
                key={item.date}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) setSelectedDate(item.date);
                }}
                className={`relative flex h-10 flex-1 items-center justify-center ${
                  disabled ? "cursor-default" : "cursor-pointer"
                }`}
                aria-pressed={selected}
                aria-disabled={disabled}
              >
                <span
                  className={`text-[18px] leading-[26px] tracking-[-0.025em] ${
                    selected
                      ? "font-semibold text-primary-500"
                      : item.status === "future"
                        ? "font-normal text-gray-300"
                        : "font-normal text-gray-800"
                  }`}
                >
                  {item.date}
                </span>
                {selected && !disabled && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-9 -translate-x-1/2 rounded-t-[3px] bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {hasBooks ? (
        <MateBookSection
          books={books}
          onStartFocus={() => setFocusModalOpen(true)}
        />
      ) : (
        <MateEmptySection />
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>

      <FocusTimeModal
        open={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
      />
    </main>
  );
}
