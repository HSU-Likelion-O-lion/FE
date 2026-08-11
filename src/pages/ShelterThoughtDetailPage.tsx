import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  createMockThoughtNotes,
  getThoughtById,
} from "../data/shelterThoughtsMock";
import bgGrid from "../assets/shelter/thoughts/bg-grid.png";
import bgGlow from "../assets/shelter/thoughts/bg-glow.svg";
import iconBack from "../assets/shelter/thoughts/icon-back.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";

type DetailLocationState = {
  title?: string;
  bookId?: string;
};

const DETAIL_THOUGHT_COUNT = 20;
const SWIPE_THRESHOLD = 48;

function resolveThoughtIndex(
  thoughts: ReturnType<typeof createMockThoughtNotes>,
  thoughtId: string,
) {
  const index = thoughts.findIndex((item) => item.id === thoughtId);
  return index >= 0 ? index : 0;
}

/** 단일 사유 상세 — Figma 320:5121 */
export default function ShelterThoughtDetailPage() {
  const navigate = useNavigate();
  const { thoughtId = "" } = useParams();
  const location = useLocation();
  const state = (location.state as DetailLocationState | null) ?? null;
  const bookTitle = state?.title ?? "불안을 이기는 철학";
  const thoughts = useMemo(
    () => createMockThoughtNotes(DETAIL_THOUGHT_COUNT),
    [],
  );
  const startIndexRef = useRef(resolveThoughtIndex(thoughts, thoughtId));
  /** 시작 사유부터 몇 번째까지 읽었는지 (1 = 시작 사유) */
  const [readCount, setReadCount] = useState(1);
  const [slideDirection, setSlideDirection] = useState<"prev" | "next" | null>(
    null,
  );
  const [suggestWriteOpen, setSuggestWriteOpen] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const total = thoughts.length;
  const currentIndex =
    total === 0 ? 0 : (startIndexRef.current + readCount - 1 + total) % total;
  const thought = thoughts[currentIndex] ?? getThoughtById(thoughtId);
  const canGoPrev = readCount > 1;
  const hasReadAll = readCount >= total;

  const openWritePage = () => {
    navigate("/shelter/thoughts/write", {
      state: { title: bookTitle, bookId: state?.bookId },
    });
  };

  const moveSlide = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (!canGoPrev) return;
      setSlideDirection("prev");
      setReadCount((prev) => prev - 1);
      return;
    }

    // 시작점부터 전체 한 바퀴를 다 돈 뒤 한 번 더 넘기면 작성 유도
    if (hasReadAll) {
      setSuggestWriteOpen(true);
      return;
    }

    setSlideDirection("next");
    setReadCount((prev) => prev + 1);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (dragStartX.current == null) return;
    const deltaX = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) moveSlide("next");
    else moveSlide("prev");
  };

  const handlePointerCancel = () => {
    dragStartX.current = null;
  };

  if (!thought) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#f7f8fc] px-5">
        <p className="text-body1 text-gray-600">사유를 찾을 수 없어요.</p>
        <button
          type="button"
          className="mt-4 text-button1 text-primary-500"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
      </main>
    );
  }

  return (
    <main
      className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc] touch-pan-x"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="relative z-10 mx-auto h-full w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${bgGrid})`,
            backgroundSize: "393px 792px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ellipse 2467 — Figma 320:5122 (433×644, top -230). 상단 글로우는 ellipse만 */}
        <img
          src={bgGlow}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-230px] z-0 h-[644px] w-[433px] max-w-none -translate-x-1/2"
        />

        {/* 연필 장식 — Figma 320:5133 / 320:5134 */}
        <img
          src={detailPencil2}
          alt=""
          className="pointer-events-none absolute left-[-156px] top-[103px] z-[1] h-[89px] w-[230px] object-contain opacity-80"
        />
        <img
          src={detailPencil1}
          alt=""
          className="pointer-events-none absolute left-[82px] top-[87px] z-[1] h-[86px] w-[177px] rotate-[4.83deg] object-contain opacity-80"
        />

        <header className="absolute inset-x-0 top-0 z-40 px-5 pt-5">
          <div className="relative flex h-11 w-full items-center justify-center">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="absolute left-0 flex size-6 items-center justify-center"
            >
              <img
                src={iconBack}
                alt=""
                className="h-[13.5px] w-[7.5px] rotate-180 object-contain"
              />
            </button>
            <h1 className="w-full text-center text-h3 text-white">{bookTitle}</h1>
          </div>
        </header>

        {/* 헤더~하단 CTA 사이 — 테이프 포함 전체가 헤더를 침범하지 않음 */}
        <div className="absolute inset-x-0 top-[64px] bottom-[120px] z-20 flex items-center justify-center overflow-hidden px-5">
          <div className="relative flex max-h-full min-h-0 w-[353px] flex-col items-center overflow-hidden pt-[38px]">
            {/* 테이프 — 카드 위 여백 안에만 배치 */}
            <img
              src={detailTape}
              alt=""
              className="pointer-events-none absolute left-1/2 top-0 z-30 h-[45px] w-[81px] -translate-x-1/2 object-contain"
            />

            {/* 사유 카드 — 높이 = 내용 길이 (길면 영역 안에서만 내부 스크롤) */}
            <article
              className="relative z-20 flex min-h-0 w-full max-h-[calc(100%-38px)] cursor-grab flex-col items-center gap-[23px] overflow-y-auto overscroll-contain px-8 py-[41px] touch-pan-y active:cursor-grabbing"
              style={{
                backgroundImage:
                  "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)",
              }}
            >
              <div
                key={thought.id}
                className={`flex w-full flex-col items-center gap-[23px] ${
                  slideDirection === "next"
                    ? "animate-[slide-in-right_220ms_ease-out]"
                    : slideDirection === "prev"
                      ? "animate-[slide-in-left_220ms_ease-out]"
                      : ""
                }`}
                onAnimationEnd={() => setSlideDirection(null)}
              >
                <div className="relative flex w-full flex-col items-center">
                  <img
                    src={detailAvatar}
                    alt=""
                    className="size-[77px] rounded-full object-cover"
                  />
                  <p className="mt-3 text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                    {thought.authorName}
                  </p>
                  <p className="mt-1 text-center text-[16.8px] leading-[27.6px] tracking-[-0.025em] text-gray-400">
                    {thought.date}
                  </p>
                </div>

                <p className="w-full whitespace-pre-wrap text-body1 leading-[1.6] text-gray-800">
                  {thought.body}
                </p>
              </div>
            </article>
          </div>
        </div>

        <button
          type="button"
          aria-label="이전 사유"
          disabled={!canGoPrev}
          onClick={() => moveSlide("prev")}
          className="absolute left-3 top-1/2 z-40 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/78 text-[20px] text-primary-500 shadow-[0_4px_20px_rgba(93,107,196,0.16)] backdrop-blur-[2px] disabled:cursor-not-allowed disabled:text-gray-300 md:flex"
        >
          ‹
        </button>

        <button
          type="button"
          aria-label="다음 사유"
          onClick={() => moveSlide("next")}
          className="absolute right-3 top-1/2 z-40 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/78 text-[20px] text-primary-500 shadow-[0_4px_20px_rgba(93,107,196,0.16)] backdrop-blur-[2px] md:flex"
        >
          ›
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-[105px] z-40 flex justify-center">
          <div className="rounded-full bg-white/78 px-3 py-1 backdrop-blur-[2px]">
            <p className="text-center text-[13px] font-medium leading-[1.4] tracking-[-0.025em] text-primary-500">
              {readCount} / {total}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
        />

        <div className="absolute inset-x-0 bottom-[33px] z-40 flex justify-center px-5">
          <Button
            text="내 사유 남기기"
            variant="primary"
            size="h-[54px] w-[353px] rounded-[16px] px-5 py-3"
            className="shadow-none"
            onClick={openWritePage}
          />
        </div>
      </div>

      <Modal
        open={suggestWriteOpen}
        variant="alert"
        status="info"
        title="모든 사유를 다 읽었습니다."
        description="지훈님의 여운도 이곳에 남겨보는건 어떤가요?"
        onClose={() => setSuggestWriteOpen(false)}
        actions={[
          {
            label: "닫기",
            variant: "outline",
            onClick: () => setSuggestWriteOpen(false),
          },
          {
            label: "사유 남기기",
            onClick: openWritePage,
          },
        ]}
      />
    </main>
  );
}
