import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import bookCover1 from "../assets/mate/book-cover-1.jpg";
import bookCover2 from "../assets/mate/book-cover-2.png";
import bookCover3 from "../assets/mate/book-cover-3.png";
import bookCover from "../assets/mate/book-cover.png";
import iconBadge from "../assets/mate/icon-badge.svg";
import iconCapsule from "../assets/mate/icon-capsule.svg";
import MateBookSection from "../components/mate/MateBookSection";
import MateEmptySection from "../components/mate/MateEmptySection";
import FocusTimeModal from "../components/mate/FocusTimeModal";
import FocusTimerPopup, {
  clearFocusTimerSession,
  loadFocusTimerSession,
} from "../components/mate/FocusTimerPopup";
import PickMateBookSheet from "../components/mate/PickMateBookSheet";
import {
  MATE_BOOK_LIMIT,
  type LibraryBook,
  type MateBookItem,
  type MateBooks,
} from "../components/mate/types";

export type { MateBookItem, MateBooks };

const MOCK_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: "lib-1",
    title: "불안을 이기는 철학",
    author: "브리지드 딜레이니",
    genre: "장편소설",
    publisher: "창비",
    coverUrl: bookCover1,
    status: "unread",
  },
  {
    id: "lib-2",
    title: "여름을 한 입 베어 물었더니",
    author: "이꽃",
    genre: "장편소설",
    publisher: "문학동네",
    coverUrl: bookCover2,
    status: "reading",
  },
  {
    id: "lib-3",
    title: "일억 번째 여름",
    author: "청예",
    genre: "장편소설",
    publisher: "창비",
    coverUrl: bookCover3,
    status: "finished",
  },
  {
    id: "lib-4",
    title: "몰입의 기술",
    author: "미하이 칙센트미하이",
    genre: "자기계발",
    publisher: "책읽는수요일",
    coverUrl: bookCover,
    status: "reading",
  },
  {
    id: "lib-5",
    title: "마음의 법칙",
    author: "김하나",
    genre: "에세이",
    publisher: "위즈덤하우스",
    coverUrl: bookCover1,
    status: "unread",
  },
  {
    id: "lib-6",
    title: "고요할수록 밝아지는 것들",
    author: "혜민",
    genre: "에세이",
    publisher: "수오서재",
    coverUrl: bookCover2,
    status: "finished",
  },
];

/** 메이트에 이미 꺼내둔 책 (0~N, N≤5) — 데모용으로 1권 */
const MOCK_MATE_BOOKS: MateBooks = [
  {
    id: "lib-1",
    title: "불안을 이기는 철학",
    coverUrl: bookCover1,
    lastReadDaysAgo: 1,
  },
];

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
  libraryBooks?: LibraryBook[];
};

export default function MatePage({
  books: initialBooks = MOCK_MATE_BOOKS,
  libraryBooks: initialLibrary = MOCK_LIBRARY_BOOKS,
}: MatePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("center");
  const [selectedDate, setSelectedDate] = useState(11);
  const [mateBooks, setMateBooks] = useState<MateBooks>(initialBooks);
  const [libraryBooks] = useState<LibraryBook[]>(initialLibrary);
  const [pickSheetOpen, setPickSheetOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timerInitialRemaining, setTimerInitialRemaining] = useState<
    number | undefined
  >();
  const [timerInitialPaused, setTimerInitialPaused] = useState<
    boolean | undefined
  >();
  const [timerStartKey, setTimerStartKey] = useState(0);

  const selectedMateIds = mateBooks.map((book) => book.id);
  /** 서재에 책이 있으면 시트에서 선택/해제 가능 */
  const canPick = libraryBooks.length > 0;
  const showEmpty = mateBooks.length === 0 && libraryBooks.length === 0;
  const showCarousel = !showEmpty;

  // 앱 종료 후 재진입 시 세션 복구
  useEffect(() => {
    const session = loadFocusTimerSession();
    if (!session) return;
    setTimerMinutes(session.minutes);
    setTimerInitialRemaining(session.remainingSeconds);
    setTimerInitialPaused(true);
    setTimerOpen(true);
  }, []);

  const closeTimer = useCallback(() => {
    clearFocusTimerSession();
    setTimerOpen(false);
    setTimerInitialRemaining(undefined);
    setTimerInitialPaused(undefined);
  }, []);

  const handlePickConfirm = useCallback((selected: LibraryBook[]) => {
    setMateBooks((prev) => {
      const prevById = new Map(prev.map((book) => [book.id, book]));
      return selected.slice(0, MATE_BOOK_LIMIT).map((book) => {
        const existing = prevById.get(book.id);
        return {
          id: book.id,
          title: book.title,
          coverUrl: book.coverUrl,
          lastReadDaysAgo: existing?.lastReadDaysAgo ?? 0,
        };
      });
    });
  }, []);

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

      {showEmpty ? (
        <MateEmptySection />
      ) : showCarousel ? (
        <MateBookSection
          books={mateBooks}
          canPick={canPick}
          onStartFocus={() => setFocusModalOpen(true)}
          onPickBooks={() => setPickSheetOpen(true)}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>

      <FocusTimeModal
        open={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        onSelect={(minutes) => {
          clearFocusTimerSession();
          setTimerInitialRemaining(undefined);
          setTimerInitialPaused(undefined);
          setTimerMinutes(minutes);
          setTimerStartKey((key) => key + 1);
          setTimerOpen(true);
        }}
      />

      <FocusTimerPopup
        open={timerOpen}
        minutes={timerMinutes}
        initialRemaining={timerInitialRemaining}
        initialPaused={timerInitialPaused}
        startKey={timerStartKey}
        onClose={closeTimer}
        onComplete={() => {
          setTimerOpen(false);
          setTimerInitialRemaining(undefined);
          setTimerInitialPaused(undefined);
          // 타이머 history state가 남아 있어도 goal로 교체
          navigate("/mate/goal", { replace: true });
        }}
      />

      <PickMateBookSheet
        open={pickSheetOpen}
        books={libraryBooks}
        selectedMateIds={selectedMateIds}
        onClose={() => setPickSheetOpen(false)}
        onConfirm={handlePickConfirm}
      />
    </main>
  );
}
