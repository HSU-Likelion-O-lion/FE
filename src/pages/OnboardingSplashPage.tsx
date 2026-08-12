import { Navigate, useNavigate } from "react-router-dom";
import splashBg from "../assets/onboarding/splash-bg.png";
import webBg from "../assets/common/web-bg.png";
import logoWhite from "../assets/common/logo-white.svg";
import { isOnboardingDone } from "../lib/onboarding";

const startButtonClassName =
  "relative flex h-[54px] w-full items-center justify-center rounded-2xl bg-[rgba(253,253,255,0.23)] text-button1 font-semibold text-white shadow-[inset_0_-2px_4px_rgba(241,241,241,0.43),inset_0_4px_2px_rgba(255,255,255,0.16)]";

/** 앱 첫 화면 (Figma 176:2503) — 웹 ≥431px (Figma 647:5018) */
export default function OnboardingSplashPage() {
  const navigate = useNavigate();

  if (isOnboardingDone()) {
    return <Navigate to="/login" replace />;
  }

  const goOnboarding = () => navigate("/onboarding");

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden min-[431px]:max-w-none">
      <picture>
        <source media="(min-width: 431px)" srcSet={webBg} />
        <img
          src={splashBg}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
      </picture>

      {/* 모바일 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 min-[431px]:hidden">
        <img
          src={logoWhite}
          alt="쓰담"
          className="h-[80px] w-[117px] object-contain"
        />
        <p className="mt-5 text-center text-[18px] tracking-[-0.025em] text-primary-100">
          마음을 채우는 책 읽기
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full shrink-0 px-10 pb-[calc(48px+env(safe-area-inset-bottom))] min-[431px]:hidden">
        <button
          type="button"
          onClick={goOnboarding}
          className={startButtonClassName}
        >
          시작하기
        </button>
      </div>

      {/* 웹 — 로고·카피·버튼 클러스터를 화면 정중앙에 고정 */}
      <div className="absolute inset-0 z-10 hidden items-center justify-center min-[431px]:flex">
        <div className="flex w-[313px] flex-col items-center">
          <img
            src={logoWhite}
            alt="쓰담"
            className="h-[110px] w-[160px] object-contain"
          />
          <p className="mt-6 text-center text-[22px] tracking-[-0.025em] text-primary-100">
            마음을 채우는 책 읽기
          </p>
          <button
            type="button"
            onClick={goOnboarding}
            className={`${startButtonClassName} mt-[113px]`}
          >
            시작하기
          </button>
        </div>
      </div>
    </main>
  );
}
