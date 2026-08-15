import { useEffect, useRef, useState, type CSSProperties } from "react";
import timerBg from "../../assets/mate/timer-bg.png";
import timerGlow from "../../assets/mate/timer-glow.svg";
import iconClose from "../../assets/mate/icon-close.svg";
import iconPause from "../../assets/mate/icon-pause.svg";
import iconPlay from "../../assets/mate/icon-play.svg";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import Modal from "../Modal";
import WebGnb from "../WebGnb";
import { PauseReasonOptions } from "../ModalOptionList";
import PauseDetailForm from "./PauseDetailForm";
import { markDailyReadingComplete } from "../../data/dailyReadingStore";
import {
  ApiError,
  abandonReadingSession,
  completeReadingSession,
  heartbeatReadingSession,
  recordInterruption,
  resumeReadingSession,
  startReadingSession,
  type InterruptionReason,
  type TargetMinutes,
} from "../../api";
import { saveLastSession } from "../../api/sessionDraft";

const RING_MOBILE = { size: 272, stroke: 10, minSize: 180 } as const;
const RING_WEB = { size: 350, stroke: 10, minSize: 200 } as const;
/** 모바일 타이틀 헤더 최소 높이 */
const HEADER_MOBILE = 74;
const HEARTBEAT_INTERVAL_MS = 15_000;

function ringMetrics(size: number, stroke: number) {
  const radius = (size - stroke) / 2;
  return {
    size,
    stroke,
    radius,
    circumference: 2 * Math.PI * radius,
  };
}

function clampRingSize(available: number, isDesktop: boolean) {
  const spec = isDesktop ? RING_WEB : RING_MOBILE;
  const gap = isDesktop ? 35 : 32;
  const button = isDesktop ? 55 : 44;
  /** contentRef clientHeight에 포함된 하단 패딩 */
  const bottomPad = isDesktop ? 64 : 40;
  const forRing = available - gap - button - bottomPad;
  return Math.round(Math.min(spec.size, Math.max(spec.minSize, forRing)));
}

const FOCUS_TIMER_KEY = "sseudam:focus-timer";
/** 타이머 0초 완료 시에만 목표달성/생각적기 라우트 진입 가능 */
const FOCUS_COMPLETE_KEY = "sseudam:focus-complete";
const HISTORY_STATE = { focusTimer: true } as const;
/** 시작 시 링이 비움→채움으로 한 바퀴 도는 시간 */
const RING_INTRO_MS = 500;

/**
 * 개발용 타이머 배속 (1 = 실시간).
 */
const DEV_TIMER_SPEED = 1;
// const DEV_TIMER_SPEED = 100;

export type FocusTimerSession = {
  minutes: number;
  remainingSeconds: number;
  paused: boolean;
  sessionId?: number;
  userBookId?: number;
};

export type FocusCompleteSession = {
  minutes: number;
};

function mapPauseReasonToApi(id?: string): InterruptionReason {
  switch (id) {
    case "TASTE_MISMATCH":
    case "wrong-book":
      return "TASTE_MISMATCH";
    case "NOTIFICATION":
    case "notification":
      return "NOTIFICATION";
    case "EBOOK_SWITCH":
    case "ebook":
      return "EBOOK_SWITCH";
    case "OTHER":
    case "other":
      return "OTHER";
    case "CONTINUE":
      return "CONTINUE";
    case "UNAVOIDABLE":
    default:
      return "UNAVOIDABLE";
  }
}

function isOtherPauseReason(id?: string) {
  return id === "OTHER" || id === "other";
}

function needsPauseDetail(id?: string) {
  return (
    id === "TASTE_MISMATCH" ||
    id === "wrong-book" ||
    isOtherPauseReason(id)
  );
}

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
  /** 독서 세션을 시작할 서재 책 id */
  userBookId?: number;
  /** 복구 시 API sessionId */
  sessionId?: number;
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
  userBookId,
  sessionId: sessionIdProp,
  initialRemaining,
  initialPaused = false,
  startKey = 0,
  onClose,
  onComplete,
}: FocusTimerPopupProps) {
  const isDesktop = useIsDesktop();
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
  const [pauseDetailText, setPauseDetailText] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [ringSize, setRingSize] = useState<number>(
    isDesktop ? RING_WEB.size : RING_MOBILE.size,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const ring = ringMetrics(
    ringSize,
    isDesktop ? RING_WEB.stroke : RING_MOBILE.stroke,
  );
  const timeFontPx = Math.round(
    ring.size * (isDesktop ? 88 / RING_WEB.size : 55 / RING_MOBILE.size),
  );
  const colonFontPx = Math.round(
    ring.size * (isDesktop ? 66 / RING_WEB.size : 55 / RING_MOBILE.size),
  );

  const remainingRef = useRef(remaining);
  const pausedRef = useRef(paused);
  const skipPopRef = useRef(false);
  const completedRef = useRef(false);
  const sessionIdRef = useRef<number | undefined>(sessionIdProp);
  const userBookIdRef = useRef(userBookId);
  const pauseDetailRef = useRef("");
  const onCloseRef = useRef(onClose);
  const onCompleteRef = useRef(onComplete);
  onCloseRef.current = onClose;
  onCompleteRef.current = onComplete;
  userBookIdRef.current = userBookId;

  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      setRingSize(clampRingSize(el.clientHeight, isDesktop));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, isDesktop]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const persistSession = (
    next: Partial<FocusTimerSession> &
      Pick<FocusTimerSession, "minutes" | "remainingSeconds" | "paused">,
  ) => {
    saveFocusTimerSession({
      ...next,
      sessionId: next.sessionId ?? sessionIdRef.current,
      userBookId: next.userBookId ?? userBookIdRef.current,
    });
  };

  const openPauseReasonModal = () => {
    setPauseStep("reason");
    setPauseReasonId(undefined);
    setPauseDetailText("");
    pauseDetailRef.current = "";
    setPauseModalOpen(true);
  };

  // 팝업 닫히면 사유 모달도 닫기
  useEffect(() => {
    if (!open) {
      setPauseModalOpen(false);
      setPauseStep("reason");
      setPauseReasonId(undefined);
      setPauseDetailText("");
      pauseDetailRef.current = "";
      setSessionReady(false);
      sessionIdRef.current = undefined;
    }
  }, [open]);

  // API 세션 시작 / 복구
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let introTimeoutId: number | undefined;
    completedRef.current = false;
    setSessionReady(false);

    const nextRemaining = initialRemaining ?? minutes * 60;
    setRemaining(nextRemaining);

    const bootstrap = async () => {
      try {
        if (isRestore) {
          if (sessionIdProp) {
            sessionIdRef.current = sessionIdProp;
            try {
              const resumed = await resumeReadingSession(sessionIdProp);
              if (cancelled) return;
              const remainingSec = resumed.remainingSeconds || nextRemaining;
              setRemaining(remainingSec);
              remainingRef.current = remainingSec;
            } catch {
              if (cancelled) return;
              /* resume 실패 시 로컬 remaining 유지 */
            }
          }

          const nextPaused = initialPaused ?? true;
          setPaused(nextPaused);
          pausedRef.current = nextPaused;
          setIntroDone(true);
          setRingTransition(true);
          persistSession({
            minutes,
            remainingSeconds: remainingRef.current,
            paused: nextPaused,
            sessionId: sessionIdRef.current ?? sessionIdProp,
            userBookId,
          });
          setSessionReady(true);
          if (nextPaused) openPauseReasonModal();
          return;
        }

        if (!userBookId) {
          alert("집중할 책을 찾을 수 없어요.");
          onCloseRef.current();
          return;
        }

        const started = await startReadingSession(
          userBookId,
          minutes as TargetMinutes,
        );
        if (cancelled) return;
        sessionIdRef.current = started.sessionId;
        setPaused(false);
        pausedRef.current = false;
        setIntroDone(false);
        setRingTransition(false);
        persistSession({
          minutes,
          remainingSeconds: nextRemaining,
          paused: false,
          sessionId: started.sessionId,
          userBookId,
        });
        setSessionReady(true);

        introTimeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setIntroDone(true);
          setRingTransition(true);
        }, RING_INTRO_MS);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "독서 세션을 시작하지 못했어요.";
        alert(message);
        clearFocusTimerSession();
        onCloseRef.current();
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      if (introTimeoutId != null) window.clearTimeout(introTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, minutes, initialRemaining, initialPaused, isRestore, startKey, sessionIdProp, userBookId]);

  // heartbeat
  useEffect(() => {
    if (!open || !sessionReady || paused || !introDone) return;
    const sid = sessionIdRef.current;
    if (!sid) return;

    const send = () => {
      const elapsed = Math.max(0, totalSeconds - remainingRef.current);
      void heartbeatReadingSession(sid, elapsed).catch(() => {
        /* 네트워크 일시 실패는 무시 */
      });
    };

    send();
    const id = window.setInterval(send, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [open, sessionReady, paused, introDone, totalSeconds]);

  // 0초 완료 → API complete + 목표달성 이동
  useEffect(() => {
    if (
      !open ||
      !sessionReady ||
      !introDone ||
      remaining !== 0 ||
      completedRef.current
    ) {
      return;
    }

    completedRef.current = true;
    const sid = sessionIdRef.current;
    clearFocusTimerSession();

    (async () => {
      try {
        if (sid) {
          const result = await completeReadingSession(sid);
          saveLastSession({
            sessionId: sid,
            aiQuestion: result.aiQuestion,
            userBookId: userBookIdRef.current,
          });
        }
        markFocusComplete(minutes);
        markDailyReadingComplete(minutes);
        onCompleteRef.current?.(minutes);
      } catch (err) {
        completedRef.current = false;
        const message =
          err instanceof ApiError
            ? err.message
            : "세션 완료 처리에 실패했어요.";
        alert(message);
      }
    })();
  }, [open, sessionReady, introDone, remaining, minutes]);

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
      const sid = sessionIdRef.current;
      if (sid && !completedRef.current) {
        void abandonReadingSession(sid).catch(() => {});
      }
      clearFocusTimerSession();
      onCloseRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [open]);

  // 화면 이탈 → 일시정지 + 저장 / 복귀 시 멈춘 상태면 사유 모달
  useEffect(() => {
    if (!open) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setPaused(true);
        pausedRef.current = true;
        persistSession({
          minutes,
          remainingSeconds: remainingRef.current,
          paused: true,
        });
        return;
      }

      if (document.visibilityState === "visible" && pausedRef.current) {
        openPauseReasonModal();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [open, minutes]);

  // 카운트다운 (인트로·세션 준비 끝난 뒤에만)
  useEffect(() => {
    if (!open || !sessionReady || paused || !introDone || remaining <= 0) return;

    const tickMs = 1000 / DEV_TIMER_SPEED;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearFocusTimerSession();
          return 0;
        }
        const next = prev - 1;
        persistSession({
          minutes,
          remainingSeconds: next,
          paused: false,
        });
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [open, sessionReady, paused, minutes, introDone, remaining]);

  const abandonIfNeeded = async () => {
    const sid = sessionIdRef.current;
    if (!sid || completedRef.current) return;
    try {
      await abandonReadingSession(sid);
    } catch {
      /* 이미 종료된 세션 등 — 무시 */
    }
  };

  const handleClose = () => {
    void abandonIfNeeded();
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
      pausedRef.current = next;
      if (next) {
        openPauseReasonModal();
      } else {
        setPauseModalOpen(false);
        setPauseStep("reason");
        setPauseReasonId(undefined);
      }
      persistSession({
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
    setPauseDetailText("");
    pauseDetailRef.current = "";
  };

  const handleClosePauseModal = () => {
    resetPauseModal();
  };

  const handleSelectPauseReason = (id: string) => {
    setPauseReasonId(id);
    if (needsPauseDetail(id)) {
      setPauseStep("detail");
      return;
    }
    setPauseStep("confirm");
  };

  const handleSubmitPauseDetail = (text: string) => {
    setPauseDetailText(text);
    pauseDetailRef.current = text;
    setPauseStep("confirm");
  };

  const postInterruption = async (
    reason: InterruptionReason,
    customText?: string,
  ) => {
    const sid = sessionIdRef.current;
    if (!sid) {
      console.warn("[interruption] sessionId 없음 — API 스킵");
      return;
    }
    await recordInterruption(sid, {
      reason,
      customText:
        reason === "OTHER"
          ? customText?.trim() || undefined
          : undefined,
      occurredAt: new Date().toISOString(),
    });
  };

  const handleStopReading = async () => {
    const reason = mapPauseReasonToApi(pauseReasonId);
    const customText = needsPauseDetail(pauseReasonId)
      ? pauseDetailRef.current || pauseDetailText || undefined
      : undefined;

    try {
      const sid = sessionIdRef.current;
      if (sid) {
        await postInterruption(reason, customText);
        await abandonReadingSession(sid);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "세션 중단에 실패했어요.";
      alert(message);
    }

    resetPauseModal();
    handleClose();
  };

  const handleResumeReading = async () => {
    const sid = sessionIdRef.current;
    try {
      if (sid) {
        // 이어서 읽기 → CONTINUE
        await postInterruption("CONTINUE");
        const resumed = await resumeReadingSession(sid);
        if (typeof resumed.remainingSeconds === "number") {
          setRemaining(resumed.remainingSeconds);
          remainingRef.current = resumed.remainingSeconds;
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "세션 재개에 실패했어요.";
      alert(message);
      return;
    }

    resetPauseModal();
    setPaused(false);
    pausedRef.current = false;
    persistSession({
      minutes,
      remainingSeconds: remainingRef.current,
      paused: false,
    });
  };

  if (!open) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = ring.circumference * (1 - progress);
  const playIntro = !isRestore && !introDone;
  const tickMs = 1000 / DEV_TIMER_SPEED;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-timer-title"
      className="fixed inset-0 z-[110] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-[#4451a0] min-[431px]:max-w-none"
    >
      {/* 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={timerBg}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 hidden bg-[rgba(70,83,162,0.43)] min-[431px]:block" />
      </div>

      {/* 웹 GNB */}
      <div className="relative z-20 shrink-0">
        <WebGnb
          active="center"
          tone="dark"
          onChange={(tab) => {
            if (tab !== "center") handleClose();
          }}
        />
      </div>

      {/* 모바일 헤더 */}
      <header
        className="relative z-20 flex shrink-0 items-center justify-center px-5 pt-[30px] min-[431px]:hidden"
        style={{ minHeight: HEADER_MOBILE }}
      >
        <p className="text-center text-h3 text-white" aria-hidden>
          오롯이 글에 집중하는 시간
        </p>
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
      <h1 id="focus-timer-title" className="sr-only">
        오롯이 글에 집중하는 시간
      </h1>

      {/* 타이머 — 헤더 아래 영역만 사용, 높이에 맞춰 링 스케일, 스크롤 없음 */}
      <div
        ref={contentRef}
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-hidden pb-[calc(40px+env(safe-area-inset-bottom))] min-[431px]:gap-[35px] min-[431px]:pb-16"
      >
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: ring.size, height: ring.size }}
        >
          <img
            src={timerGlow}
            alt=""
            aria-hidden
            className="pointer-events-none absolute object-contain"
            style={{ width: ring.size, height: ring.size }}
          />

          <svg
            width={ring.size}
            height={ring.size}
            viewBox={`0 0 ${ring.size} ${ring.size}`}
            className="pointer-events-none absolute inset-0 -rotate-90"
            aria-hidden
            style={
              {
                "--ring-c": ring.circumference,
              } as CSSProperties
            }
          >
            <circle
              cx={ring.size / 2}
              cy={ring.size / 2}
              r={ring.radius}
              fill="none"
              stroke="rgba(239,240,249,0.18)"
              strokeWidth={ring.stroke}
            />
            <circle
              key={
                playIntro
                  ? `intro-${startKey}-${ring.size}`
                  : `run-${startKey}-${ring.size}`
              }
              cx={ring.size / 2}
              cy={ring.size / 2}
              r={ring.radius}
              fill="none"
              stroke="rgba(239,240,249,0.86)"
              strokeWidth={ring.stroke}
              strokeLinecap="round"
              strokeDasharray={ring.circumference}
              strokeDashoffset={playIntro ? ring.circumference : dashOffset}
              className={
                !playIntro && ringTransition
                  ? "transition-[stroke-dashoffset] linear"
                  : undefined
              }
              style={
                playIntro
                  ? ({
                      "--ring-c": ring.circumference,
                      animation: `focus-timer-ring-intro ${RING_INTRO_MS}ms linear forwards`,
                    } as CSSProperties)
                  : ringTransition
                    ? { transitionDuration: `${tickMs}ms` }
                    : undefined
              }
            />
          </svg>

          <div className="relative bottom-3 flex flex-col items-center min-[431px]:bottom-0">
            <div
              className="flex items-center justify-center text-white"
              style={{
                fontFamily: "'Poppins', sans-serif",
                height: Math.round(ring.size * (isDesktop ? 120 / 350 : 96 / 272)),
              }}
            >
              <span
                className="inline-block w-[2ch] text-center font-medium leading-none [font-variant-numeric:tabular-nums]"
                style={{ fontSize: timeFontPx }}
              >
                {pad2(mins)}
              </span>
              <span
                className="inline-block w-[1ch] text-center font-medium leading-none"
                style={{ fontSize: colonFontPx }}
              >
                :
              </span>
              <span
                className="inline-block w-[2ch] text-center font-medium leading-none [font-variant-numeric:tabular-nums]"
                style={{ fontSize: timeFontPx }}
              >
                {pad2(secs)}
              </span>
            </div>

            <p className="mt-[-4px] max-w-[202px] text-center text-body2 text-gray-300 min-[431px]:mt-2 min-[431px]:max-w-[280px] min-[431px]:text-[16.8px]">
              {sessionReady
                ? "화면을 닫으면 타이머가 초기화됩니다."
                : "세션을 준비하는 중…"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTogglePause}
          disabled={!sessionReady}
          className="flex shrink-0 items-center gap-1.5 rounded-[24px] bg-primary-500 px-5 py-2.5 min-[431px]:h-[55px] min-[431px]:rounded-[28.8px] min-[431px]:px-6 min-[431px]:py-3 disabled:opacity-60"
        >
          <img
            src={paused ? iconPlay : iconPause}
            alt=""
            className="size-6 object-contain min-[431px]:size-[28.8px]"
          />
          <span className="text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-100 min-[431px]:text-[19.2px]">
            {paused ? "일시 정지됨" : "잠시 멈추기"}
          </span>
        </button>
      </div>

      <Modal
        open={pauseModalOpen && pauseStep === "reason"}
        title="잠시 멈추셨네요!"
        description={
          isDesktop ? (
            "독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을 만들어드릴게요."
          ) : (
            <>
              독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을
              <br />
              만들어드릴게요.
            </>
          )
        }
        onClose={handleClosePauseModal}
      >
        <PauseReasonOptions onSelect={handleSelectPauseReason} />
      </Modal>

      <Modal
        open={pauseModalOpen && pauseStep === "detail"}
        title={
          isOtherPauseReason(pauseReasonId)
            ? "멈춘 이유를 자세히 알려주세요!"
            : "어떤 점이 아쉬웠나요?"
        }
        description={
          isOtherPauseReason(pauseReasonId) ? (
            isDesktop ? (
              "독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을 만들어드릴게요."
            ) : (
              <>
                독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을
                <br />
                만들어드릴게요.
              </>
            )
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
            isOtherPauseReason(pauseReasonId)
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
