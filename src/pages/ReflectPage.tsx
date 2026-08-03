import { useLayoutEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import StreakBadgeOverlay from "../components/mate/StreakBadgeOverlay";
import { hasSevenDayStreak } from "../components/mate/streak";
import {
  clearFocusComplete,
  loadFocusComplete,
} from "../components/mate/FocusTimerPopup";
import iconInfo from "../assets/mate/icon-info.svg";

const MAX_LENGTH = 300;
const TEXTAREA_MIN_HEIGHT = 55;

const MOCK_PROMPT = {
  before: "책을 읽으며 '불안'에 대해 생각해보셨나요?\n당신을 가장 ",
  highlight: "위로하는 작은 행동",
  after: "은\n무엇인가요?",
};

type ShareStep = "share" | "private-done" | "shelter-done";

export default function ReflectPage() {
  const navigate = useNavigate();
  const complete = loadFocusComplete();
  const [text, setText] = useState("");
  const [shareStep, setShareStep] = useState<ShareStep | null>(null);
  const [streakOpen, setStreakOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT)}px`;
  }, [text]);

  if (!complete) {
    return <Navigate to="/mate" replace />;
  }

  const leaveFlow = () => {
    clearFocusComplete();
    setShareStep(null);
    setStreakOpen(false);
    navigate("/mate", { replace: true });
  };

  /** 결과 모달 계속하기 — 7일 연속이면 배지 오버레이, 아니면 메이트로 */
  const handleContinueAfterSave = () => {
    setShareStep(null);
    if (hasSevenDayStreak()) {
      setStreakOpen(true);
      return;
    }
    leaveFlow();
  };

  const canSubmit = text.trim().length > 0;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
      <section className="flex flex-1 flex-col overflow-y-auto px-5 pt-[45px] pb-[140px]">
        <div className="flex items-center gap-1 py-1">
          <img src={iconInfo} alt="" className="size-5 object-contain" />
          <p className="text-body2 text-primary-500">질문이 도착했어요!</p>
        </div>

        <h1 className="mt-5 whitespace-pre-wrap text-h2 text-gray-900">
          {MOCK_PROMPT.before}
          <span className="text-primary-400">{MOCK_PROMPT.highlight}</span>
          {MOCK_PROMPT.after}
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

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[430px] flex-col items-center bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2">
        <Button
          text="기록남기기"
          variant="primary"
          size="h-[54px] w-full px-5 py-3.5"
          disabled={!canSubmit}
          onClick={() => setShareStep("share")}
        />
        <button
          type="button"
          onClick={leaveFlow}
          className="mt-4 text-[14px] leading-normal text-gray-400 underline"
        >
          오늘은 건너뛰기
        </button>
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
            onClick: () => setShareStep("private-done"),
          },
          {
            label: "쉼터에 남기기",
            variant: "primary",
            onClick: () => setShareStep("shelter-done"),
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
