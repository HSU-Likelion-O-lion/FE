import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import WebGnb from "../components/WebGnb";
import LibraryBookshelfPanel from "../components/library/LibraryBookshelfPanel";
import LibraryProgressCard from "../components/library/LibraryProgressCard";
import LibrarySectionToggle, {
  type LibrarySection,
} from "../components/library/LibrarySectionToggle";
import {
  getBookshelf,
  getMe,
  getReadingStatistics,
  getReflections,
  getStreaks,
  countStreakDays,
  formatReflectionDate,
  mapBookItemToLibraryBook,
  sumFocusedMinutes,
} from "../api";
import {
  REASON_GOAL,
  type LibraryReason,
  type LibraryShelfBook,
  type LibraryStats,
} from "../data/library";
import glowEllipse from "../assets/library/glow-ellipse.svg";
import iconDot from "../assets/library/icon-dot.svg";
import iconMegaphone from "../assets/library/icon-megaphone.svg";

function parseSection(raw: string | null): LibrarySection {
  return raw === "growth" ? "growth" : "reasons";
}

const EMPTY_STATS: LibraryStats = {
  userName: "",
  finishedCount: 0,
  totalHours: 0,
  totalMinutes: 0,
  streakDays: 0,
};

/** 서재 홈 — 나의 사유록 / 독서 성장 기록 (모바일 + 웹 Figma 715:5878, 716:6404, 716:6207) */
export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<NavTab>("library");
  const section = parseSection(searchParams.get("section"));
  const setSection = (next: LibrarySection) => {
    setSearchParams(next === "reasons" ? {} : { section: next }, {
      replace: true,
    });
  };

  const [reasons, setReasons] = useState<LibraryReason[]>([]);
  const [stats, setStats] = useState<LibraryStats>(EMPTY_STATS);
  const [shelfBooks, setShelfBooks] = useState<LibraryShelfBook[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [me, shelf, reflections, readingStats, streaks] =
          await Promise.all([
            getMe(),
            getBookshelf(),
            getReflections(),
            getReadingStatistics(),
            getStreaks(),
          ]);
        if (cancelled) return;

        const books = shelf.books.map((item) =>
          mapBookItemToLibraryBook(item),
        );
        const finishedCount = shelf.books.filter(
          (b) => b.status === "DONE",
        ).length;
        const focused = sumFocusedMinutes(readingStats);
        const totalHours = Math.floor(focused / 60);
        const totalMinutes = focused % 60;

        setShelfBooks(books);
        setReasons(
          reflections.reflections.map((r) => ({
            id: String(r.reflectionId),
            dateLabel: formatReflectionDate(r.createdAt),
            excerpt: r.content,
          })),
        );
        setStats({
          userName: me.nickname,
          finishedCount,
          totalHours,
          totalMinutes,
          streakDays: countStreakDays(streaks.week),
        });
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        alert(
          err instanceof Error
            ? err.message
            : "서재 정보를 불러오지 못했습니다.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const shelfPreview = useMemo(
    () => shelfBooks.filter((b) => b.status === "finished").slice(0, 3),
    [shelfBooks],
  );
  const shelfGrid = useMemo(() => shelfBooks.slice(0, 9), [shelfBooks]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none min-[431px]:overflow-visible">
      {/* —— Mobile —— */}
      <div className="flex min-h-dvh flex-col min-[431px]:hidden">
        <header className="relative z-20 shrink-0 bg-[#fdfdff] pt-[calc(24px+env(safe-area-inset-top))]">
          <div className="flex h-[34px] items-center px-5">
            <h1 className="text-h2 text-gray-900">나만의 서재</h1>
          </div>

          <div className="relative mt-2 flex h-12 items-end justify-between border-b-2 border-gray-100 px-5 shadow-[0_4px_8.1px_rgba(38,39,43,0.04)]">
            <button
              type="button"
              onClick={() => setSection("reasons")}
              className={`flex h-11 items-center justify-center px-[50px] text-[16px] tracking-[-0.025em] ${
                section === "reasons"
                  ? "-mb-[2px] border-b-2 border-primary-500 font-medium text-gray-800"
                  : "text-gray-500"
              }`}
            >
              나의 사유록
            </button>
            <button
              type="button"
              onClick={() => setSection("growth")}
              className={`flex h-11 items-center justify-center px-[42px] text-[16px] tracking-[-0.025em] ${
                section === "growth"
                  ? "-mb-[2px] border-b-2 border-primary-500 font-medium text-gray-800"
                  : "text-gray-500"
              }`}
            >
              독서 성장 기록
            </button>
          </div>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-[calc(88px+env(safe-area-inset-bottom))]">
          {section === "reasons" ? (
            <ReasonsSection
              reasons={reasons}
              onGoMate={() => navigate("/mate")}
              onViewAll={() => navigate("/library/reasons")}
              onReasonClick={(reason) =>
                navigate("/shelter/thoughts/mine", {
                  state: {
                    title: reason.bookTitle,
                    bookId: reason.id,
                    body: reason.excerpt,
                    date: reason.dateLabel,
                    authorName: stats.userName || "나",
                  },
                })
              }
              onNextStep={() => {
                if (reasons.length >= REASON_GOAL) {
                  navigate("/library/reasons/select");
                }
              }}
            />
          ) : (
            <GrowthSection
              stats={stats}
              shelfCount={shelfBooks.length}
              shelfPreview={shelfPreview}
              onViewAll={() => navigate("/library/bookshelf")}
            />
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
          <NavigationBar active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* —— Web (Figma 715:5878 / 716:6404 / 716:6207) —— */}
      <div className="hidden h-dvh flex-col min-[431px]:flex">
        <WebGnb active="library" onChange={setActiveTab} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-10 pb-16 pt-8 min-[1024px]:px-[160px]">
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-[40px] font-semibold leading-10 tracking-[-0.025em] text-gray-900">
                나만의 서재
              </h1>
              <LibrarySectionToggle value={section} onChange={setSection} />
            </div>

            {section === "reasons" ? (
              reasons.length === 0 ? (
                <ReasonsEmptyWeb onGoMate={() => navigate("/mate")} />
              ) : (
                <ReasonsWeb
                  reasons={reasons}
                  onNextStep={() => {
                    if (reasons.length >= REASON_GOAL) {
                      navigate("/library/reasons/select");
                    }
                  }}
                  onReasonClick={(reason) =>
                    navigate("/shelter/thoughts/mine", {
                      state: {
                        title: reason.bookTitle,
                        bookId: reason.id,
                        body: reason.excerpt,
                        date: reason.dateLabel,
                        authorName: stats.userName || "나",
                      },
                    })
                  }
                />
              )
            ) : (
              <GrowthWeb
                stats={stats}
                shelfCount={shelfBooks.length}
                shelfGrid={shelfGrid}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ReasonsEmptyWeb({ onGoMate }: { onGoMate: () => void }) {
  return (
    <div className="flex flex-col items-center px-5 pt-[120px]">
      <div className="relative flex w-full max-w-[310px] flex-col items-center">
        <div className="h-[249px] w-[167px] rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[2px] border-2 border-dashed border-gray-200 bg-[#f5f6fa]" />
        <div className="relative -mt-px h-[34px] w-[310px]">
          <div className="absolute inset-x-0 bottom-0 h-[18px] bg-[#fdfdff] shadow-[0_0_4.8px_rgba(19,19,20,0.14)]">
            <div className="absolute inset-0 shadow-[inset_0_-3.6px_4.8px_rgba(27,27,29,0.12)]" />
          </div>
          <div className="absolute inset-x-[7px] bottom-[18px] h-[33px] rounded-t-[8.4px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2.4px]" />
        </div>
      </div>
      <p className="mt-6 text-center text-[21px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-800">
        아직 남겨진 사유가 없습니다.
      </p>
      <p className="mt-2 text-center text-[17px] leading-6 text-gray-400">
        30개의 사유가 모이면 에세이로 출판됩니다.
        <br />
        타이머를 완료하고 첫 글을 써볼까요?
      </p>
      <button
        type="button"
        onClick={onGoMate}
        className="mt-6 rounded-[30px] bg-[#fdfdff] px-6 py-3.5 text-[19.2px] font-medium tracking-[-0.025em] text-gray-800 shadow-[0_0_2.4px_rgba(169,173,190,0.57)]"
      >
        메이트로 가기
      </button>
    </div>
  );
}

function ReasonsWeb({
  reasons,
  onNextStep,
  onReasonClick,
}: {
  reasons: LibraryReason[];
  onNextStep: () => void;
  onReasonClick: (reason: LibraryReason) => void;
}) {
  const remaining = Math.max(0, REASON_GOAL - reasons.length);
  const percent = Math.min(
    100,
    Math.round((reasons.length / REASON_GOAL) * 100),
  );

  return (
    <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
      <div className="mx-auto w-full max-w-[521px] shrink-0 lg:sticky lg:top-8 lg:mx-0 lg:self-start">
        <LibraryProgressCard
          size="web"
          remaining={remaining}
          percent={percent}
          onNextStep={onNextStep}
        />
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-[23px] text-[#42403a]">출판까지 {remaining}개</p>
          <span className="flex h-[49px] items-center rounded-[24px] bg-primary-10 px-[18px] text-[20px] font-medium tracking-[-0.025em] text-primary-500">
            {reasons.length} / {REASON_GOAL}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[547px] flex-col lg:mx-0">
        <p className="text-[23px] text-[#42403a]">
          모든 사유 기록{" "}
          <span className="font-semibold text-primary-400">
            {reasons.length}
          </span>
        </p>

        <div className="mt-4 flex items-center gap-4 rounded-[20px] bg-primary-10/80 px-8 py-3.5">
          <img
            src={iconMegaphone}
            alt=""
            className="size-10 shrink-0 object-contain"
          />
          <p className="text-[20px] leading-[1.6] tracking-[-0.025em] text-primary-700">
            비슷한 감정(예: 불안, 위로)의 사유들을 모아 엮으면 더욱 몰입감 있는
            일관된 에세이가 완성됩니다!
          </p>
        </div>

        <ul className="mt-6 flex flex-col gap-6 pb-8">
          {reasons.map((reason) => (
            <li key={reason.id}>
              <button
                type="button"
                onClick={() => onReasonClick(reason)}
                className="w-full rounded-[17px] bg-[#fdfdff] px-8 py-3.5 text-left shadow-[0_0_2.88px_rgba(29,29,32,0.11)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {reason.bookTitle ? (
                    <p className="text-[21.6px] font-medium tracking-[-0.025em] text-gray-900">
                      {reason.bookTitle}
                    </p>
                  ) : null}
                  {reason.bookTitle ? (
                    <img
                      src={iconDot}
                      alt=""
                      className="size-1.5 object-contain"
                    />
                  ) : null}
                  <p className="text-[17.3px] tracking-[-0.025em] text-gray-300">
                    {reason.dateLabel}
                  </p>
                </div>
                <p className="mt-2 line-clamp-2 text-[18.7px] leading-[33px] tracking-[-0.025em] text-gray-500">
                  {reason.excerpt}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GrowthWeb({
  stats,
  shelfCount,
  shelfGrid,
}: {
  stats: LibraryStats;
  shelfCount: number;
  shelfGrid: { id: string; coverUrl: string; title: string }[];
}) {
  const rows = [0, 1, 2].map((row) => shelfGrid.slice(row * 3, row * 3 + 3));

  return (
    <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
      <div className="relative mx-auto w-full max-w-[519px] shrink-0 lg:mx-0">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-40px] z-0 h-[580px] w-[597px] -translate-x-1/2 opacity-80"
        >
          <img
            src={glowEllipse}
            alt=""
            className="absolute inset-0 size-full max-w-none"
          />
        </div>

        <div className="relative z-10">
          <p className="text-[34px] font-medium leading-[1.5] tracking-[-0.025em] text-gray-700">
            {stats.userName || "회원"}님, 오늘도
            <br />
            멋진 기록을 남겨봐요!
          </p>

          <div className="mt-5">
            <GrowthStatDial stats={stats} size="web" />
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-[14px] bg-[#fdfdff] p-6 shadow-[0_0_4.3px_rgba(29,29,32,0.1)]">
            <div className="min-w-0 flex-1">
              <p className="text-[22px] font-medium tracking-[-0.025em] text-gray-900">
                연속 독서 기록
              </p>
              <p className="mt-1 text-[16px] leading-[28px] tracking-[-0.025em] text-gray-500">
                나의 배지 컬렉션 (일주일 연속 달성 등)
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[34px] font-semibold tracking-[-0.025em] text-gray-800">
                {stats.streakDays}
              </span>
              <span className="ml-0.5 text-[14px] text-gray-500">일</span>
            </div>
          </div>

          <p className="mt-8 text-[21px] text-[#42403a]">
            내 책장{" "}
            <span className="font-semibold text-primary-400">
              총 {shelfCount}권
            </span>
          </p>

          <div className="mt-3 flex flex-col gap-6">
            {rows.map((rowBooks, rowIdx) => (
              <ShelfRow key={rowIdx} books={rowBooks} />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[539px] lg:mx-0">
        <div className="mb-2 flex h-11 items-center">
          <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-gray-900">
            내 책장
          </h2>
        </div>
        <LibraryBookshelfPanel />
      </div>
    </div>
  );
}

function ShelfRow({
  books,
}: {
  books: { id: string; coverUrl: string; title: string }[];
}) {
  return (
    <div className="relative mx-auto h-[176px] w-full max-w-[466px]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-end justify-center gap-3 px-2">
        {books.map((book) => (
          <img
            key={book.id}
            src={book.coverUrl}
            alt={book.title}
            className="h-[164px] w-[104px] rounded-tr-[5px] rounded-bl-[5px] object-cover opacity-80 shadow-[3px_3px_4px_rgba(99,75,4,0.2)]"
          />
        ))}
      </div>
      <div
        aria-hidden
        className="absolute bottom-[13px] left-1/2 z-20 h-[29px] w-[451px] max-w-[96%] -translate-x-1/2 rounded-t-[9px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2.6px]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-20 h-[13px] bg-[#fdfdff] shadow-[0_0_5px_rgba(19,19,20,0.14)]"
      >
        <div className="absolute inset-0 shadow-[inset_0_-4px_5px_rgba(27,27,29,0.12)]" />
      </div>
    </div>
  );
}

function ReasonsSection({
  reasons,
  onGoMate,
  onViewAll,
  onReasonClick,
  onNextStep,
}: {
  reasons: LibraryReason[];
  onGoMate: () => void;
  onViewAll: () => void;
  onReasonClick: (reason: LibraryReason) => void;
  onNextStep: () => void;
}) {
  if (reasons.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 pt-[98px]">
        <div className="relative flex w-full max-w-[259px] flex-col items-center">
          <div className="h-[208px] w-[140px] rounded-tl-[2px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[2px] border-2 border-dashed border-gray-200 bg-[#f5f6fa]" />
          <div className="relative -mt-px h-[28px] w-[247px]">
            <div className="absolute inset-x-0 bottom-0 h-[15px] bg-[#fdfdff] shadow-[0_0_4px_rgba(19,19,20,0.14)]" />
            <div className="absolute inset-x-[6px] bottom-[15px] h-[28px] rounded-t-[7px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2px]" />
            <div className="absolute inset-0 shadow-[inset_0_-3px_4px_rgba(27,27,29,0.12)]" />
          </div>
        </div>
        <p className="mt-8 text-center text-h3 text-gray-800">
          아직 남겨진 사유가 없습니다
        </p>
        <p className="mt-2 text-center text-body2 text-gray-400">
          30개의 사유가 모이면 에세이로 출판됩니다.
          <br />
          타이머를 완료하고 첫 글을 써볼까요?
        </p>
        <button
          type="button"
          onClick={onGoMate}
          className="mt-8 rounded-[25px] bg-[#fdfdff] px-5 py-3 text-button1 text-gray-800 shadow-[0_0_2px_rgba(169,173,190,0.57)]"
        >
          메이트로 가기
        </button>
      </div>
    );
  }

  const remaining = Math.max(0, REASON_GOAL - reasons.length);
  const percent = Math.min(
    100,
    Math.round((reasons.length / REASON_GOAL) * 100),
  );

  return (
    <div className="flex flex-col px-5 pt-5">
      <LibraryProgressCard
        size="mobile"
        remaining={remaining}
        percent={percent}
        onNextStep={onNextStep}
      />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[16px] text-[#42403a]">
          전체 사유 기록{" "}
          <span className="font-semibold text-primary-400">
            {reasons.length}
          </span>
        </p>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-[17px] bg-primary-10 px-[13px] py-1.5 text-[14px] tracking-[-0.025em] text-primary-500"
        >
          모두보기
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-3 pb-8">
        {reasons.slice(0, 2).map((reason) => (
          <li key={reason.id}>
            <button
              type="button"
              onClick={() => onReasonClick(reason)}
              className="w-full rounded-xl bg-[#fdfdff] px-5 py-3 text-left shadow-[0_0_2px_rgba(29,29,32,0.11)]"
            >
              <div className="flex items-baseline gap-2">
                {reason.bookTitle ? (
                  <p className="text-[15px] tracking-[-0.025em] text-gray-900">
                    {reason.bookTitle}
                  </p>
                ) : null}
                <p className="text-caption text-gray-300">{reason.dateLabel}</p>
              </div>
              <p className="mt-1 line-clamp-1 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
                {reason.excerpt}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type GrowthMetric = "books" | "hours";

/** 독서 성장 통계 다이얼 — Figma 547:3124 / 1041:6301 */
function GrowthStatDial({
  stats,
  size = "mobile",
}: {
  stats: LibraryStats;
  size?: "mobile" | "web";
}) {
  const [active, setActive] = useState<GrowthMetric>("books");
  const isWeb = size === "web";

  const booksDigits = String(stats.finishedCount).padStart(2, "0");
  const hoursDigits = String(stats.totalHours).padStart(2, "0");
  const booksActive = active === "books";

  const dialH = isWeb ? 46 : 38;
  const numClass = isWeb
    ? "text-[48px] font-bold leading-12 tracking-[-0.025em] transition-colors duration-500"
    : "text-[40px] font-bold leading-10 tracking-[-0.025em] transition-colors duration-500";
  const sepClass = isWeb
    ? "text-[36px] font-thin leading-12 text-[#fdfdff]"
    : "text-[30px] font-thin leading-10 text-[#fdfdff]";
  const activeLabel = isWeb
    ? "text-[17px] font-semibold leading-[22px] tracking-[-0.025em] text-gray-700"
    : "text-[14px] font-semibold leading-[18px] tracking-[-0.025em] text-gray-700";
  const inactiveLabel = isWeb
    ? "text-[14px] leading-[22px] tracking-[-0.025em] text-[#868aa0]"
    : "text-[12px] leading-[18px] tracking-[-0.025em] text-[#868aa0]";

  return (
    <div
      className={`flex items-center ${
        isWeb ? "gap-7 px-6 py-3" : "gap-6 px-5 py-2.5"
      }`}
    >
      <div className="relative flex shrink-0 items-center">
        <button
          type="button"
          aria-pressed={booksActive}
          aria-label={`지금까지 완독한 책 ${stats.finishedCount}권`}
          onClick={() => setActive("books")}
          className={`${numClass} ${
            booksActive ? "text-gray-900" : "text-gray-300"
          }`}
        >
          {booksDigits}
        </button>
        <span aria-hidden className={`mx-1 ${sepClass}`}>
          ㅣ
        </span>
        <button
          type="button"
          aria-pressed={!booksActive}
          aria-label={`누적 독서 시간 ${stats.totalHours}시간`}
          onClick={() => setActive("hours")}
          className={`${numClass} ${
            booksActive ? "text-gray-300" : "text-gray-900"
          }`}
        >
          {hoursDigits}
        </button>
      </div>

      <div
        className="relative min-w-0 overflow-hidden"
        style={{ height: dialH }}
      >
        <div
          className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `translateY(${booksActive ? 0 : -dialH}px)`,
          }}
        >
          <div
            className="flex flex-col justify-between"
            style={{ height: dialH }}
          >
            <p className={activeLabel}>
              지금까지 완독한 책 ㅣ {stats.finishedCount}권
            </p>
            <p className={inactiveLabel}>누적 독서 시간</p>
          </div>
          <div
            className="flex flex-col justify-between"
            style={{ height: dialH }}
          >
            <p className={activeLabel}>
              누적 독서 시간 ㅣ {stats.totalHours}시간
            </p>
            <p className={inactiveLabel}>
              지금까지 완독한 책 ㅣ {stats.finishedCount}권
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthSection({
  stats,
  shelfCount,
  shelfPreview,
  onViewAll,
}: {
  stats: LibraryStats;
  shelfCount: number;
  shelfPreview: { id: string; coverUrl: string; title: string }[];
  onViewAll: () => void;
}) {
  return (
    <div className="relative flex flex-col px-5 pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-20px] z-0 h-[580px] w-[597px] -translate-x-1/2"
      >
        <img
          src={glowEllipse}
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </div>

      <div className="relative z-10">
        <p className="text-[28px] font-medium leading-[1.5] tracking-[-0.025em] text-gray-700">
          {stats.userName || "회원"}님, 오늘도
          <br />
          멋진 기록을 남겨봐요!
        </p>

        <div className="mt-[18px]">
          <GrowthStatDial stats={stats} size="mobile" />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#fdfdff] p-5 shadow-[0_0_3.6px_rgba(29,29,32,0.1)]">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-medium tracking-[-0.025em] text-gray-900">
              연속 독서 기록
            </p>
            <p className="mt-1 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
              나의 배지 컬렉션 (일주일 연속 달성 등)
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[28px] font-semibold tracking-[-0.025em] text-gray-800">
              {stats.streakDays}
            </span>
            <span className="ml-0.5 text-caption text-gray-500">일</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[16px] text-[#42403a]">
            내 책장{" "}
            <span className="font-semibold text-primary-400">
              총 {shelfCount}권
            </span>
          </p>
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-[17px] bg-primary-50 px-[13px] py-1.5 text-[14px] tracking-[-0.025em] text-primary-600"
          >
            모두 보기
          </button>
        </div>

        <div className="relative mx-auto mt-4 w-full max-w-[353px] pb-10">
          <div className="relative h-[134px] w-full">
            <div className="absolute inset-x-0 top-0 z-10 flex items-end justify-center gap-2 px-2">
              {shelfPreview.map((book) => (
                <img
                  key={book.id}
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-[124px] w-[79px] rounded-tr-[4px] rounded-bl-[4px] object-cover opacity-90 shadow-[3px_3px_4px_rgba(99,75,4,0.2)]"
                />
              ))}
            </div>
            <div
              aria-hidden
              className="absolute bottom-[10px] left-1/2 z-20 h-[22px] w-[342px] -translate-x-1/2 rounded-t-[7px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2px]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 z-20 h-2.5 bg-[#fdfdff] shadow-[0_0_4px_rgba(19,19,20,0.14)]"
            >
              <div className="absolute inset-0 shadow-[inset_0_-3px_4px_rgba(27,27,29,0.12)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
