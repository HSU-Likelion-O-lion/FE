import { Navigate, useNavigate } from "react-router-dom";
import splashBg from "../assets/onboarding/splash-bg.png";
import splashLogo from "../assets/onboarding/splash-logo.svg";
import { isOnboardingDone } from "../lib/onboarding";

/** 앱 첫 화면 (Figma 176:2503) — ≥431px 에서는 full-bleed */
export default function OnboardingSplashPage() {
  const navigate = useNavigate();

  if (isOnboardingDone()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden min-[431px]:max-w-none">
      <img
        src={splashBg}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgba(74,86,157,0.63)]"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5">
        <img
          src={splashLogo}
          alt="쓰담"
          className="h-[80px] w-[117px] object-contain min-[431px]:h-[110px] min-[431px]:w-[160px]"
        />
        <p className="mt-5 text-center text-[18px] tracking-[-0.025em] text-primary-100 min-[431px]:mt-6 min-[431px]:text-[22px]">
          마음을 채우는 책 읽기
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full shrink-0 px-10 pb-[calc(48px+env(safe-area-inset-bottom))] min-[431px]:max-w-[400px] min-[431px]:px-0 min-[431px]:pb-16">
        <button
          type="button"
          onClick={() => navigate("/onboarding")}
          className="relative flex h-[54px] w-full items-center justify-center rounded-2xl bg-[rgba(253,253,255,0.23)] text-button1 font-semibold text-white shadow-[inset_0_-2px_4px_rgba(241,241,241,0.43),inset_0_4px_2px_rgba(255,255,255,0.16)]"
        >
          시작하기
        </button>
      </div>
    </main>
  );
}
