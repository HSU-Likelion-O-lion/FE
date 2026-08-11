import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MOCK_LIBRARY_REASONS, REASON_GOAL } from "../data/libraryMock";
import iconBack from "../assets/library/icon-back.svg";
import iconCheckSelected from "../assets/library/icon-check-selected.svg";
import iconTip from "../assets/library/icon-tip.svg";
import publishOwl from "../assets/library/publish-owl.png";
import loadingRing from "../assets/drawer/diagnosis/loading-ring.png";
import reasonsEllipse from "../assets/library/reasons-ellipse.svg";

const LOADING_MS = 2800;

/** 사유 선택 모드 (Figma 530:3197, 543:2387) + AI 출판 로딩 (543:2527) */
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

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => {
      navigate("/library/essay", { replace: true });
    }, LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [isLoading, navigate]);

  if (!isComplete) {
    return <Navigate to="/library/reasons" replace />;
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
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
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
            비슷한 감정(예: 불안, 위로)의 사유들을 모아 엮으면 더욱 몰입감 있는
            일관된 에세이가 완성됩니다!
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
        {reasons.map((reason) => {
          const selected = selectedIds.has(reason.id);
          return (
            <li key={reason.id}>
              <button
                type="button"
                aria-pressed={selected}
                disabled={isLoading}
                onClick={() => toggleReason(reason.id)}
                className={`relative flex w-full items-center gap-5 rounded-xl px-5 py-3 text-left transition-colors disabled:opacity-90 ${
                  selected
                    ? "bg-primary-10 shadow-[0_0_3px_#5d6bc4]"
                    : "bg-[#fdfdff] shadow-[0_0_2px_rgba(29,29,32,0.11)]"
                }`}
              >
                <div className="min-w-0 flex-1 pr-8">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="text-[15px] font-medium tracking-[-0.025em] text-gray-900">
                      {reason.bookTitle}
                    </p>
                    <span
                      aria-hidden
                      className="size-1 shrink-0 rounded-full bg-gray-300"
                    />
                    <p className="text-caption text-gray-300">
                      {reason.dateLabel}
                    </p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
                    {reason.excerpt}
                  </p>
                </div>
                {selected && (
                  <img
                    src={iconCheckSelected}
                    alt=""
                    aria-hidden
                    className="absolute right-5 top-1/2 size-6 -translate-y-1/2 object-contain"
                  />
                )}
              </button>
            </li>
          );
        })}
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

      {isLoading ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40 mx-auto max-w-[430px] bg-[rgba(58,61,77,0.78)]"
          />
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col items-center justify-center px-6"
          >
            <div className="relative flex size-[239px] items-center justify-center">
              <img
                src={loadingRing}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full animate-spin object-contain [animation-direction:reverse] [animation-duration:3s]"
              />
              <img
                src={publishOwl}
                alt=""
                className="relative mt-6 h-[83px] w-[155px] object-contain object-bottom opacity-[0.93]"
              />
            </div>
            <p className="mt-2 text-center text-[20px] font-bold leading-7 text-white">
              다미가 사유의 조각들을 엮고 있어요.
            </p>
            <p className="mt-2 text-center text-body2 text-gray-200">
              흩어진 메모들이 한 편의 에세이로 탄생합니다...
            </p>
          </div>
        </>
      ) : null}
    </main>
  );
}
