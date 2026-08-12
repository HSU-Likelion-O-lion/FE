import { useNavigate } from "react-router-dom";
import iconApple from "../assets/auth/icon-apple.svg";
import iconKakao from "../assets/auth/icon-kakao.svg";
import loginMascot from "../assets/auth/login-mascot.png";
import webBg from "../assets/common/web-bg.png";
import logoDark from "../assets/common/logo-dark.svg";
import logoWhite from "../assets/common/logo-white.svg";

/** Figma 603:4503 — 웹 로그인 흰 라디얼 오버레이 (1440×1024) */
const WEB_LOGIN_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1440 1024' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.35 73.6 -103.5 1.8984 706.5 13)'><stop stop-color='rgba(253,253,255,0)' offset='0'/><stop stop-color='rgba(253,253,255,1)' offset='1'/></radialGradient></defs></svg>\")";

/** 로그인 진입 (Figma 445:2099) — 웹 ≥431px (Figma 603:4503) */
export default function LoginPage() {
  const navigate = useNavigate();

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

      {/* 모바일 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-5 pt-[calc(68px+env(safe-area-inset-top))] min-[431px]:hidden">
        <img
          src={logoDark}
          alt="쓰담"
          className="h-[61px] w-[89px] object-contain"
        />
        <img
          src={loginMascot}
          alt=""
          className="mt-8 h-[104px] w-[134px] object-contain object-bottom"
        />

        <p className="mt-3 text-center text-h3 text-gray-900">
          오늘 하루도 고생 많았어요.
          <br />
          <span className="text-primary-500">오롯이 나를 위한 시간</span>을
          가져보세요.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate("/mate", { replace: true })}
            className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#fee500] text-button1 font-medium text-gray-800"
          >
            <img src={iconKakao} alt="" className="size-6 object-contain" />
            카카오로 시작하기
          </button>
          <button
            type="button"
            onClick={() => navigate("/mate", { replace: true })}
            className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gray-800 text-button1 font-medium text-white"
          >
            <img src={iconApple} alt="" className="size-6 object-contain" />
            Apple로 시작하기
          </button>
          <button
            type="button"
            onClick={() => navigate("/login/email")}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-50 text-button1 font-medium text-primary-500"
          >
            이메일로 로그인
          </button>
        </div>
      </div>

      <div className="relative z-10 shrink-0 pb-[calc(40px+env(safe-area-inset-bottom))] pt-4 text-center min-[431px]:hidden">
        <p className="text-body2 text-gray-500">
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
              onClick={() => navigate("/mate", { replace: true })}
              className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#fee500] text-button1 font-medium text-gray-800"
            >
              <img src={iconKakao} alt="" className="size-6 object-contain" />
              카카오로 시작하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/mate", { replace: true })}
              className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gray-800 text-button1 font-medium text-white"
            >
              <img src={iconApple} alt="" className="size-6 object-contain" />
              Apple로 시작하기
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
