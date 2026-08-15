import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import WebGnb from "../components/WebGnb";
import {
  createMockThoughtNotes,
  getThoughtById,
  type ThoughtNote,
} from "../data/shelterThoughtsMock";
import { SHELTER_BOARD_GRID_STYLE } from "../components/shelter/shelterBoardGrid";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailTapeCenter from "../assets/shelter/thoughts/detail-tape-center.svg";
import detailTapeSide from "../assets/shelter/thoughts/detail-tape-side.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";
import detailNavCircle from "../assets/shelter/thoughts/detail-nav-circle.svg";
import detailNavArrow from "../assets/shelter/thoughts/detail-nav-arrow.svg";
import ellipse2468 from "../assets/shelter/thoughts/ellipse-2468.svg";
import ShelterTopGlow from "../components/shelter/ShelterTopGlow";

type DetailLocationState = {
  title?: string;
  bookId?: string;
};

/** 보드(MOCK_THOUGHT_COUNT)와 동일 — 다 읽음 판정용 */
const DETAIL_THOUGHT_COUNT = 20;
const SWIPE_THRESHOLD = 48;

const CARD_GRADIENT =
  "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)";

/** 낮은 뷰포트에서도 카드·좌우 간격이 같이 줄어들도록 */
const WEB_CARD_H = "min(558px, calc(100dvh - 260px))";
const WEB_CARD_W = "min(424px, calc((100dvh - 260px) * 424 / 558))";
const WEB_CARD_OFFSET = "min(508px, calc((100dvh - 260px) * 508 / 558))";
const WEB_SIDE_TOP = "min(49px, calc((100dvh - 260px) * 49 / 558))";
const WEB_TAPE_PAD = "min(30px, calc((100dvh - 260px) * 30 / 558))";

function resolveThoughtIndex(
  thoughts: ReturnType<typeof createMockThoughtNotes>,
  thoughtId: string,
) {
  const index = thoughts.findIndex((item) => item.id === thoughtId);
  return index >= 0 ? index : 0;
}

function WebThoughtCard({
  thought,
  active,
  tapeSrc,
  className = "",
  style,
}: {
  thought: ThoughtNote;
  active: boolean;
  tapeSrc: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`absolute -translate-x-1/2 ${active ? "z-20" : "z-10 opacity-[0.48]"} ${className}`}
      style={{ width: WEB_CARD_W, ...style }}
    >
      <img
        src={tapeSrc}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute left-1/2 z-30 h-[clamp(36px,7vh,58px)] w-[clamp(60px,12vh,98px)] -translate-x-1/2 object-contain ${
          active ? "top-[-30px]" : "top-[-24px] opacity-80"
        }`}
      />
      <article
        className="flex w-full flex-col items-center gap-[clamp(14px,3vh,28px)] overflow-hidden px-[clamp(20px,3vw,38px)] py-[clamp(24px,5vh,49px)]"
        style={{
          height: WEB_CARD_H,
          backgroundImage: CARD_GRADIENT,
        }}
      >
        <div
          className={`flex w-full shrink-0 flex-col items-center ${active ? "" : "opacity-80"}`}
        >
          <img
            src={detailAvatar}
            alt=""
            className="size-[clamp(56px,11vh,92px)] rounded-full object-cover"
          />
          <p className="mt-[clamp(8px,1.2vh,12px)] text-center text-[clamp(18px,3.2vh,26px)] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
            {thought.authorName}
          </p>
          <p className="mt-0.5 text-center text-[clamp(14px,2.4vh,20px)] leading-[1.5] tracking-[-0.025em] text-gray-400">
            {thought.date}
          </p>
        </div>
        <p
          className={`min-h-0 w-full flex-1 overflow-y-auto whitespace-pre-wrap text-[clamp(14px,2.2vh,19px)] leading-[1.6] tracking-[-0.025em] text-gray-800 ${
            active ? "" : "opacity-80"
          }`}
        >
          {thought.body}
        </p>
      </article>
    </div>
  );
}

function WebNavButton({
  direction,
  disabled,
  onClick,
  className = "",
}: {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 사유" : "다음 사유"}
      disabled={disabled}
      onClick={onClick}
      className={`pointer-events-auto flex size-[clamp(36px,5vh,42px)] shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <span className="relative flex size-full items-center justify-center">
        <img
          src={detailNavCircle}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-[-5px] size-[clamp(44px,6.5vh,52px)] max-w-none"
        />
        <img
          src={detailNavArrow}
          alt=""
          aria-hidden
          className={`relative z-10 h-[clamp(14px,2.2vh,18px)] w-[clamp(8px,1.2vh,10px)] object-contain ${
            direction === "prev" ? "rotate-180" : ""
          }`}
        />
      </span>
    </button>
  );
}

/** 단일 사유 상세 — 모바일 Figma 320:5121 / 웹 Figma 726:4997 */
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
  /** 시작 사유부터의 이동 깊이 (1 = 시작 사유). 이전으로 시작점 이전은 불가 */
  const [readCount, setReadCount] = useState(1);
  /** 실제로 본 고유 사유 — 전부 다 본 뒤에만 ‘다 읽음’ 모달 */
  const [visitedIds, setVisitedIds] = useState(() => {
    const start = thoughts[startIndexRef.current];
    return new Set(start ? [start.id] : []);
  });
  const [slideDirection, setSlideDirection] = useState<"prev" | "next" | null>(
    null,
  );
  const [suggestWriteOpen, setSuggestWriteOpen] = useState(false);
  const dragStartX = useRef<number | null>(null);

  const total = thoughts.length;
  const currentIndex =
    total === 0 ? 0 : (startIndexRef.current + readCount - 1 + total) % total;
  const thought = thoughts[currentIndex] ?? getThoughtById(thoughtId);
  const prevThought =
    total > 0 ? thoughts[(currentIndex - 1 + total) % total] : undefined;
  const nextThought =
    total > 0 ? thoughts[(currentIndex + 1) % total] : undefined;
  const canGoPrev = readCount > 1;
  const hasReadAll = total > 0 && visitedIds.size >= total;

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

    // 고유 사유를 전부 다 본 뒤에 한 번 더 넘길 때만 작성 유도
    if (hasReadAll) {
      setSuggestWriteOpen(true);
      return;
    }

    const nextIndex = (currentIndex + 1) % total;
    const nextId = thoughts[nextIndex]?.id;
    setSlideDirection("next");
    setReadCount((prev) => prev + 1);
    if (nextId) {
      setVisitedIds((prev) => {
        const next = new Set(prev);
        next.add(nextId);
        return next;
      });
    }
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
    <>
      {/* —— Mobile (Figma 320:5121) —— */}
      <main
        className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc] touch-pan-x min-[431px]:hidden"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="relative z-10 mx-auto h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />

          <ShelterTopGlow />

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
                  src={iconBackWeb}
                  alt=""
                  className="size-6 object-contain"
                />
              </button>
              <h1 className="w-full text-center text-h3 text-white">
                {bookTitle}
              </h1>
            </div>
          </header>

          <div className="absolute inset-x-0 top-[64px] bottom-[120px] z-20 flex items-center justify-center overflow-hidden px-5">
            <div className="relative flex max-h-full min-h-0 w-[353px] flex-col items-center overflow-hidden pt-[38px]">
              <img
                src={detailTape}
                alt=""
                className="pointer-events-none absolute left-1/2 top-0 z-30 h-[45px] w-[81px] -translate-x-1/2 object-contain"
              />

              <article
                className="relative z-20 flex min-h-0 w-full max-h-[calc(100%-38px)] cursor-grab flex-col items-center gap-[23px] overflow-y-auto overscroll-contain px-8 py-[41px] touch-pan-y active:cursor-grabbing"
                style={{ backgroundImage: CARD_GRADIENT }}
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

          <div className="pointer-events-none absolute inset-x-0 bottom-[105px] z-40 flex justify-center">
            <div className="rounded-full bg-white/78 px-3 py-1 backdrop-blur-[2px]">
              <p className="text-center text-[13px] font-medium leading-[1.4] tracking-[-0.025em] text-primary-500">
                {visitedIds.size} / {total}
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
      </main>

      {/* —— Web (Figma 726:4997) —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />

        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-20 h-[min(944px,120dvh)] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <WebGnb
            active="shelter"
            tone="dark"
            className="pointer-events-auto relative bg-transparent"
          />
          <header className="flex items-center gap-5 px-8 pt-1 min-[1024px]:px-40">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconBackWeb}
                alt=""
                className="size-[42px] object-contain"
              />
            </button>
            <h1 className="truncate text-[clamp(24px,4vh,40px)] font-semibold leading-tight tracking-[-0.025em] text-[#fdfdff]">
              {bookTitle}
            </h1>
          </header>
        </div>

        {/* top 여유: 테이프 + 낮은 높이 대응 */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 overflow-hidden"
          style={{ top: "clamp(140px, 28vh, 219px)" }}
        >
          <div
            key={thought.id}
            className={`relative mx-auto w-full max-w-[1440px] ${
              slideDirection === "next"
                ? "animate-[slide-in-right_220ms_ease-out]"
                : slideDirection === "prev"
                  ? "animate-[slide-in-left_220ms_ease-out]"
                  : ""
            }`}
            style={{
              height: `calc(${WEB_CARD_H} + ${WEB_TAPE_PAD} + ${WEB_SIDE_TOP})`,
            }}
            onAnimationEnd={() => setSlideDirection(null)}
          >
            {prevThought && (
              <WebThoughtCard
                thought={prevThought}
                active={false}
                tapeSrc={detailTapeSide}
                className=""
                style={{
                  left: `calc(50% - ${WEB_CARD_OFFSET})`,
                  top: `calc(${WEB_TAPE_PAD} + ${WEB_SIDE_TOP})`,
                }}
              />
            )}
            <WebThoughtCard
              thought={thought}
              active
              tapeSrc={detailTapeCenter}
              className=""
              style={{
                left: "50%",
                top: WEB_TAPE_PAD,
              }}
            />
            {nextThought && (
              <WebThoughtCard
                thought={nextThought}
                active={false}
                tapeSrc={detailTapeSide}
                className=""
                style={{
                  left: `calc(50% + ${WEB_CARD_OFFSET})`,
                  top: `calc(${WEB_TAPE_PAD} + ${WEB_SIDE_TOP})`,
                }}
              />
            )}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 z-40 flex items-center justify-between px-8 min-[1024px]:px-40"
          style={{
            top: "clamp(160px, 32vh, 249px)",
            height: WEB_CARD_H,
          }}
        >
          <WebNavButton
            direction="prev"
            disabled={!canGoPrev}
            onClick={() => moveSlide("prev")}
          />
          <WebNavButton
            direction="next"
            onClick={() => moveSlide("next")}
          />
        </div>
      </main>

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
    </>
  );
}
