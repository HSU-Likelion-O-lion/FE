import { useNavigate } from "react-router-dom";
import iconApple from "../assets/auth/icon-apple.svg";
import iconKakao from "../assets/auth/icon-kakao.svg";
import loginLogo from "../assets/auth/login-logo.svg";
import loginMascot from "../assets/auth/login-mascot.png";

/** 로그인 진입 (Figma 445:2099) */
export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <div className="flex min-h-0 flex-1 flex-col items-center px-5 pt-[calc(68px+env(safe-area-inset-top))]">
        <img
          src={loginLogo}
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

      <div className="shrink-0 pb-[calc(40px+env(safe-area-inset-bottom))] pt-4 text-center">
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
    </main>
  );
}
