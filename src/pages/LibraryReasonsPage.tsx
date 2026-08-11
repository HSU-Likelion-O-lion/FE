import { useNavigate } from "react-router-dom";
import { MOCK_LIBRARY_REASONS, REASON_GOAL } from "../data/libraryMock";
import iconBack from "../assets/library/icon-back.svg";
import iconTip from "../assets/library/icon-tip.svg";
import reasonsEllipse from "../assets/library/reasons-ellipse.svg";

/** 모든 사유 기록 (Figma 543:2669) */
export default function LibraryReasonsPage() {
  const navigate = useNavigate();
  const reasons = MOCK_LIBRARY_REASONS;
  const isComplete = reasons.length >= REASON_GOAL;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
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
        {/*
          Figma Ellipse 2467: 433×614 @ (-20, -230).
          상단 글로우가 화면을 덮도록 Figma 비율 유지한 채 확대 (기존 object-cover bg에 눌려 작아 보임).
        */}
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
            onClick={() => navigate("/library")}
            className="absolute left-0 flex size-6 items-center justify-center"
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

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(110px+env(safe-area-inset-bottom))] pt-4">
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

        <p className="mt-6 text-[16px] text-[#42403a]">
          모든기록{" "}
          <span className="font-semibold text-primary-400">
            {reasons.length}개
          </span>
        </p>

        <ul className="mt-4 flex flex-col gap-4 pb-6">
          {reasons.map((reason) => (
            <li
              key={reason.id}
              className="rounded-xl bg-[#fdfdff] px-5 py-3 shadow-[0_0_2px_rgba(29,29,32,0.11)]"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-[15px] font-medium tracking-[-0.025em] text-gray-900">
                  {reason.bookTitle}
                </p>
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full bg-gray-300"
                />
                <p className="text-caption text-gray-300">{reason.dateLabel}</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
                {reason.excerpt}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[131px] bg-gradient-to-t from-[#fdfdff] from-[75%] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={!isComplete}
          onClick={() => {
            if (isComplete) navigate("/library/reasons/select");
          }}
          className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 font-semibold ${
            isComplete
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          다음 단계로 이동
        </button>
      </div>
    </main>
  );
}
