import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import WebGnb from "../components/WebGnb";
import StreakBadgeOverlay from "../components/mate/StreakBadgeOverlay";
import {
  achievedDatesFromWeek,
  hasSevenDayStreak,
} from "../components/mate/streak";
import {
  clearFocusComplete,
  loadFocusComplete,
} from "../components/mate/FocusTimerPopup";
import {
  ApiError,
  createReflection,
  getStreaks,
} from "../api";
import {
  clearLastSession,
  loadLastSession,
} from "../api/sessionDraft";
import iconInfo from "../assets/mate/icon-info.svg";
import iconInfoWeb from "../assets/mate/reflect/icon-info-web.svg";
import iconShareCheck from "../assets/mate/reflect/icon-share-check.svg";
import stepDot1 from "../assets/mate/reflect/step-dot-1.svg";
import stepDot2 from "../assets/mate/reflect/step-dot-2.svg";
import stepDot3 from "../assets/mate/reflect/step-dot-3.svg";

const MAX_LENGTH = 300;
const TEXTAREA_MIN_HEIGHT = 55;
const TEXTAREA_MIN_HEIGHT_WEB = 128;

type ShareStep = "share" | "private-done" | "shelter-done";

export default function ReflectPage() {
  const navigate = useNavigate();
  const complete = loadFocusComplete();
  const lastSession = loadLastSession();
  const [text, setText] = useState("");
  const [shareToShelter, setShareToShelter] = useState(true);
  const [shareStep, setShareStep] = useState<ShareStep | null>(null);
  const [streakOpen, setStreakOpen] = useState(false);
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaWebRef = useRef<HTMLTextAreaElement>(null);

  const aiQuestion =
    lastSession?.aiQuestion?.trim() ||
    "책을 읽으며 떠오른 생각을 자유롭게 적어보세요.";

  useEffect(() => {
    let cancelled = false;
    getStreaks()
      .then((data) => {
        if (!cancelled) {
          setStreakDates(achievedDatesFromWeek(data.week));
        }
      })
      .catch(() => {
        /* streak 배지는 선택적 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const syncHeight = (el: HTMLTextAreaElement | null, min: number) => {
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, min)}px`;
    };
    syncHeight(textareaRef.current, TEXTAREA_MIN_HEIGHT);
    syncHeight(textareaWebRef.current, TEXTAREA_MIN_HEIGHT_WEB);
  }, [text]);

  if (!complete && !lastSession) {
    return <Navigate to="/mate" replace />;
  }

  const leaveFlow = () => {
    clearFocusComplete();
    clearLastSession();
    setShareStep(null);
    setStreakOpen(false);
    navigate("/mate", { replace: true });
  };

  /** 결과 모달 계속하기 — 7일 연속이면 배지 오버레이, 아니면 메이트로 */
  const handleContinueAfterSave = () => {
    setShareStep(null);
    if (hasSevenDayStreak(streakDates)) {
      setStreakOpen(true);
      return;
    }
    leaveFlow();
  };

  const canSubmit = text.trim().length > 0 && !submitting;

  const submitReflection = async (nextStep: ShareStep) => {
    if (!canSubmit) return;
    const session = loadLastSession();
    if (!session?.sessionId) {
      alert("세션 정보를 찾을 수 없어요. 메이트에서 다시 시작해 주세요.");
      navigate("/mate", { replace: true });
      return;
    }

    setSubmitting(true);
    try {
      await createReflection(session.sessionId, text.trim());
      clearLastSession();
      clearFocusComplete();
      setShareStep(nextStep);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "생각 기록 저장에 실패했어요.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMobile = () => {
    if (!canSubmit) return;
    setShareStep("share");
  };

  const handleSubmitWeb = () => {
    void submitReflection(shareToShelter ? "shelter-done" : "private-done");
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white min-[431px]:max-w-none min-[431px]:bg-gray-50">
      <div className="shrink-0">
        <WebGnb active="center" />
      </div>

      {/* —— 모바일 —— */}
      <div className="flex min-h-0 flex-1 flex-col min-[431px]:hidden">
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-[45px] pb-[140px]">
          <div className="flex items-center gap-1 py-1">
            <img src={iconInfo} alt="" className="size-5 object-contain" />
            <p className="text-body2 text-primary-500">질문이 도착했어요!</p>
          </div>

          <h1 className="mt-5 whitespace-pre-wrap text-h2 text-gray-900">
            {aiQuestion}
          </h1>

          <p className="mt-1.5 text-body1 text-gray-500">
            최대 {MAX_LENGTH}자까지 적을 수 있어요.
          </p>

          <div className="mt-8 flex flex-col">
            <textarea
              ref={textareaRef}
              value={text}
              maxLength={MAX_LENGTH}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              placeholder="머릿속을 스쳐간 생각들을 편하게 적어보세요."
              className="min-h-[55px] w-full resize-none overflow-hidden rounded-2xl border border-solid border-gray-100 bg-white px-5 py-4 text-body2 text-gray-800 outline-none placeholder:text-gray-300 focus:border-primary-300"
            />
            <p className="mt-1 text-right text-caption text-[#8e8b7e]">
              ({text.length}/{MAX_LENGTH})
            </p>
          </div>
        </section>

        <div className="shrink-0 flex flex-col items-center bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
          <Button
            text="기록남기기"
            variant="primary"
            size="h-[54px] w-full px-5 py-3.5"
            disabled={!canSubmit}
            onClick={handleSubmitMobile}
          />
          <button
            type="button"
            onClick={leaveFlow}
            className="mt-4 text-[14px] leading-normal text-gray-400 underline"
          >
            오늘은 건너뛰기
          </button>
        </div>
      </div>

      {/* —— 웹: Figma 705:4533 —— */}
      <div className="hidden min-h-0 flex-1 overflow-y-auto min-[431px]:block">
        <div className="mx-auto flex min-h-full w-full max-w-[708px] flex-col px-5 py-10 min-[768px]:px-0">
          <article className="flex min-h-[776px] flex-1 flex-col bg-[#fdfdff] px-8 pb-8 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-[6.72px]">
                <img
                  src={iconInfoWeb}
                  alt=""
                  className="size-[30px] shrink-0 object-contain"
                />
                <p className="text-[23.52px] font-semibold leading-[1.6] tracking-[-0.025em] text-primary-500">
                  질문이 도착했어요!
                </p>
              </div>
            </div>

            <div className="relative mt-3 flex items-start justify-between gap-4">
              <p className="text-body2 text-gray-400">
                생각을 기록하고 메이트와 함께 성장해 보세요.
              </p>
              <div
                className="flex shrink-0 items-center gap-1"
                aria-label="진행 단계 3/3"
              >
                <img
                  src={stepDot1}
                  alt=""
                  className="size-[13.44px] object-contain"
                />
                <img
                  src={stepDot2}
                  alt=""
                  className="size-[13.44px] object-contain"
                />
                <img
                  src={stepDot3}
                  alt=""
                  className="size-[13.44px] object-contain"
                />
              </div>
            </div>

            <div aria-hidden className="mt-8 h-px w-full bg-gray-100" />

            <h1 className="mt-6 whitespace-pre-wrap text-[16px] font-medium leading-[1.5] tracking-[-0.025em] text-gray-900">
              {aiQuestion}
            </h1>

            <p className="mt-2 text-body2 text-gray-400">
              최대 {MAX_LENGTH}자까지 적을 수 있어요.
            </p>

            <div className="mt-5 flex flex-col">
              <textarea
                ref={textareaWebRef}
                value={text}
                maxLength={MAX_LENGTH}
                rows={4}
                onChange={(e) => setText(e.target.value)}
                placeholder="머릿속을 스쳐간 생각들을 편하게 적어보세요."
                className="min-h-[128px] w-full resize-none overflow-hidden rounded-2xl border border-solid border-gray-100 bg-white px-5 py-4 text-body2 text-gray-800 outline-none placeholder:text-gray-300 focus:border-primary-300"
                aria-label="생각 입력"
              />
              <p className="mt-1 text-right text-caption text-[#8e8b7e]">
                ({text.length}/{MAX_LENGTH})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShareToShelter((prev) => !prev)}
              className="mt-6 flex w-full items-start gap-4 rounded-xl bg-gray-50 py-3 pl-4 pr-4 text-left"
              aria-pressed={shareToShelter}
            >
              <span className="relative mt-0.5 flex size-[24.8px] shrink-0 items-center justify-center overflow-hidden">
                {shareToShelter ? (
                  <img
                    src={iconShareCheck}
                    alt=""
                    className="size-full object-contain"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="size-[24.8px] rounded-full border-2 border-solid border-gray-200 bg-white"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-medium leading-[1.5] tracking-[-0.025em] text-gray-900">
                  이 문장을 쉼터에도 남길까요?
                </span>
                <span className="mt-1 block text-body2 text-gray-400">
                  익명의 생각 하나가 누군가에게는 큰 위로가 될 수 있습니다.
                </span>
              </span>
            </button>

            <div className="mt-auto flex gap-4 pt-10">
              <Button
                text="오늘은 건너뛰기"
                variant="outline"
                size="h-[54px] flex-1 px-5 py-3"
                className="border-gray-200 bg-[#fdfdff] text-gray-700"
                onClick={leaveFlow}
              />
              <Button
                text="기록남기기"
                variant="primary"
                size="h-[54px] flex-1 px-5 py-3"
                disabled={!canSubmit}
                onClick={handleSubmitWeb}
              />
            </div>
          </article>
        </div>
      </div>

      <Modal
        open={shareStep === "share"}
        variant="alert"
        status="info"
        title="이 문장을 쉼터에도 남길까요?"
        description="익명의 생각 하나가 누군가에게는 큰 위로가 될 수 있습니다."
        onClose={() => setShareStep(null)}
        closeOnBackdrop
        actions={[
          {
            label: "나만 보기",
            variant: "outline",
            onClick: () => {
              void submitReflection("private-done");
            },
          },
          {
            label: "쉼터에 남기기",
            variant: "primary",
            onClick: () => {
              void submitReflection("shelter-done");
            },
          },
        ]}
      />

      <Modal
        open={shareStep === "private-done"}
        variant="alert"
        status="success"
        title="문장을 서재에 보관하였어요."
        description="당신의 마음이 한 페이지 남겨졌어요."
        onClose={handleContinueAfterSave}
        actions={[
          {
            label: "계속하기",
            variant: "primary",
            onClick: handleContinueAfterSave,
          },
        ]}
      />

      <Modal
        open={shareStep === "shelter-done"}
        variant="alert"
        status="success"
        title="문장을 쉼터에 남겨놨어요."
        description="언젠가 이 문장이 누군가를 미소 짓게 할지도 몰라요."
        onClose={handleContinueAfterSave}
        actions={[
          {
            label: "계속하기",
            variant: "primary",
            onClick: handleContinueAfterSave,
          },
        ]}
      />

      <StreakBadgeOverlay open={streakOpen} onConfirm={leaveFlow} />
    </main>
  );
}
