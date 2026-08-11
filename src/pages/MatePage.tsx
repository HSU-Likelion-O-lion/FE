import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import WebGnb from "../components/WebGnb";
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
import {
  loadLibraryBooks,
  loadMateBooks,
  saveMateBooks,
} from "../data/bookShelfStore";

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
    title: "마음의 직원",
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

/** 웹 가로 캘린더용 — 전후 요일을 더 보여 줌 */
const WEEK_WEB: WeekDay[] = [
  { day: "토", date: 8, status: "past" },
  { day: "일", date: 9, status: "past" },
  { day: "월", date: 10, status: "past" },
  { day: "화", date: 11, status: "today" },
  { day: "수", date: 12, status: "future" },
  { day: "목", date: 13, status: "future" },
  { day: "금", date: 14, status: "future" },
  { day: "토", date: 15, status: "future" },
  { day: "일", date: 16, status: "future" },
  { day: "월", date: 17, status: "future" },
  { day: "화", date: 18, status: "future" },
];

type MateLocationState = {
  openFocusTime?: boolean;
  mateBookId?: string;
};

type MatePageProps = {
  books?: MateBooks;
  libraryBooks?: LibraryBook[];
};

function mergeLibrary(
  defaults: LibraryBook[],
  stored: LibraryBook[],
): LibraryBook[] {
  const storedIds = new Set(stored.map((b) => b.id));
  return [...stored, ...defaults.filter((book) => !storedIds.has(book.id))];
}

function resolveMateBooks(
  defaults: MateBooks,
  stored: MateBookItem[],
): MateBooks {
  if (stored.length > 0) return stored;
  return defaults;
}

export default function MatePage({
  books: initialBooks = MOCK_MATE_BOOKS,
  libraryBooks: initialLibrary = MOCK_LIBRARY_BOOKS,
}: MatePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<NavTab>("center");
  const [selectedDate, setSelectedDate] = useState(11);
  const [mateBooks, setMateBooks] = useState<MateBooks>(() =>
    resolveMateBooks(initialBooks, loadMateBooks()),
  );
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() =>
    mergeLibrary(initialLibrary, loadLibraryBooks()),
  );
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
  const canPick = libraryBooks.length > 0;
  const showEmpty = mateBooks.length === 0 && libraryBooks.length === 0;
  const showCarousel = !showEmpty;

  useEffect(() => {
    const state = (location.state as MateLocationState | null) ?? null;
    if (!state?.openFocusTime) return;
    setMateBooks(resolveMateBooks(initialBooks, loadMateBooks()));
    setLibraryBooks(mergeLibrary(initialLibrary, loadLibraryBooks()));
    setFocusModalOpen(true);
    navigate(".", { replace: true, state: {} });
  }, [initialBooks, initialLibrary, location.state, navigate]);

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
      const next = selected.slice(0, MATE_BOOK_LIMIT).map((book) => {
        const existing = prevById.get(book.id);
        return {
          id: book.id,
          title: book.title,
          coverUrl: book.coverUrl,
          lastReadDaysAgo: existing?.lastReadDaysAgo ?? 0,
        };
      });
      saveMateBooks(next);
      return next;
    });
    setPickSheetOpen(false);
  }, []);

  const handleEmptyCta = () => {
    if (canPick) {
      setPickSheetOpen(true);
      return;
    }
    navigate("/drawer");
  };

  const badgeCount = 3;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white pb-[97px] min-[431px]:max-w-none min-[431px]:bg-[#fdfdff] min-[431px]:pb-0">
      <WebGnb active={activeTab} onChange={setActiveTab} />

      {/* —— 모바일 헤더 —— */}
      <header className="flex items-center gap-3 px-5 pt-5 min-[431px]:hidden">
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

      {/* —— 웹 헤더 —— */}
      <header className="mx-auto hidden w-full max-w-[1440px] items-center justify-between px-10 pt-[30px] min-[431px]:flex min-[1024px]:px-40">
        <h1 className="text-[40px] font-semibold leading-10 tracking-[-0.025em] text-gray-900">
          이번 주 독서 기록
        </h1>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex h-[38px] items-center justify-center rounded-[18.7px] bg-primary-10 px-4 text-[15.4px] tracking-[-0.025em] text-primary-500"
          >
            누적배지 ㅣ {badgeCount}개
          </button>
          <button
            type="button"
            onClick={() => navigate("/mate/capsule")}
            className="flex h-[38px] items-center justify-center rounded-[18.7px] bg-primary-10 px-4 text-[15.4px] tracking-[-0.025em] text-primary-500"
          >
            영감캡슐
          </button>
        </div>
      </header>

      {/* —— 모바일 주간 캘린더 —— */}
      <section
        className="mt-5 flex flex-col px-5 min-[431px]:hidden"
        aria-label="주간 날짜"
      >
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

      {/* —— 웹 주간 캘린더 —— */}
      <section
        className="relative mx-auto mt-8 hidden w-full max-w-[1440px] overflow-hidden min-[431px]:block"
        aria-label="주간 날짜"
      >
        <div className="flex items-start justify-center gap-[54px] px-10 min-[1024px]:px-40">
          {WEEK_WEB.map((item) => {
            const selected = selectedDate === item.date;
            const disabled = item.status === "future";
            const faded = item.status === "past";

            return (
              <button
                key={`${item.day}-${item.date}`}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) setSelectedDate(item.date);
                }}
                className={`flex flex-col items-center gap-3 ${
                  faded ? "opacity-75" : ""
                } ${disabled ? "cursor-default" : "cursor-pointer"}`}
                aria-pressed={selected}
              >
                <span
                  className={`flex size-[52px] items-center justify-center rounded-full text-[20px] tracking-[-0.025em] ${
                    selected
                      ? "bg-primary-50 font-semibold text-primary-500"
                      : "font-normal text-gray-400"
                  }`}
                >
                  {item.date}
                </span>
                <span
                  className={`text-base tracking-[-0.025em] ${
                    selected
                      ? "font-medium text-gray-900"
                      : "font-normal text-gray-400"
                  }`}
                >
                  {item.day === "일"
                    ? "일요일"
                    : item.day === "월"
                      ? "월요일"
                      : item.day === "화"
                        ? "화요일"
                        : item.day === "수"
                          ? "수요일"
                          : item.day === "목"
                            ? "목요일"
                            : item.day === "금"
                              ? "금요일"
                              : "토요일"}
                </span>
              </button>
            );
          })}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[170px] bg-linear-to-r from-[#fdfdff] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[170px] bg-linear-to-l from-[#fdfdff] to-transparent"
        />
      </section>

      {showEmpty ? (
        <MateEmptySection onCta={handleEmptyCta} />
      ) : showCarousel ? (
        <MateBookSection
          books={mateBooks}
          canPick={canPick}
          onStartFocus={() => setFocusModalOpen(true)}
          onPickBooks={() => setPickSheetOpen(true)}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)] min-[431px]:hidden">
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
