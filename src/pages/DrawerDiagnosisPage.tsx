import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import WebGnb from "../components/WebGnb";
import {
  accumulateKeywords,
  pickRandomDiagnosisCards,
  type DiagnosisCard,
  type DiagnosisSwipe,
} from "../data/drawerDiagnosisMock";
import bgRoom from "../assets/drawer/bg-room.png";
import webBg from "../assets/common/web-bg.png";
import cardFrontShape from "../assets/drawer/diagnosis/card-front-shape.svg";
import iconMeh from "../assets/drawer/diagnosis/icon-meh.svg";
import actionsXo from "../assets/drawer/diagnosis/actions-xo-parts.svg";
import loadingOwl from "../assets/drawer/diagnosis/loading-owl.png";
import loadingRing from "../assets/drawer/diagnosis/loading-ring.png";
import iconAlert from "../assets/drawer/diagnosis/icon-alert.svg";
import iconWifi from "../assets/drawer/diagnosis/icon-wifi.svg";
import webCircle from "../assets/drawer/diagnosis/web-circle.svg";

const SWIPE_THRESHOLD = 100;
const EXIT_DISTANCE = 420;
const LOADING_MS = 2200;
const WEB_ROTATE_MS = 520;

type Phase = "swiping" | "loading" | "empty" | "error";

/** Figma 웹 포스트잇 슬롯 — 좌=이전, 중=현재, 우=다음 (예: 5 1 2 → 1 2 3) */
const WEB_SLOT = {
  center:
    "absolute left-[calc(50%-18px)] top-[326px] z-10 w-[367px] -translate-x-1/2 rotate-[0.67deg]",
  right:
    "absolute left-[calc(50%+155px)] top-[584px] z-[2] w-[243px] rotate-[6.71deg]",
  left:
    "absolute left-[calc(50%-435px)] top-[584px] z-[1] w-[253px] -rotate-[23.45deg]",
  /** 왼쪽에서 사라짐 */
  exit:
    "absolute left-[calc(50%-435px)] top-[584px] z-0 w-[253px] -rotate-[23.45deg] scale-90 opacity-0",
} as const;

function createSession() {
  return { cards: pickRandomDiagnosisCards(5) };
}

/** Figma 1024 높이 기준으로 짧은 뷰포트만 origin-top 스케일 */
function useWebStageScale(designHeight: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      setScale(Math.min(1, window.innerHeight / designHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [designHeight]);

  return scale;
}

function RoomBackground({ fullBleed = false }: { fullBleed?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none z-0 ${
        fullBleed
          ? "absolute inset-0"
          : "fixed inset-0 mx-auto max-w-[430px]"
      }`}
    >
      <img
        src={fullBleed ? webBg : bgRoom}
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_30%]"
      />
      <div
        className={`absolute inset-0 ${
          fullBleed
            ? "bg-[rgba(70,83,162,0.43)]"
            : "bg-[rgba(74,86,157,0.63)]"
        }`}
      />
    </div>
  );
}

/** 서랍 — 마음 읽기 진단중 (모바일 409:12567 / 웹 738:4657) */
export default function DrawerDiagnosisPage() {
  const navigate = useNavigate();
  const [{ cards }, setSession] = useState(createSession);
  const [index, setIndex] = useState(0);
  const [swipes, setSwipes] = useState<DiagnosisSwipe[]>([]);
  const [phase, setPhase] = useState<Phase>("swiping");
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const [webRotating, setWebRotating] = useState(false);

  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const keywordsRef = useRef<string[]>([]);

  const front = cards[index] as DiagnosisCard | undefined;
  /** 웹 슬롯: 왼쪽=이전(처음엔 마지막 카드), 중앙=현재, 오른쪽=다음 */
  const webLeft =
    cards.length > 0
      ? index === 0
        ? cards[cards.length - 1]
        : cards[index - 1]
      : undefined;
  const webRight =
    index + 1 < cards.length ? cards[index + 1] : undefined;
  const webIncomingRight =
    index + 2 < cards.length ? cards[index + 2] : undefined;
  const progress = `${Math.min(index + 1, cards.length)}/${cards.length}`;

  const goToRecommend = useCallback(
    (keywords: string[]) => {
      navigate("/drawer/recommend", { state: { keywords }, replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(() => {
      goToRecommend(keywordsRef.current);
    }, LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [phase, goToRecommend]);

  const finishSession = useCallback((finalSwipes: DiagnosisSwipe[]) => {
    const keywords = accumulateKeywords(finalSwipes);
    keywordsRef.current = keywords;
    if (keywords.length === 0) {
      setPhase("empty");
      return;
    }
    setPhase("loading");
  }, []);

  const applySwipeResult = useCallback(
    (agreed: boolean) => {
      if (!front) return;
      const nextSwipes = [...swipes, { cardId: front.id, agreed }];
      setSwipes(nextSwipes);
      if (index + 1 >= cards.length) {
        finishSession(nextSwipes);
      } else {
        setIndex((prev) => prev + 1);
      }
    },
    [cards.length, finishSession, front, index, swipes],
  );

  /** 모바일 — 스와이프 슬라이드 아웃 */
  const commitSwipe = useCallback(
    (agreed: boolean) => {
      if (!front || exiting || phase !== "swiping") return;

      setExiting(agreed ? "right" : "left");
      setDragX(agreed ? EXIT_DISTANCE : -EXIT_DISTANCE);

      window.setTimeout(() => {
        setExiting(null);
        setDragX(0);
        dragXRef.current = 0;
        applySwipeResult(agreed);
      }, 280);
    },
    [applySwipeResult, exiting, front, phase],
  );

  /** 웹 — O/X만. 반시계: 우→중, 중→좌, 좌 퇴장, 새 카드 우 입장 (5 1 2 → 1 2 3) */
  const commitWeb = useCallback(
    (agreed: boolean) => {
      if (!front || webRotating || phase !== "swiping") return;
      setWebRotating(true);
      window.setTimeout(() => {
        // index 먼저 갱신 + rotating off를 한 프레임에 묶어
        // key=card.id 기준으로 슬롯이 목표 위치에 고정되어 역재생되지 않음
        applySwipeResult(agreed);
        setWebRotating(false);
      }, WEB_ROTATE_MS);
    },
    [applySwipeResult, front, phase, webRotating],
  );

  const restart = () => {
    setSession(createSession());
    setIndex(0);
    setSwipes([]);
    setPhase("swiping");
    setDragX(0);
    setExiting(null);
    setWebRotating(false);
    keywordsRef.current = [];
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (exiting || phase !== "swiping") return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    dragXRef.current = 0;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || pointerIdRef.current !== e.pointerId) return;
    const next = e.clientX - startXRef.current;
    dragXRef.current = next;
    setDragX(next);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    setDragging(false);

    const x = dragXRef.current;
    if (x >= SWIPE_THRESHOLD) commitSwipe(true);
    else if (x <= -SWIPE_THRESHOLD) commitSwipe(false);
    else {
      setDragX(0);
      dragXRef.current = 0;
    }
  };

  const rotate = dragX * 0.04;
  const dimmed = phase === "loading" || phase === "empty" || phase === "error";
  const stageScale = useWebStageScale(1024);

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-y-auto bg-[#2a3366] min-[431px]:hidden">
        <RoomBackground />

        <div
          className={`relative z-10 flex min-h-dvh flex-col px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(56px+env(safe-area-inset-top))] ${
            dimmed ? "pointer-events-none select-none" : ""
          }`}
          aria-hidden={dimmed}
        >
          <DiagnosisHeader progress={progress} size="mobile" />

          <section className="relative mt-6 flex min-h-[320px] flex-1 flex-col items-center justify-center">
            {front && phase === "swiping" ? (
              <SwipeCard
                card={front}
                dragX={dragX}
                rotate={rotate + 0.67}
                dragging={dragging}
                exiting={exiting}
                size="mobile"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            ) : null}
          </section>

          <ActionBar
            size="mobile"
            disabled={!!exiting || phase !== "swiping"}
            onDisagree={() => commitSwipe(false)}
            onAgree={() => commitSwipe(true)}
          />
        </div>

        <Overlays
          phase={phase}
          size="mobile"
          onRestart={restart}
          onAbort={() => navigate("/drawer")}
          onRetry={() => setPhase("loading")}
        />
      </main>

      {/* —— Web (Figma 738:4657) — 1440×1024 절대좌표, 높이 따라 안 움직임 —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#2a3366] min-[431px]:block">
        <RoomBackground fullBleed />
        <WebGnb
          active="drawer"
          tone="dark"
          className="absolute inset-x-0 top-0 z-30"
        />

        {/* Design stage: fixed 1024 tall; short viewports scale from top */}
        <div
          className={`absolute left-0 top-0 z-10 h-[1024px] w-full origin-top ${
            dimmed ? "pointer-events-none select-none" : ""
          }`}
          style={{ transform: `scale(${stageScale})` }}
          aria-hidden={dimmed}
        >
          {/* Header — left 160 / top 116~212 */}
          <header className="absolute left-10 top-[116px] max-w-[640px] min-[1024px]:left-40">
            <p className="text-[24px] leading-[1.6] tracking-[-0.025em] text-primary-200">
              {progress}
            </p>
            <h1 className="mt-1 text-[30px] font-semibold leading-[1.5] tracking-[-0.025em] text-primary-10">
              지금 내 마음과 가장 가까운가요?
            </h1>
            <p className="mt-2 text-[22px] leading-[1.6] tracking-[-0.025em] text-primary-200">
              공감되면 O, 공감되지 않으면 X를 눌러주세요.
            </p>
          </header>

          {/* Circle — top 455, 609×609, stroke 그라데이션 (Figma 738:4774) */}
          <img
            src={webCircle}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[455px] z-0 size-[609px] max-w-none -translate-x-1/2 object-contain"
          />

          {phase === "swiping" && front ? (
            <WebPostItCarousel
              left={webLeft}
              center={front}
              right={webRight}
              incomingRight={webIncomingRight}
              rotating={webRotating}
            />
          ) : null}

          {/* Meh — top 709, 72 */}
          <img
            src={iconMeh}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[709px] z-10 size-[72px] -translate-x-1/2 object-contain opacity-90"
          />

          {/* X/O — top 795, 214×120 (웹은 버튼만) */}
          <div className="absolute left-1/2 top-[795px] z-10 h-[120px] w-[214px] -translate-x-1/2">
            <img
              src={actionsXo}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-[-19%_-9%] size-[118%] max-w-none object-contain"
            />
            <button
              type="button"
              aria-label="비공감"
              disabled={webRotating || phase !== "swiping"}
              onClick={() => commitWeb(false)}
              className="absolute left-[12px] top-1/2 size-[64px] -translate-y-1/2 rounded-full disabled:opacity-50"
            />
            <button
              type="button"
              aria-label="공감"
              disabled={webRotating || phase !== "swiping"}
              onClick={() => commitWeb(true)}
              className="absolute right-[12px] top-1/2 size-[64px] -translate-y-1/2 rounded-full disabled:opacity-50"
            />
          </div>
        </div>

        <Overlays
          phase={phase}
          size="web"
          onRestart={restart}
          onAbort={() => navigate("/drawer")}
          onRetry={() => setPhase("loading")}
        />
      </main>
    </>
  );
}

function DiagnosisHeader({
  progress,
  size,
}: {
  progress: string;
  size: "mobile" | "web";
}) {
  const isWeb = size === "web";
  return (
    <header className={`shrink-0 ${isWeb ? "pt-6" : ""}`}>
      <p
        className={
          isWeb
            ? "text-[24px] leading-[1.6] tracking-[-0.025em] text-primary-200"
            : "text-[18px] leading-[1.6] tracking-[-0.025em] text-primary-200"
        }
      >
        {progress}
      </p>
      <h1
        className={
          isWeb
            ? "mt-1 text-[30px] font-semibold leading-[1.5] tracking-[-0.025em] text-primary-10"
            : "mt-1 text-h2 text-primary-10"
        }
      >
        지금 내 마음과 가장 가까운가요?
      </h1>
      <p
        className={
          isWeb
            ? "mt-2 text-[22px] leading-[1.6] tracking-[-0.025em] text-primary-200"
            : "mt-1.5 text-body1 text-primary-200"
        }
      >
        공감되면 오른쪽, 공감되지 않으면 왼쪽으로 넘겨주세요.
      </p>
    </header>
  );
}

function WebPostItCarousel({
  left,
  center,
  right,
  incomingRight,
  rotating,
}: {
  left?: DiagnosisCard;
  center: DiagnosisCard;
  right?: DiagnosisCard;
  incomingRight?: DiagnosisCard;
  rotating: boolean;
}) {
  // key=card.id 로 노드를 유지해 슬롯만 바꿔 반시계 1회 전환 (역재생 방지)
  type Item = {
    card: DiagnosisCard;
    slot: keyof typeof WEB_SLOT | "enter";
  };

  const items: Item[] = [];
  if (left) {
    items.push({ card: left, slot: rotating ? "exit" : "left" });
  }
  items.push({ card: center, slot: rotating ? "left" : "center" });
  if (right) {
    items.push({ card: right, slot: rotating ? "center" : "right" });
  }
  if (rotating && incomingRight) {
    items.push({ card: incomingRight, slot: "enter" });
  }

  return (
    <>
      {items.map(({ card, slot }) => {
        const isCenter = slot === "center";
        const className =
          slot === "enter"
            ? `${WEB_SLOT.right} animate-diag-fade-in`
            : `${WEB_SLOT[slot]} transition-all duration-500 ease-out`;

        return (
          <div key={card.id} className={className}>
            <WebPostIt text={card.text} size={isCenter ? "center" : "side"} />
          </div>
        );
      })}
    </>
  );
}

function WebPostIt({
  text,
  size,
}: {
  text: string;
  size: "center" | "side";
}) {
  const isCenter = size === "center";
  return (
    <div className="relative aspect-[278/188] w-full">
      <img
        src={cardFrontShape}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-fill"
      />
      <p
        className={`absolute inset-x-[10%] top-1/2 -translate-y-1/2 text-center font-saeeum tracking-[-0.025em] transition-[font-size,line-height] duration-500 ${
          isCenter
            ? "-rotate-[2.6deg] text-[40px] leading-[1.5] text-gray-900"
            : "text-[26px] leading-[28px] text-[#262838]"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function SwipeCard({
  card,
  dragX,
  rotate,
  dragging,
  exiting,
  size,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  card: DiagnosisCard;
  dragX: number;
  rotate: number;
  dragging: boolean;
  exiting: "left" | "right" | null;
  size: "mobile" | "web";
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const isWeb = size === "web";

  return (
    <div
      role="group"
      aria-label={`진단 카드 ${card.id}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`relative z-10 touch-none select-none will-change-transform ${
        isWeb ? "w-[367px]" : "w-[min(278px,78vw)]"
      }`}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition:
          dragging || exiting
            ? exiting
              ? "transform 280ms ease-out"
              : "none"
            : "transform 200ms ease-out",
      }}
    >
      <div className="relative aspect-[278/188] w-full">
        <img
          src={cardFrontShape}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-fill"
        />
        <p
          className={`absolute inset-x-[10%] top-1/2 -translate-y-1/2 -rotate-[2.6deg] text-center font-saeeum tracking-[-0.025em] text-gray-900 ${
            isWeb
              ? "text-[40px] leading-[1.5]"
              : "text-[30px] leading-[1.5]"
          }`}
        >
          {card.text}
        </p>
      </div>
    </div>
  );
}

function ActionBar({
  size,
  disabled,
  onDisagree,
  onAgree,
}: {
  size: "mobile" | "web";
  disabled: boolean;
  onDisagree: () => void;
  onAgree: () => void;
}) {
  const isWeb = size === "web";

  return (
    <div
      className={`relative z-10 flex shrink-0 flex-col items-center ${
        isWeb ? "mt-2 mb-4 gap-4" : "mt-2 mb-12 gap-3"
      }`}
    >
      <img
        src={iconMeh}
        alt=""
        aria-hidden
        className={`object-contain opacity-90 ${
          isWeb ? "size-[72px]" : "mb-1 size-[60px]"
        }`}
      />
      <div className={`relative ${isWeb ? "h-[120px] w-[214px]" : "h-[100px] w-[179px]"}`}>
        <img
          src={actionsXo}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-[-19%_-9%] size-[118%] max-w-none object-contain"
        />
        <button
          type="button"
          aria-label="비공감"
          disabled={disabled}
          onClick={onDisagree}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full disabled:opacity-50 ${
            isWeb
              ? "left-[12px] size-[64px]"
              : "left-[8px] size-[56px]"
          }`}
        />
        <button
          type="button"
          aria-label="공감"
          disabled={disabled}
          onClick={onAgree}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full disabled:opacity-50 ${
            isWeb
              ? "right-[12px] size-[64px]"
              : "right-[8px] size-[56px]"
          }`}
        />
      </div>
    </div>
  );
}

function Overlays({
  phase,
  size,
  onRestart,
  onAbort,
  onRetry,
}: {
  phase: Phase;
  size: "mobile" | "web";
  onRestart: () => void;
  onAbort: () => void;
  onRetry: () => void;
}) {
  const isWeb = size === "web";
  const dimmed = phase === "loading" || phase === "empty" || phase === "error";

  return (
    <>
      {dimmed ? (
        <div className="absolute inset-0 z-30 bg-[rgba(58,61,77,0.78)]" />
      ) : null}

      {phase === "loading" ? (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
          <div
            className={`relative flex items-center justify-center ${
              isWeb ? "size-[320px]" : "size-[239px]"
            }`}
          >
            <img
              src={loadingRing}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full animate-spin object-contain [animation-direction:reverse] [animation-duration:3s]"
            />
            <img
              src={loadingOwl}
              alt=""
              className={`relative object-contain object-bottom ${
                isWeb
                  ? "mt-8 h-[110px] w-[206px]"
                  : "mt-6 h-[83px] w-[155px]"
              }`}
            />
          </div>
          <p
            className={`mt-2 text-center font-bold text-white ${
              isWeb ? "text-[28px] leading-9" : "text-[20px] leading-7"
            }`}
          >
            잠시만요, 마음의 결을 읽고 있어요!
          </p>
          <p
            className={`mt-2 text-center text-gray-200 ${
              isWeb ? "text-[18px]" : "text-body2"
            }`}
          >
            당신에게 꼭 필요한 문장을 찾는 중...
          </p>
        </div>
      ) : null}

      {phase === "empty" ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-5">
          <div
            role="dialog"
            aria-modal
            aria-labelledby="empty-title"
            className={`w-full rounded-[20px] bg-[#fefefe] px-5 pb-4 pt-4 ${
              isWeb ? "max-w-[420px]" : "max-w-[353px]"
            }`}
          >
            <div className="mx-auto flex size-[82px] items-center justify-center">
              <img
                src={iconAlert}
                alt=""
                className="size-full object-contain"
              />
            </div>
            <h2
              id="empty-title"
              className="mt-1 text-center text-button1 font-semibold text-[#282723]"
            >
              마음에 와닿는 문장이 없으셨군요!
            </h2>
            <p className="mt-2 text-center text-body2 leading-[23px] text-[#8e8b7e]">
              새로운 5개 질문을 뽑아왔어요. 다시 한번 해볼까요?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onAbort}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-200 text-button1 text-gray-400"
              >
                중단하기
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary-500 text-button1 font-semibold text-white"
              >
                다시 진단하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "error" ? (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
          <img
            src={iconWifi}
            alt=""
            className={`object-contain ${isWeb ? "size-[180px]" : "size-[144px]"}`}
          />
          <p
            className={`mt-2 text-center font-bold text-white ${
              isWeb ? "text-[28px] leading-9" : "text-[20px] leading-7"
            }`}
          >
            인터넷 연결이 불안정해요
          </p>
          <p
            className={`mt-2 text-center text-gray-300 ${
              isWeb ? "text-[18px]" : "text-body2"
            }`}
          >
            분석 결과를 불러오지 못했습니다.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className={`mt-1 text-gray-300 underline ${
              isWeb ? "text-[18px]" : "text-body2"
            }`}
          >
            다시시도
          </button>
        </div>
      ) : null}
    </>
  );
}
