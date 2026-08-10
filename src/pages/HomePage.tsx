import { Navigate } from "react-router-dom";
import { isOnboardingDone } from "../lib/onboarding";
import OnboardingSplashPage from "./OnboardingSplashPage";

/** `/` 진입 — 온보딩 완료 시 로그인, 아니면 스플래시 */
export default function HomePage() {
  if (isOnboardingDone()) {
    return <Navigate to="/login" replace />;
  }
  return <OnboardingSplashPage />;
}
