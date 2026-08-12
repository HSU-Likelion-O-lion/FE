import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import WebGnb from "../components/WebGnb";
import LibraryProgressCard from "../components/library/LibraryProgressCard";
import LibrarySectionToggle from "../components/library/LibrarySectionToggle";
import {
  MOCK_LIBRARY_REASONS,
  REASON_GOAL,
  type LibraryReason,
} from "../data/libraryMock";
import iconBack from "../assets/library/icon-back.svg";
import iconCheckSelected from "../assets/library/icon-check-selected.svg";
import iconCheckWeb from "../assets/library/icon-check-web.svg";
import iconDot from "../assets/library/icon-dot.svg";
import iconMegaphone from "../assets/library/icon-megaphone.svg";
import iconTip from "../assets/library/icon-tip.svg";
import publishOwl from "../assets/library/publish-owl.png";
import loadingRing from "../assets/drawer/diagnosis/loading-ring.png";
import reasonsEllipse from "../assets/library/reasons-ellipse.svg";

const LOADING_MS = 2800;

/** 사유 선택 모드 (모바일 Figma 530:3197 + 웹 716:6585) */
export default function LibraryReasonSelectPage() {
  const navigate = useNavigate();
  const reasons = MOCK_LIBRARY_REASONS;
  const isComplete = reasons.length >= REASON_GOAL;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = reasons.length > 0 && selectedCount === reasons.length;
  const canProceed = selectedCount >= REASON_GOAL;
  const selectedLabel = `${selectedCount}/${reasons.length}`;
  const remaining = Math.max(0, REASON_GOAL - reasons.length);
  const percent = Math.min(
    100,
    Math.round((reasons.length / REASON_GOAL) * 100),
  );

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => {
      navigate("/library/essay", { replace: true });
    }, LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [isLoading, navigate]);

  if (!isComplete) {
    return <Navigate to="/library" replace />;
  }

  const toggleReason = (id: string) => {
    if (isLoading) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isLoading) return;
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(reasons.map((r) => r.id)));
  };

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#e8ebf5",
              backgroundImage: `
              linear-gradient(rgba(93,107,196,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(93,107,196,0.12) 1px, transparent 1px)
            `,
              backgroundSize: "22px 22px",
            }}
          />
          <img
            src={reasonsEllipse}
            alt=""
            className="absolute left-1/2 top-[-320px] z-[1] h-[860px] w-[620px] max-w-none -translate-x-1/2"
          />
        </div>

        <header className="relative z-20 shrink-0 px-5 pt-[calc(20px+env(safe-area-inset-top))]">
          <div className="relative flex h-11 w-full items-center justify-center">
            <button
              type="button"
              aria-label="뒤로가기"
              disabled={isLoading}
              onClick={() => navigate("/library")}
              className="absolute left-0 flex size-6 items-center justify-center disabled:opacity-40"
            >
              <img
                src={iconBack}
                alt=""
                className="size-6 object-contain brightness-0 invert"
              />
            </button>
            <h1 className="text-h3 text-[#fdfdff]">모든 사유 기록</h1>
          </div>
        </header>

        <div className="relative z-10 shrink-0 px-5 pt-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-[rgba(253,253,255,0.71)] px-5 py-2 opacity-80">
            <img
              src={iconTip}
              alt=""
              className="size-6 shrink-0 object-contain"
            />
            <p className="text-caption text-[#384076]">
              비슷한 감정(예: 불안, 위로)의 사유들을 모아 엮으면 더욱 몰입감
              있는 일관된 에세이가 완성됩니다!
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[16px] text-[#42403a]">
              선택된 사유{" "}
              <span className="font-semibold text-primary-400">
                {selectedLabel}
              </span>
            </p>
            <button
              type="button"
              disabled={isLoading}
              onClick={toggleSelectAll}
              className="rounded-[17px] bg-primary-50 px-[13px] py-1.5 text-[14px] tracking-[-0.025em] text-primary-600 disabled:opacity-50"
            >
              전체선택
            </button>
          </div>
        </div>

        <ul className="relative z-10 mt-4 flex min-h-0 flex-1 list-none flex-col gap-4 overflow-y-auto px-5 pb-[calc(90px+env(safe-area-inset-bottom))]">
          {reasons.map((reason) => (
            <ReasonSelectItem
              key={reason.id}
              reason={reason}
              selected={selectedIds.has(reason.id)}
              disabled={isLoading}
              size="mobile"
              onToggle={() => toggleReason(reason.id)}
            />
          ))}
        </ul>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto h-[120px] w-full max-w-[430px] bg-gradient-to-t from-[#fdfdff] from-[75%] to-transparent" />
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            disabled={!canProceed || isLoading}
            onClick={() => setIsLoading(true)}
            className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 font-semibold ${
              canProceed && !isLoading
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            다음 단계로 이동
          </button>
        </div>

        {isLoading ? <LoadingOverlay variant="mobile" /> : null}
      </main>

      {/* —— Web (Figma 716:6585) —— */}
      <main className="relative hidden h-dvh w-full flex-col bg-[#fdfdff] min-[431px]:flex">
        <WebGnb active="library" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-10 pb-28 pt-8 min-[1024px]:px-[160px]">
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-[40px] font-semibold leading-10 tracking-[-0.025em] text-gray-900">
                나만의 서재
              </h1>
              <LibrarySectionToggle
                value="reasons"
                onChange={(next) => {
                  if (next === "growth") {
                    navigate("/library?section=growth");
                  }
                }}
              />
            </div>

            <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
              <div className="mx-auto w-full max-w-[521px] shrink-0 lg:sticky lg:top-8 lg:mx-0 lg:self-start">
                <LibraryProgressCard
                  size="web"
                  remaining={remaining}
                  percent={percent}
                  showNext
                  onNextStep={() => undefined}
                />
                <div className="mt-4 flex items-center justify-between px-2">
                  <p className="text-[23px] text-[#42403a]">
                    출판까지 {remaining}개
                  </p>
                  <span className="flex h-[49px] items-center rounded-[24px] bg-primary-10 px-[18px] text-[20px] font-medium tracking-[-0.025em] text-primary-500">
                    {reasons.length} / {REASON_GOAL}
                  </span>
                </div>
              </div>

              <div className="relative mx-auto flex w-full max-w-[547px] flex-col lg:mx-0">
                <div className="flex items-center justify-between">
                  <p className="text-[23px] text-[#42403a]">
                    선택된 사유{" "}
                    <span className="font-semibold text-primary-400">
                      {selectedCount}
                    </span>
                  </p>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={toggleSelectAll}
                    className="flex h-11 items-center justify-center rounded-[22px] bg-primary-10 px-[17px] text-[18px] tracking-[-0.025em] text-primary-600 disabled:opacity-50"
                  >
                    전체선택
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4 rounded-[20px] bg-primary-10/80 px-8 py-3.5">
                  <img
                    src={iconMegaphone}
                    alt=""
                    className="size-10 shrink-0 object-contain"
                  />
                  <p className="text-[20px] leading-[1.6] tracking-[-0.025em] text-primary-700">
                    비슷한 감정(예: 불안, 위로)의 사유들을 모아 엮으면 더욱
                    몰입감 있는 일관된 에세이가 완성됩니다!
                  </p>
                </div>

                <ul className="mt-6 flex flex-col gap-6 pb-[120px]">
                  {reasons.map((reason) => (
                    <ReasonSelectItem
                      key={reason.id}
                      reason={reason}
                      selected={selectedIds.has(reason.id)}
                      disabled={isLoading}
                      size="web"
                      onToggle={() => toggleReason(reason.id)}
                    />
                  ))}
                </ul>

                {/* Figma 718:7039 — 우측 컬럼 하단, 465×71 */}
                <div className="pointer-events-none sticky bottom-0 z-20 -mb-8 bg-gradient-to-t from-[#fdfdff] from-[55%] via-[#fdfdff]/90 to-transparent pt-10">
                  <div className="pointer-events-auto flex justify-center px-[26px] py-[13px]">
                    <button
                      type="button"
                      disabled={!canProceed || isLoading}
                      onClick={() => setIsLoading(true)}
                      className={`flex h-[71px] w-full max-w-[465px] items-center justify-center rounded-[21px] text-[21px] font-semibold leading-[1.6] tracking-[-0.025em] ${
                        canProceed && !isLoading
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      다음 단계로 이동
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? <LoadingOverlay variant="web" /> : null}
      </main>
    </>
  );
}

function ReasonSelectItem({
  reason,
  selected,
  disabled,
  size,
  onToggle,
}: {
  reason: LibraryReason;
  selected: boolean;
  disabled: boolean;
  size: "mobile" | "web";
  onToggle: () => void;
}) {
  const isWeb = size === "web";

  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onToggle}
        className={`relative flex w-full items-center text-left transition-colors disabled:opacity-90 ${
          isWeb
            ? `gap-5 rounded-[18px] px-8 py-[18px] ${
                selected
                  ? "bg-primary-10 shadow-[0_0_3px_#5d6bc4]"
                  : "bg-[#fdfdff] shadow-[0_0_2.88px_rgba(29,29,32,0.11)]"
              }`
            : `gap-5 rounded-xl px-5 py-3 ${
                selected
                  ? "bg-primary-10 shadow-[0_0_3px_#5d6bc4]"
                  : "bg-[#fdfdff] shadow-[0_0_2px_rgba(29,29,32,0.11)]"
              }`
        }`}
      >
        <div className={`min-w-0 flex-1 ${isWeb ? "pr-10" : "pr-8"}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p
              className={
                isWeb
                  ? "text-[21.6px] font-medium tracking-[-0.025em] text-gray-900"
                  : "text-[15px] font-medium tracking-[-0.025em] text-gray-900"
              }
            >
              {reason.bookTitle}
            </p>
            {isWeb ? (
              <img src={iconDot} alt="" className="size-1.5 object-contain" />
            ) : (
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-gray-300"
              />
            )}
            <p
              className={
                isWeb
                  ? "text-[17.3px] tracking-[-0.025em] text-gray-300"
                  : "text-caption text-gray-300"
              }
            >
              {reason.dateLabel}
            </p>
          </div>
          <p
            className={
              isWeb
                ? "mt-2 line-clamp-2 text-[18.7px] leading-[33px] tracking-[-0.025em] text-gray-500"
                : "mt-1.5 line-clamp-2 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500"
            }
          >
            {reason.excerpt}
          </p>
        </div>
        {selected ? (
          <img
            src={isWeb ? iconCheckWeb : iconCheckSelected}
            alt=""
            aria-hidden
            className={`absolute top-1/2 -translate-y-1/2 object-contain ${
              isWeb ? "right-8 size-[30px]" : "right-5 size-6"
            }`}
          />
        ) : null}
      </button>
    </li>
  );
}

function LoadingOverlay({ variant }: { variant: "mobile" | "web" }) {
  const isWeb = variant === "web";

  return (
    <>
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-[rgba(58,61,77,0.78)] ${
          isWeb ? "" : "mx-auto max-w-[430px]"
        }`}
      />
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 ${
          isWeb ? "" : "mx-auto max-w-[430px]"
        }`}
      >
        <div className="relative flex size-[239px] items-center justify-center min-[431px]:size-[320px]">
          <img
            src={loadingRing}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full animate-spin object-contain [animation-direction:reverse] [animation-duration:3s]"
          />
          <img
            src={publishOwl}
            alt=""
            className="relative mt-6 h-[83px] w-[155px] object-contain object-bottom opacity-[0.93] min-[431px]:mt-8 min-[431px]:h-[110px] min-[431px]:w-[206px]"
          />
        </div>
        <p className="mt-2 text-center text-[20px] font-bold leading-7 text-white min-[431px]:mt-4 min-[431px]:text-[28px] min-[431px]:leading-9">
          다미가 사유의 조각들을 엮고 있어요.
        </p>
        <p className="mt-2 text-center text-body2 text-gray-200 min-[431px]:text-[18px]">
          흩어진 메모들이 한 편의 에세이로 탄생합니다...
        </p>
      </div>
    </>
  );
}
