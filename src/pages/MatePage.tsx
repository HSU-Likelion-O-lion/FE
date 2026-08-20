import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import WebGnb from "../components/WebGnb";
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
import { formatLocalDate } from "../components/mate/streak";
import {
  matePinLimitForPlan,
  type LibraryBook,
  type MateBookItem,
  type MateBooks,
} from "../components/mate/types";
import {
  ApiError,
  getActiveReadingSession,
  getBookshelf,
  getMateDashboard,
  getMe,
  mapBookItemToLibraryBook,
  pinMateBook,
  unpinMateBook,
  type TargetMinutes,
} from "../api";

export type { MateBookItem, MateBooks };

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const WEB_DAY_LABEL: Record<(typeof WEEK_DAYS)[number], string> = {
  일: "일요일",
  월: "월요일",
  화: "화요일",
  수: "수요일",
  목: "목요일",
  금: "금요일",
  토: "토요일",
};

type WeekDay = {
  day: (typeof WEEK_DAYS)[number];
  date: number;
  fullDate: string;
  status: "past" | "today" | "future";
};

type MateLocationState = {
  openFocusTime?: boolean;
  mateBookId?: string;
};

function startOfSundayWeek(base: Date): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function startOfMondayWeek(base: Date): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

/** 실제 달력으로 주간 생성 */
function buildCalendarWeek(weekStart: Date, length: number): WeekDay[] {
  const today = formatLocalDate(new Date());
  const days: WeekDay[] = [];
  for (let i = 0; i < length; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const fullDate = formatLocalDate(d);
    let status: WeekDay["status"] = "future";
    if (fullDate === today) status = "today";
    else if (fullDate < today) status = "past";
    days.push({
      day: WEEK_DAYS[d.getDay()],
      date: d.getDate(),
      fullDate,
      status,
    });
  }
  return days;
}

/** 모바일: 일~토 */
function buildMobileWeekDays(): WeekDay[] {
  return buildCalendarWeek(startOfSundayWeek(new Date()), 7);
}

/**
 * 웹: 월~일 주 + 앞뒤 2일 패딩 → 전체 토~화
 * (토·일) + (월~일) + (월·화)
 */
function buildWebWeekDays(): WeekDay[] {
  const core = buildCalendarWeek(startOfMondayWeek(new Date()), 7);
  if (core.length === 0) return [];

  const first = core[0];
  const last = core[core.length - 1];
  const padBefore: WeekDay[] = [];
  const padAfter: WeekDay[] = [];
  const today = formatLocalDate(new Date());

  for (let i = 2; i >= 1; i -= 1) {
    const d = new Date(`${first.fullDate}T00:00:00`);
    d.setDate(d.getDate() - i);
    const fullDate = formatLocalDate(d);
    padBefore.push({
      day: WEEK_DAYS[d.getDay()],
      date: d.getDate(),
      fullDate,
      status:
        fullDate === today ? "today" : fullDate < today ? "past" : "future",
    });
  }
  for (let i = 1; i <= 2; i += 1) {
    const d = new Date(`${last.fullDate}T00:00:00`);
    d.setDate(d.getDate() + i);
    const fullDate = formatLocalDate(d);
    padAfter.push({
      day: WEEK_DAYS[d.getDay()],
      date: d.getDate(),
      fullDate,
      status:
        fullDate === today ? "today" : fullDate < today ? "past" : "future",
    });
  }
  return [...padBefore, ...core, ...padAfter];
}

function pinsToMateBooks(
  pins: { userBookId: number; pinnedOrder: number }[],
  libraryById: Map<string, LibraryBook>,
): MateBooks {
  return [...pins]
    .sort((a, b) => a.pinnedOrder - b.pinnedOrder)
    .map((pin) => {
      const lib = libraryById.get(String(pin.userBookId));
      return {
        id: String(pin.userBookId),
        title: lib?.title ?? "책",
        coverUrl: lib?.coverUrl ?? "",
        lastReadDaysAgo: 0,
      };
    });
}

export default function MatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<NavTab>("center");
  const [mateBooks, setMateBooks] = useState<MateBooks>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>(() =>
    buildMobileWeekDays(),
  );
  const [weekWeb, setWeekWeb] = useState<WeekDay[]>(() => buildWebWeekDays());
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pinLimit, setPinLimit] = useState(() => matePinLimitForPlan("BASIC"));
  const [pickSheetOpen, setPickSheetOpen] = useState(false);
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusUserBookId, setFocusUserBookId] = useState<number | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<TargetMinutes>(15);
  const [timerSessionId, setTimerSessionId] = useState<number | undefined>();
  const [timerInitialRemaining, setTimerInitialRemaining] = useState<
    number | undefined
  >();
  const [timerInitialPaused, setTimerInitialPaused] = useState<
    boolean | undefined
  >();
  const [timerStartKey, setTimerStartKey] = useState(0);

  const selectedMateIds = mateBooks.map((book) => book.id);
  const canPick = libraryBooks.length > 0;
  const showEmpty = !loading && mateBooks.length === 0 && libraryBooks.length === 0;
  const showCarousel = !loading && !showEmpty;
  const todayDate = formatLocalDate(new Date());

  const refreshDashboard = useCallback(async () => {
    const [dashboard, shelf, meResult] = await Promise.all([
      getMateDashboard(),
      getBookshelf(),
      getMe().catch(() => null),
    ]);
    const library = shelf.books.map(mapBookItemToLibraryBook);
    const byId = new Map(library.map((b) => [b.id, b]));
    const mates = pinsToMateBooks(dashboard.pins, byId);
    setLibraryBooks(library);
    setMateBooks(mates);
    setPinLimit(matePinLimitForPlan(meResult?.plan));
    setWeekDays(buildMobileWeekDays());
    setWeekWeb(buildWebWeekDays());
    setBadgeCount(dashboard.badgeCount);
    return { mates, library };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refreshDashboard();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "메이트 정보를 불러오지 못했어요.";
        alert(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshDashboard]);

  useEffect(() => {
    const state = (location.state as MateLocationState | null) ?? null;
    if (!state?.openFocusTime) return;

    const openForBook = async () => {
      try {
        const { mates } = await refreshDashboard();
        const mateId = state.mateBookId;
        const target =
          (mateId && mates.find((b) => b.id === mateId)) || mates[0];
        if (target) {
          setFocusUserBookId(Number(target.id));
          setFocusModalOpen(true);
        }
      } catch {
        /* ignore — 이미 로드 실패 alert 가능 */
      }
      navigate(".", { replace: true, state: {} });
    };
    void openForBook();
  }, [location.state, navigate, refreshDashboard]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadFocusTimerSession();
      try {
        const { session } = await getActiveReadingSession();
        if (cancelled) return;
        if (session) {
          const minutes = (local?.minutes ?? 15) as TargetMinutes;
          setFocusUserBookId(local?.userBookId ?? null);
          setTimerSessionId(session.sessionId);
          setTimerMinutes(minutes);
          setTimerInitialRemaining(session.remainingSeconds);
          setTimerInitialPaused(true);
          setTimerOpen(true);
          return;
        }
      } catch {
        /* fall through to local cache */
      }
      if (cancelled || !local) return;
      setFocusUserBookId(local.userBookId ?? null);
      setTimerSessionId(local.sessionId);
      setTimerMinutes(local.minutes as TargetMinutes);
      setTimerInitialRemaining(local.remainingSeconds);
      setTimerInitialPaused(true);
      setTimerOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeTimer = useCallback(() => {
    clearFocusTimerSession();
    setTimerOpen(false);
    setTimerSessionId(undefined);
    setTimerInitialRemaining(undefined);
    setTimerInitialPaused(undefined);
  }, []);

  const handlePickConfirm = useCallback(
    async (selected: LibraryBook[]) => {
      const nextSelected = selected.slice(0, pinLimit);
      const nextIds = new Set(nextSelected.map((b) => b.id));
      const prevIds = new Set(mateBooks.map((b) => b.id));
      const toUnpin = [...prevIds].filter((id) => !nextIds.has(id));
      const toPin = [...nextIds].filter((id) => !prevIds.has(id));

      try {
        await Promise.all([
          ...toUnpin.map((id) => unpinMateBook(Number(id))),
          ...toPin.map((id) => pinMateBook(Number(id))),
        ]);
        setPickSheetOpen(false);
        window.location.reload();
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "메이트 책 저장에 실패했어요.";
        alert(message);
      }
    },
    [mateBooks, pinLimit],
  );

  const handleEmptyCta = () => {
    if (canPick) {
      setPickSheetOpen(true);
      return;
    }
    navigate("/drawer");
  };

  const openFocusForBook = (book: MateBookItem) => {
    setFocusUserBookId(Number(book.id));
    setFocusModalOpen(true);
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white min-[431px]:max-w-none min-[431px]:bg-[#fdfdff]">
      <div className="shrink-0">
        <WebGnb active={activeTab} onChange={setActiveTab} />
      </div>

      {/* 스크롤은 헤더 아래에서만 */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-[97px] min-[431px]:pb-0">
        {/* —— 모바일 헤더 —— */}
        <header className="flex items-center gap-3 px-5 pt-5 min-[431px]:hidden">
          <h1 className="min-w-0 flex-1 text-h2 text-gray-900">
            이번 주 독서 기록
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            <button type="button" aria-label="배지" className="size-6">
              <img
                src={iconBadge}
                alt=""
                className="size-full object-contain"
              />
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
            {weekDays.map((item) => (
              <div
                key={item.fullDate}
                className="flex h-10 flex-1 items-center justify-center"
              >
                <span className="text-body2 text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center rounded-b-[11px] bg-white px-2 pb-2">
            {weekDays.map((item) => {
              const selected = item.fullDate === todayDate;
              const disabled = item.status !== "today";

              return (
                <button
                  key={item.fullDate}
                  type="button"
                  disabled={disabled}
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
                  {selected && (
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
            {weekWeb.map((item) => {
              const selected = item.fullDate === todayDate;
              const disabled = item.status !== "today";
              const faded = item.status === "past";

              return (
                <button
                  key={`${item.day}-${item.fullDate}`}
                  type="button"
                  disabled={disabled}
                  className={`flex flex-col items-center gap-3 ${
                    faded ? "opacity-75" : ""
                  } ${disabled ? "cursor-default" : "cursor-pointer"}`}
                  aria-pressed={selected}
                  aria-disabled={disabled}
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
                    {WEB_DAY_LABEL[item.day]}
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

        {loading ? (
          <p className="mt-20 text-center text-body2 text-gray-400">
            불러오는 중…
          </p>
        ) : showEmpty ? (
          <MateEmptySection onCta={handleEmptyCta} />
        ) : showCarousel ? (
          <MateBookSection
            books={mateBooks}
            canPick={canPick}
            pinLimit={pinLimit}
            onStartFocus={openFocusForBook}
            onPickBooks={() => setPickSheetOpen(true)}
          />
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)] min-[431px]:hidden">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>

      <FocusTimeModal
        open={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        onSelect={(minutes) => {
          if (focusUserBookId == null) {
            alert("집중할 책을 먼저 선택해 주세요.");
            return;
          }
          clearFocusTimerSession();
          setTimerSessionId(undefined);
          setTimerInitialRemaining(undefined);
          setTimerInitialPaused(undefined);
          setTimerMinutes(minutes as TargetMinutes);
          setTimerStartKey((key) => key + 1);
          setTimerOpen(true);
        }}
      />

      <FocusTimerPopup
        open={timerOpen}
        minutes={timerMinutes}
        userBookId={focusUserBookId ?? undefined}
        sessionId={timerSessionId}
        initialRemaining={timerInitialRemaining}
        initialPaused={timerInitialPaused}
        startKey={timerStartKey}
        onClose={closeTimer}
        onComplete={() => {
          setTimerOpen(false);
          setTimerSessionId(undefined);
          setTimerInitialRemaining(undefined);
          setTimerInitialPaused(undefined);
          navigate("/mate/goal", { replace: true });
        }}
      />

      <PickMateBookSheet
        open={pickSheetOpen}
        books={libraryBooks}
        selectedMateIds={selectedMateIds}
        pinLimit={pinLimit}
        onClose={() => setPickSheetOpen(false)}
        onConfirm={handlePickConfirm}
      />
    </main>
  );
}
