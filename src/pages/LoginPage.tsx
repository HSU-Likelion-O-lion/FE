import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, loginWithKakao } from "../api";
import { getKakaoAccessToken, kakaoErrorMessage } from "../lib/kakaoAuth";
import iconKakao from "../assets/auth/icon-kakao.svg";
import loginMascot from "../assets/auth/login-mascot.png";
import webBg from "../assets/common/web-bg.png";
import logoDark from "../assets/common/logo-dark.svg";
import logoWhite from "../assets/common/logo-white.svg";

/** Figma 603:4503 — 웹 로그인 하단 라디얼 오버레이 (1440×1024) */
const WEB_LOGIN_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1440 1024' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.35 73.6 -103.5 1.8984 706.5 13)'><stop stop-color='rgba(253,253,255,0)' offset='0'/><stop stop-color='rgba(253,253,255,1)' offset='1'/></radialGradient></defs></svg>\")";

/** 로그인 진입 (Figma 445:2099) — 웹 ≥431px (Figma 603:4503) */
export default function LoginPage() {
  const navigate = useNavigate();
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const handleKakaoLogin = async () => {
    if (kakaoLoading) return;
    setKakaoLoading(true);
    try {
      const kakaoAccessToken = await getKakaoAccessToken();
      await loginWithKakao(kakaoAccessToken);
      // 신규/기존 구분 없이 닉네임 설정 화면으로
      navigate("/signup/nickname", { replace: true });
    } catch (err) {
      console.error("[kakao-login]", err);
      const message =
        err instanceof ApiError
          ? err.message || "카카오 로그인에 실패했습니다. 다시 시도해주세요."
          : kakaoErrorMessage(err);
      window.alert(message);
    } finally {
      setKakaoLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none min-[431px]:overflow-y-auto min-[431px]:bg-transparent">
      {/* 웹 배경 + 그라데이션 (스크롤과 분리) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden min-[431px]:fixed min-[431px]:block"
      >
        <img
          src={webBg}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: WEB_LOGIN_GRADIENT }}
        />
      </div>

      {/* 모바일 — Figma 445:2099 위치 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-[calc(40px+env(safe-area-inset-bottom))] pt-[128px] min-[431px]:hidden">
        <div className="flex h-[91px] w-[113px] shrink-0 items-center justify-center">
          <img
            src={logoDark}
            alt="쓰담"
            className="h-[60px] w-[89px] object-contain"
          />
        </div>

        <img
          src={loginMascot}
          alt=""
          className="mt-[62px] h-[104px] w-[133px] object-contain object-bottom opacity-80"
        />

        <p className="mt-3 text-center text-h3 text-gray-900">
          오늘 하루도 고생 많았어요.
          <br />
          <span className="text-primary-500">오롯이 나를 위한 시간</span>을
          가져보세요.
        </p>

        <div className="mt-8 flex w-full max-w-[353px] flex-col gap-3">
          <button
            type="button"
            disabled={kakaoLoading}
            onClick={() => void handleKakaoLogin()}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#fee500] text-button1 font-medium text-gray-800 disabled:opacity-60"
          >
            <img src={iconKakao} alt="" className="size-6 object-contain" />
            {kakaoLoading ? "카카오 로그인 중…" : "카카오로 시작하기"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/login/email")}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary-50 text-button1 font-medium text-primary-500"
          >
            이메일로 로그인
          </button>
        </div>

        <p className="mt-8 text-center text-body2 text-gray-500">
          회원이 아니신가요?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="underline underline-offset-2"
          >
            회원가입
          </button>
        </p>
      </div>

      {/* 웹 — 여유 있으면 세로 중앙, 부족하면 스크롤 */}
      <div className="relative z-10 mx-auto hidden min-h-dvh w-full max-w-[352px] flex-col px-5 pt-16 pb-24 min-[431px]:flex">
        <div className="my-auto flex w-full flex-col items-center pb-8">
          <img
            src={logoWhite}
            alt="쓰담"
            className="h-[95px] w-[140px] object-contain"
          />
          <img
            src={loginMascot}
            alt=""
            className="mt-11 h-[124px] w-[167px] object-contain object-bottom"
          />

          <p className="mt-11 text-center text-h2 text-gray-900">
            오늘 하루도 고생 많았어요.
            <br />
            <span className="text-primary-500">오롯이 나를 위한 시간</span>을
            가져보세요.
          </p>

          <div className="mt-5 flex w-full flex-col gap-3">
            <button
              type="button"
              disabled={kakaoLoading}
              onClick={() => void handleKakaoLogin()}
              className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#fee500] text-button1 font-medium text-gray-800 disabled:opacity-60"
            >
              <img src={iconKakao} alt="" className="size-6 object-contain" />
              {kakaoLoading ? "카카오 로그인 중…" : "카카오로 시작하기"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login/email")}
              className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-50 text-button1 font-medium text-primary-500"
            >
              이메일로 로그인
            </button>
          </div>

          <p className="mt-8 text-center text-body2 text-gray-500">
            회원이 아니신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="underline underline-offset-2"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
