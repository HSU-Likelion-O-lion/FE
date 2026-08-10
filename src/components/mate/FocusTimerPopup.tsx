import { useEffect, useRef, useState } from "react";
import timerBg from "../../assets/mate/timer-bg.png";
import timerGlow from "../../assets/mate/timer-glow.svg";
import iconClose from "../../assets/mate/icon-close.svg";
import iconPause from "../../assets/mate/icon-pause.svg";
import iconPlay from "../../assets/mate/icon-play.svg";
import Modal from "../Modal";
import { PauseReasonOptions } from "../ModalOptionList";
import PauseDetailForm from "./PauseDetailForm";

const RING_SIZE = 272;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const FOCUS_TIMER_KEY = "sseudam:focus-timer";
/** 타이머 0초 완료 시에만 목표달성/생각적기 라우트 진입 가능 */
const FOCUS_COMPLETE_KEY = "sseudam:focus-complete";
const HISTORY_STATE = { focusTimer: true } as const;
/** 시작 시 링이 비움→채움으로 한 바퀴 도는 시간 */
const RING_INTRO_MS = 500;

/**
 * 개발용 타이머 배속 (1 = 실시간).
 */
const DEV_TIMER_SPEED = 100;
// const DEV_TIMER_SPEED = 1;

export type FocusTimerSession = {
  minutes: number;
  remainingSeconds: number;
  paused: boolean;
};

export type FocusCompleteSession = {
  minutes: number;
};

export function loadFocusTimerSession(): FocusTimerSession | null {
  try {
    const raw = localStorage.getItem(FOCUS_TIMER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as FocusTimerSession;
    if (
      typeof data.minutes !== "number" ||
      typeof data.remainingSeconds !== "number" ||
      data.remainingSeconds <= 0
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearFocusTimerSession() {
  localStorage.removeItem(FOCUS_TIMER_KEY);
}

function saveFocusTimerSession(session: FocusTimerSession) {
  localStorage.setItem(FOCUS_TIMER_KEY, JSON.stringify(session));
}

export function markFocusComplete(minutes: number) {
  sessionStorage.setItem(
    FOCUS_COMPLETE_KEY,
    JSON.stringify({ minutes } satisfies FocusCompleteSession),
  );
}

export function loadFocusComplete(): FocusCompleteSession | null {
  try {
    const raw = sessionStorage.getItem(FOCUS_COMPLETE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as FocusCompleteSession;
    if (typeof data.minutes !== "number" || data.minutes <= 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearFocusComplete() {
  sessionStorage.removeItem(FOCUS_COMPLETE_KEY);
}

type FocusTimerPopupProps = {
  open: boolean;
  minutes: number;
  /** 복구 시 남은 초. 없으면 minutes 기준으로 새로 시작 */
  initialRemaining?: number;
  /** 복구 시 일시정지 여부 */
  initialPaused?: boolean;
  /** 새 타이머 시작마다 바꿔 인트로를 다시 재생 */
  startKey?: number;
  onClose: () => void;
  /** 타이머가 0초가 되어 정상 완료됐을 때 */
  onComplete?: (minutes: number) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function FocusTimerPopup({
  open,
  minutes,
  initialRemaining,
  initialPaused = false,
  startKey = 0,
  onClose,
  onComplete,
}: FocusTimerPopupProps) {
  const totalSeconds = minutes * 60;
  const isRestore = initialRemaining != null;

  const [remaining, setRemaining] = useState(initialRemaining ?? totalSeconds);
  const [paused, setPaused] = useState(initialPaused);
  const [introDone, setIntroDone] = useState(isRestore);
  const [ringTransition, setRingTransition] = useState(false);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseStep, setPauseStep] = useState<"reason" | "detail" | "confirm">(
    "reason",
  );
  const [pauseReasonId, setPauseReasonId] = useState<string>();

  const remainingRef = useRef(remaining);
  const skipPopRef = useRef(false);
  const completedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onCompleteRef = useRef(onComplete);
  onCloseRef.current = onClose;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // 팝업 닫히면 사유 모달도 닫기
  useEffect(() => {
    if (!open) {
      setPauseModalOpen(false);
      setPauseStep("reason");
      setPauseReasonId(undefined);
    }
  }, [open]);

  // 열릴 때 세션/인트로 초기화
  useEffect(() => {
    if (!open) {
      setIntroDone(false);
      setRingTransition(false);
      completedRef.current = false;
      return;
    }

    const nextRemaining = initialRemaining ?? minutes * 60;
    setRemaining(nextRemaining);
    completedRef.current = false;

    if (isRestore) {
      setPaused(initialPaused ?? true);
      setIntroDone(true);
      setRingTransition(true);
      saveFocusTimerSession({
        minutes,
        remainingSeconds: nextRemaining,
        paused: initialPaused ?? true,
      });
      return;
    }

    // 새 시작: CSS 인트로 재생 후 카운트다운
    setPaused(false);
    setIntroDone(false);
    setRingTransition(false);
    saveFocusTimerSession({
      minutes,
      remainingSeconds: nextRemaining,
      paused: false,
    });

    const timeoutId = window.setTimeout(() => {
      setIntroDone(true);
      setRingTransition(true);
    }, RING_INTRO_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open, minutes, initialRemaining, initialPaused, isRestore, startKey]);

  // 0초 완료 → 목표달성으로 자동 이동 (닫기/중도와 구분)
  useEffect(() => {
    if (!open || !introDone || remaining !== 0 || completedRef.current) return;

    completedRef.current = true;
    clearFocusTimerSession();
    markFocusComplete(minutes);
    onCompleteRef.current?.(minutes);
  }, [open, introDone, remaining, minutes]);

  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 뒤로가기(스와이프) → 팝업만 닫기 (배경 라우트 이동 방지)
  useEffect(() => {
    if (!open) return;

    const alreadyOurs =
      typeof window.history.state === "object" &&
      window.history.state !== null &&
      "focusTimer" in window.history.state;

    if (!alreadyOurs) {
      window.history.pushState(HISTORY_STATE, "");
    }

    const onPopState = () => {
      if (skipPopRef.current) {
        skipPopRef.current = false;
        return;
      }
      clearFocusTimerSession();
      onCloseRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [open]);

  // 화면 이탈 → 일시정지 + 저장
  useEffect(() => {
    if (!open) return;

    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;

      setPaused(true);
      saveFocusTimerSession({
        minutes,
        remainingSeconds: remainingRef.current,
        paused: true,
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [open, minutes]);

  // 카운트다운 (인트로 끝난 뒤에만)
  useEffect(() => {
    if (!open || paused || !introDone || remaining <= 0) return;

    const tickMs = 1000 / DEV_TIMER_SPEED;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearFocusTimerSession();
          return 0;
        }
        const next = prev - 1;
        saveFocusTimerSession({
          minutes,
          remainingSeconds: next,
          paused: false,
        });
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [open, paused, minutes, introDone, remaining]);

  const handleClose = () => {
    clearFocusTimerSession();
    const isOurState =
      typeof window.history.state === "object" &&
      window.history.state !== null &&
      "focusTimer" in window.history.state;

    if (isOurState) {
      skipPopRef.current = true;
      window.history.back();
    }
    onClose();
  };

  const handleTogglePause = () => {
    setPaused((prev) => {
      const next = !prev;
      if (next) {
        setPauseStep("reason");
        setPauseReasonId(undefined);
        setPauseModalOpen(true);
      } else {
        setPauseModalOpen(false);
        setPauseStep("reason");
        setPauseReasonId(undefined);
      }
      saveFocusTimerSession({
        minutes,
        remainingSeconds: remainingRef.current,
        paused: next,
      });
      return next;
    });
  };

  const resetPauseModal = () => {
    setPauseModalOpen(false);
    setPauseStep("reason");
    setPauseReasonId(undefined);
  };

  const handleClosePauseModal = () => {
    resetPauseModal();
  };

  const handleSelectPauseReason = (id: string) => {
    setPauseReasonId(id);
    // 책 안 맞음 / 기타 → 상세 입력, 그 외 → 바로 복귀 안내
    if (id === "wrong-book" || id === "other") {
      setPauseStep("detail");
      return;
    }
    setPauseStep("confirm");
  };

  const handleSubmitPauseDetail = (_text: string) => {
    // TODO: 사유(reasonId) + 상세(_text) API 연동
    void pauseReasonId;
    setPauseStep("confirm");
  };

  const handleStopReading = () => {
    resetPauseModal();
    handleClose();
  };

  const handleResumeReading = () => {
    resetPauseModal();
    setPaused(false);
    saveFocusTimerSession({
      minutes,
      remainingSeconds: remainingRef.current,
      paused: false,
    });
  };

  if (!open) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const playIntro = !isRestore && !introDone;
  const tickMs = 1000 / DEV_TIMER_SPEED;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-timer-title"
      className="fixed inset-0 z-[110] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-[#4451a0]"
    >
      {/* 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={timerBg}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-center px-5 pt-[30px]">
        <h1 id="focus-timer-title" className="text-center text-h3 text-white">
          오롯이 글에 집중하는 시간
        </h1>
        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="absolute right-5 flex size-[26px] items-center justify-center"
        >
          <img
            src={iconClose}
            alt=""
            className="size-[14.5px] object-contain"
          />
        </button>
      </header>

      {/* 타이머 */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 pb-[calc(40px+env(safe-area-inset-bottom))]">
        <div className="relative flex size-[272px] items-center justify-center">
          <img
            src={timerGlow}
            alt=""
            aria-hidden
            className="pointer-events-none absolute size-[272px] object-contain"
          />

          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="pointer-events-none absolute inset-0 -rotate-90"
            aria-hidden
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(239,240,249,0.18)"
              strokeWidth={RING_STROKE}
            />
            <circle
              key={playIntro ? `intro-${startKey}` : `run-${startKey}`}
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(239,240,249,0.86)"
              strokeWidth={RING_STROKE}
              strokeLinecap="butt"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={playIntro ? RING_CIRCUMFERENCE : dashOffset}
              className={
                !playIntro && ringTransition
                  ? "transition-[stroke-dashoffset] linear"
                  : undefined
              }
              style={
                playIntro
                  ? {
                      animation: `focus-timer-ring-intro ${RING_INTRO_MS}ms linear forwards`,
                    }
                  : ringTransition
                    ? { transitionDuration: `${tickMs}ms` }
                    : undefined
              }
            />
          </svg>

          <div className="relative flex flex-col items-center bottom-3">
            <div
              className="flex h-[96px] items-center justify-center text-white"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="inline-block w-[2ch] text-center text-[55px] font-medium leading-none [font-variant-numeric:tabular-nums]">
                {pad2(mins)}
              </span>
              <span className="inline-block w-[1ch] text-center text-[55px] font-medium leading-none">
                :
              </span>
              <span className="inline-block w-[2ch] text-center text-[55px] font-medium leading-none [font-variant-numeric:tabular-nums]">
                {pad2(secs)}
              </span>
            </div>

            <p className="mt-[-4px] max-w-[202px] text-center text-body2 text-gray-300">
              화면을 닫으면 타이머가 초기화됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTogglePause}
          className="flex items-center gap-1.5 rounded-[24px] bg-primary-500 px-5 py-2.5"
        >
          <img
            src={paused ? iconPlay : iconPause}
            alt=""
            className="size-6 object-contain"
          />
          <span className="text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-100">
            {paused ? "일시 정지됨" : "잠시 멈추기"}
          </span>
        </button>
      </div>

      <Modal
        open={pauseModalOpen && pauseStep === "reason"}
        title="잠시 멈추셨네요!"
        description={
          <>
            독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을
            <br />
            만들어드릴게요.
          </>
        }
        onClose={handleClosePauseModal}
      >
        <PauseReasonOptions onSelect={handleSelectPauseReason} />
      </Modal>

      <Modal
        open={pauseModalOpen && pauseStep === "detail"}
        title={
          pauseReasonId === "other"
            ? "멈춘 이유를 자세히 알려주세요!"
            : "어떤점이 아쉬웠나요?"
        }
        description={
          pauseReasonId === "other" ? (
            <>
              독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을
              <br />
              만들어드릴게요.
            </>
          ) : (
            "자세히 알려주시면 다음 책 추천의 기준으로 삼을게요."
          )
        }
        onClose={handleClosePauseModal}
        showClose={false}
      >
        <PauseDetailForm
          key={pauseReasonId ?? "detail"}
          placeholder={
            pauseReasonId === "other"
              ? "(예시: 집중이 잘 안 돼요, 시간이 부족해요)"
              : "(예시: 내용이 너무 어려워요, 문체가 안 맞아요)"
          }
          onSubmit={handleSubmitPauseDetail}
        />
      </Modal>

      <Modal
        open={pauseModalOpen && pauseStep === "confirm"}
        variant="alert"
        status="info"
        title="읽다만 기록이 있어요"
        description="이전에 측정하던 집중 시간이 저장되어 있습니다."
        onClose={handleResumeReading}
        actions={[
          { label: "중단하기", onClick: handleStopReading, variant: "outline" },
          {
            label: "이어서 읽기",
            onClick: handleResumeReading,
            variant: "primary",
          },
        ]}
      />
    </div>
  );
}
