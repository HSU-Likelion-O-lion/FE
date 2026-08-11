import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import guide1Phone from "../assets/onboarding/guide1-phone.png";
import guide2Phone from "../assets/onboarding/guide2-phone.png";
import guide3Book from "../assets/onboarding/guide3-book.png";
import { completeOnboarding, isOnboardingDone } from "../lib/onboarding";

const SLIDES = [
  {
    title: ["지금 스마트폰을 내려놓고,", "오롯이 집중하세요."],
    body: "짧은 영상이 아닌, 깊이 있는 사유의 시간을 선물합니다.",
  },
  {
    title: ["다미에게 감정을 전달하고", "문장을 선물받아요."],
    body: "내 마음에 맞는 책과 가장 위로가 되는 문장을 추천합니다.",
  },
  {
    title: ["모인 생각들은 한 권의 책이 됩니다."],
    body: ["30개의 짧은 생각이 모이면", "한 권의 에세이로 출판할 수 있습니다."],
  },
] as const;

/** 앱 사용안내 1~3 (Figma 588:5420, 588:5472, 588:5595) — ≥431px full-bleed */
export default function OnboardingGuidePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  if (isOnboardingDone()) {
    return <Navigate to="/login" replace />;
  }

  const finish = () => {
    completeOnboarding();
    navigate("/login", { replace: true });
  };

  const goNext = () => {
    if (step >= SLIDES.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none">
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[430px] flex-1 flex-col items-center pt-[calc(136px+env(safe-area-inset-top))] min-[431px]:max-w-[520px] min-[431px]:pt-[calc(120px+env(safe-area-inset-top))]">
        <div className="relative flex h-[254px] w-[284px] items-center justify-center min-[431px]:h-[320px] min-[431px]:w-[360px]">
          {step === 0 ? <SlideFocusVisual /> : null}
          {step === 1 ? <SlideDamiVisual /> : null}
          {step === 2 ? <SlidePublishVisual /> : null}
        </div>

        <div className="mt-7 w-full px-8 text-center min-[431px]:mt-10">
          <h1 className="text-h2 text-gray-900 min-[431px]:text-[28px] min-[431px]:leading-9">
            {slide.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-2 text-body1 text-gray-500 min-[431px]:mt-3 min-[431px]:text-[18px]">
            {Array.isArray(slide.body)
              ? slide.body.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))
              : slide.body}
          </p>
        </div>
      </div>

      {isLast ? (
        <div className="relative z-10 mx-auto w-full max-w-[430px] shrink-0 px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 min-[431px]:max-w-[400px] min-[431px]:px-0 min-[431px]:pb-16">
          <button
            type="button"
            onClick={finish}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white"
          >
            시작하기
          </button>
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex w-full max-w-[430px] shrink-0 items-center justify-between px-10 pb-[calc(40px+env(safe-area-inset-bottom))] pt-3 min-[431px]:max-w-[520px] min-[431px]:px-0 min-[431px]:pb-16">
          <button
            type="button"
            onClick={finish}
            className="text-[14px] font-medium tracking-[-0.025em] text-primary-500 min-[431px]:text-base"
          >
            건너뛰기
          </button>
          <div className="flex items-center gap-3" aria-hidden>
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full ${
                  i === step ? "bg-primary-500" : "bg-gray-100"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="text-[14px] font-medium tracking-[-0.025em] text-primary-500 min-[431px]:text-base"
          >
            다음
          </button>
        </div>
      )}
    </main>
  );
}

function SlideFocusVisual() {
  return (
    <div className="relative size-full">
      <img
        src={guide1Phone}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-contain object-top"
      />
    </div>
  );
}

function SlideDamiVisual() {
  return (
    <div className="relative size-full">
      <img
        src={guide2Phone}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-contain object-top"
      />
    </div>
  );
}

function SlidePublishVisual() {
  return (
    <div className="relative size-full">
      <img
        src={guide3Book}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-contain object-top"
      />
    </div>
  );
}
