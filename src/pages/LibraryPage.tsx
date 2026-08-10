import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import {
  MOCK_LIBRARY_REASONS,
  MOCK_LIBRARY_STATS,
  MOCK_SHELF_BOOKS,
  REASON_GOAL,
  type LibraryReason,
} from "../data/libraryMock";
import iconChevron from "../assets/library/icon-chevron.svg";
import glowEllipse from "../assets/library/glow-ellipse.svg";
import progressBook from "../assets/library/progress-book.png";
import progressLooper from "../assets/library/progress-looper.svg";
import progressNextArrow from "../assets/library/progress-next-arrow.svg";
import progressNextGlow from "../assets/library/progress-next-glow.svg";
import ornament from "../assets/library/ornament.svg";

/** Ornament 세로 간격 (Figma 좌측 0→138, 우측 91→229) */
const ORNAMENT_STEP = 138;
/** 루프용 복제 장수 — step만큼 이동해도 끊김 없게 */
const ORNAMENT_LOOP_COUNT = 4;

type LibraryTab = "reasons" | "growth";

/** 서재 홈 — 나의 사유록 / 독서 성장 기록 (Figma 486:4127, 518:2871, 547:2892) */
export default function LibraryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("library");
  const [section, setSection] = useState<LibraryTab>("reasons");
  const reasons = MOCK_LIBRARY_REASONS;
  const stats = MOCK_LIBRARY_STATS;
  const shelfPreview = useMemo(
    () => MOCK_SHELF_BOOKS.filter((b) => b.status === "finished").slice(0, 3),
    [],
  );

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <header className="relative z-20 shrink-0 bg-[#fdfdff] pt-[calc(24px+env(safe-area-inset-top))]">
        <div className="flex h-[34px] items-center px-5">
          <h1 className="text-h2 text-gray-900">나만의 서재</h1>
        </div>

        <div className="relative mt-2 flex h-12 items-end justify-between border-b-2 border-gray-100 px-5 shadow-[0_4px_8.1px_rgba(38,39,43,0.04)]">
          {/* Figma: 활성 border = 탭 프레임 너비 (사유록 172 / 성장기록 173) */}
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
            onNextStep={() => {
              if (reasons.length >= REASON_GOAL) {
                navigate("/library/reasons/select");
              }
            }}
          />
        ) : (
          <GrowthSection
            stats={stats}
            shelfCount={MOCK_SHELF_BOOKS.length}
            shelfPreview={shelfPreview}
            onViewAll={() => navigate("/library/bookshelf")}
          />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>
    </main>
  );
}

function ReasonsSection({
  reasons,
  onGoMate,
  onViewAll,
  onNextStep,
}: {
  reasons: LibraryReason[];
  onGoMate: () => void;
  onViewAll: () => void;
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
      <div className="relative h-[338px] w-full overflow-hidden rounded-[50px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #8899ff 31%, rgba(136,180,255,0.6) 100%)",
          }}
        />
        {/* 왼쪽 ornament — 아래로 흘러감 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-[119px] overflow-hidden"
        >
          <div className="absolute left-0 top-[-138px] animate-library-ornament-down">
            {Array.from({ length: ORNAMENT_LOOP_COUNT }, (_, i) => (
              <img
                key={`L-${i}`}
                src={ornament}
                alt=""
                className="absolute left-0 h-[130px] w-[119px] max-w-none object-contain"
                style={{ top: i * ORNAMENT_STEP }}
              />
            ))}
          </div>
        </div>
        {/* 오른쪽 ornament — 위로 흘러감 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[244px] top-0 h-full w-[119px] overflow-hidden"
        >
          <div className="absolute left-0 top-[-47px] animate-library-ornament-up">
            {Array.from({ length: ORNAMENT_LOOP_COUNT }, (_, i) => (
              <img
                key={`R-${i}`}
                src={ornament}
                alt=""
                className="absolute left-0 h-[130px] w-[119px] max-w-none object-contain"
                style={{ top: i * ORNAMENT_STEP }}
              />
            ))}
          </div>
        </div>
        <img
          src={progressLooper}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[7%] top-[4%] h-[91%] w-[85%] animate-library-looper-spin object-contain opacity-90"
        />
        <div className="pointer-events-none absolute left-1/2 top-[12%] h-[68%] w-[62%] -translate-x-1/2 animate-library-book-float">
          <img src={progressBook} alt="" className="size-full object-contain" />
        </div>
        <p className="absolute left-[30px] top-[30px] text-body1 text-white/80">
          출판까지 {remaining}개
        </p>
        <p className="absolute bottom-[30px] left-[30px] text-[60px] leading-[48px] tracking-[-0.025em] text-white">
          {percent}{" "}
          <span className="text-[36px] font-light leading-[48px]">%</span>
        </p>
        {percent >= 100 && (
          <button
            type="button"
            aria-label="다음 단계로 이동"
            onClick={onNextStep}
            className="absolute bottom-[30px] right-[30px] z-10 flex size-[50px] items-center justify-center"
          >
            <img
              src={progressNextGlow}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-[65px] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
            <img
              src={progressNextArrow}
              alt=""
              aria-hidden
              className="relative h-[16px] w-[9px] object-contain"
            />
          </button>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-[50px] shadow-[inset_0_0_6.1px_#fdfdff,inset_0_0_65.4px_#eceeff]" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[16px] text-[#42403a]">
          전체 진단 기록{" "}
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
          <li
            key={reason.id}
            className="rounded-xl bg-[#fdfdff] px-5 py-3 shadow-[0_0_2px_rgba(29,29,32,0.11)]"
          >
            <div className="flex items-baseline gap-2">
              <p className="text-[15px] tracking-[-0.025em] text-gray-900">
                {reason.bookTitle}
              </p>
              <p className="text-caption text-gray-300">{reason.dateLabel}</p>
            </div>
            <p className="mt-1 line-clamp-1 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
              {reason.excerpt}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrowthSection({
  stats,
  shelfCount,
  shelfPreview,
  onViewAll,
}: {
  stats: typeof MOCK_LIBRARY_STATS;
  shelfCount: number;
  shelfPreview: { id: string; coverUrl: string; title: string }[];
  onViewAll: () => void;
}) {
  const hours = String(stats.totalHours).padStart(2, "0");
  const minutes = String(stats.totalMinutes).padStart(2, "0");

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
          {stats.userName}님, 오늘도
          <br />
          멋진 기록을 남겨봐요!
        </p>

        <div className="mt-[18px] flex items-center gap-6 px-5 py-2.5">
          <div className="flex items-center gap-1">
            <span className="text-[40px] font-bold leading-10 tracking-[-0.025em] text-gray-900">
              {hours}
            </span>
            <span className="text-[30px] font-thin leading-10 text-[#fdfdff]">
              ㅣ
            </span>
            <span className="text-[40px] font-bold leading-10 tracking-[-0.025em] text-gray-300">
              {minutes}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-[18px] tracking-[-0.025em] text-gray-700">
              지금까지 완독한 책 ㅣ {stats.finishedCount}권
            </p>
            <p className="mt-0.5 text-caption text-gray-400">누적 독서 시간</p>
          </div>
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
          {/* 책 + 선반: Figma처럼 책 하단과 선반이 겹침 */}
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
            {/* 유리 앞판 — 책 하단과 겹침 */}
            <div
              aria-hidden
              className="absolute bottom-[10px] left-1/2 z-20 h-[22px] w-[342px] -translate-x-1/2 rounded-t-[7px] bg-[rgba(217,217,217,0.43)] backdrop-blur-[2px]"
            />
            {/* 선반 판 */}
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
