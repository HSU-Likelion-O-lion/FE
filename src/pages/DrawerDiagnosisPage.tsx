import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  accumulateKeywords,
  pickRandomDiagnosisCards,
  type DiagnosisCard,
  type DiagnosisSwipe,
} from "../data/drawerDiagnosisMock";
import bgRoom from "../assets/drawer/bg-room.png";
import cardFrontShape from "../assets/drawer/diagnosis/card-front-shape.svg";
import iconMeh from "../assets/drawer/diagnosis/icon-meh.svg";
import actionsXo from "../assets/drawer/diagnosis/actions-xo-parts.svg";
import loadingOwl from "../assets/drawer/diagnosis/loading-owl.png";
import loadingRing from "../assets/drawer/diagnosis/loading-ring.png";
import iconAlert from "../assets/drawer/diagnosis/icon-alert.svg";
import iconWifi from "../assets/drawer/diagnosis/icon-wifi.svg";

const SWIPE_THRESHOLD = 100;
const EXIT_DISTANCE = 420;
const LOADING_MS = 2200;

type Phase = "swiping" | "loading" | "empty" | "error";

function createSession() {
  return { cards: pickRandomDiagnosisCards(5) };
}

function RoomBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-[430px]"
    >
      <img
        src={bgRoom}
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-[rgba(74,86,157,0.63)]" />
    </div>
  );
}

/** 서랍 — 마음 읽기 진단중 (Figma 409:12567 외) */
export default function DrawerDiagnosisPage() {
  const navigate = useNavigate();
  const [{ cards }, setSession] = useState(createSession);
  const [index, setIndex] = useState(0);
  const [swipes, setSwipes] = useState<DiagnosisSwipe[]>([]);
  const [phase, setPhase] = useState<Phase>("swiping");
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const keywordsRef = useRef<string[]>([]);

  const front = cards[index] as DiagnosisCard | undefined;
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

  const commitSwipe = useCallback(
    (agreed: boolean) => {
      if (!front || exiting || phase !== "swiping") return;

      setExiting(agreed ? "right" : "left");
      setDragX(agreed ? EXIT_DISTANCE : -EXIT_DISTANCE);

      window.setTimeout(() => {
        const nextSwipes = [...swipes, { cardId: front.id, agreed }];
        setSwipes(nextSwipes);
        setExiting(null);
        setDragX(0);
        dragXRef.current = 0;

        if (index + 1 >= cards.length) {
          finishSession(nextSwipes);
        } else {
          setIndex((prev) => prev + 1);
        }
      }, 280);
    },
    [cards.length, exiting, finishSession, front, index, phase, swipes],
  );

  const restart = () => {
    setSession(createSession());
    setIndex(0);
    setSwipes([]);
    setPhase("swiping");
    setDragX(0);
    setExiting(null);
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
  const agreeOpacity = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD));
  const disagreeOpacity = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD));
  const dimmed = phase === "loading" || phase === "empty" || phase === "error";

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-y-auto bg-[#2a3366]">
      <RoomBackground />

      <div
        className={`relative z-10 flex min-h-dvh flex-col px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(56px+env(safe-area-inset-top))] ${
          dimmed ? "pointer-events-none select-none" : ""
        }`}
        aria-hidden={dimmed}
      >
        <header className="shrink-0">
          <p className="text-[18px] leading-[1.6] tracking-[-0.025em] text-primary-200">
            {progress}
          </p>
          <h1 className="mt-1 text-h2 text-primary-10">
            지금 내 마음과 가장 가까운가요?
          </h1>
          <p className="mt-1.5 text-body1 text-primary-200">
            공감되면 오른쪽, 공감되지 않으면 왼쪽으로 넘겨주세요.
          </p>
        </header>

        <section className="relative mt-6 flex min-h-[320px] flex-1 flex-col items-center justify-center">
          {front && phase === "swiping" ? (
            <div
              role="group"
              aria-label={`진단 카드 ${front.id}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="relative z-10 w-[min(278px,78vw)] touch-none select-none will-change-transform"
              style={{
                transform: `translateX(${dragX}px) rotate(${rotate + 0.67}deg)`,
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
                <p className="absolute inset-x-[10%] top-1/2 -translate-y-1/2 -rotate-[2.6deg] text-center font-saeeum text-[30px] leading-[1.5] tracking-[-0.025em] text-gray-900">
                  {front.text}
                </p>
                {dragging ? (
                  <>
                    <div
                      aria-hidden
                      className="absolute left-4 top-3 flex size-12 items-center justify-center rounded-full border-[3px] border-[#DA4263] text-[20px] font-bold text-[#DA4263]"
                      style={{ opacity: disagreeOpacity }}
                    >
                      X
                    </div>
                    <div
                      aria-hidden
                      className="absolute right-4 top-3 flex size-12 items-center justify-center rounded-full border-[3px] border-[#62CB60] text-[20px] font-bold text-[#62CB60]"
                      style={{ opacity: agreeOpacity }}
                    >
                      O
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <div className="relative mt-2 mb-12 gap-3 flex shrink-0 flex-col items-center">
          <img
            src={iconMeh}
            alt=""
            aria-hidden
            className="mb-1 size-[60px] object-contain opacity-90"
          />
          <div className="relative h-[100px] w-[179px]">
            <img
              src={actionsXo}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-[-19%_-9%] size-[118%] max-w-none object-contain"
            />
            <button
              type="button"
              aria-label="비공감"
              disabled={!!exiting || phase !== "swiping"}
              onClick={() => commitSwipe(false)}
              className="absolute left-[8px] top-1/2 size-[56px] -translate-y-1/2 rounded-full disabled:opacity-50"
            />
            <button
              type="button"
              aria-label="공감"
              disabled={!!exiting || phase !== "swiping"}
              onClick={() => commitSwipe(true)}
              className="absolute right-[8px] top-1/2 size-[56px] -translate-y-1/2 rounded-full disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {dimmed ? (
        <div className="absolute inset-0 z-30 bg-[rgba(58,61,77,0.78)]" />
      ) : null}

      {phase === "loading" ? (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
          <div className="relative flex size-[239px] items-center justify-center">
            <img
              src={loadingRing}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full animate-spin object-contain [animation-direction:reverse] [animation-duration:3s]"
            />
            <img
              src={loadingOwl}
              alt=""
              className="relative mt-6 h-[83px] w-[155px] object-contain object-bottom"
            />
          </div>
          <p className="mt-2 text-center text-[20px] font-bold leading-7 text-white">
            잠시만요, 마음의 결을 읽고 있어요!
          </p>
          <p className="mt-2 text-center text-body2 text-gray-200">
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
            className="w-full max-w-[353px] rounded-[20px] bg-[#fefefe] px-5 pb-4 pt-4"
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
                onClick={() => navigate("/drawer")}
                className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-gray-200 text-button1 text-gray-400"
              >
                중단하기
              </button>
              <button
                type="button"
                onClick={restart}
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
          <img src={iconWifi} alt="" className="size-[144px] object-contain" />
          <p className="mt-2 text-center text-[20px] font-bold leading-7 text-white">
            인터넷 연결이 불안정해요
          </p>
          <p className="mt-2 text-center text-body2 text-gray-300">
            분석 결과를 불러오지 못했습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase("loading");
            }}
            className="mt-1 text-body2 text-gray-300 underline"
          >
            다시시도
          </button>
        </div>
      ) : null}
    </main>
  );
}
