import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../../api/authStorage";
import { isOnboardingDone } from "../../lib/onboarding";

/** 미로그인 시 온보딩/로그인 중 어디로 보낼지 */
export function guestEntryPath(): string {
  return isOnboardingDone() ? "/login" : "/";
}

/** 알 수 없는 URL — 로그인 여부에 따라 진입점으로 */
export function FallbackRedirect() {
  if (isLoggedIn()) {
    return <Navigate to="/mate" replace />;
  }
  return <Navigate to={guestEntryPath()} replace />;
}

/** 로그인 필요 — 미인증이면 온보딩 또는 로그인으로 */
export function RequireAuth() {
  if (!isLoggedIn()) {
    return <Navigate to={guestEntryPath()} replace />;
  }
  return <Outlet />;
}

type GuestGateProps = {
  /** onboarding: 스플래시·가이드 / auth: 로그인·회원가입 */
  area: "onboarding" | "auth";
};

/**
 * 게스트 전용.
 * - 로그인됨 → /mate
 * - 온보딩 미완료인데 auth 접근 → /
 * - 온보딩 완료인데 onboarding 접근 → /login
 */
export function GuestOnly({ area }: GuestGateProps) {
  const location = useLocation();

  if (isLoggedIn()) {
    return <Navigate to="/mate" replace state={{ from: location }} />;
  }

  if (area === "auth" && !isOnboardingDone()) {
    return <Navigate to="/" replace />;
  }

  if (area === "onboarding" && isOnboardingDone()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
