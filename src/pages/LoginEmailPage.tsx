import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import loginLogo from "../assets/auth/login-logo.svg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 이메일 로그인 (Figma 181:4089 / 입력중 182:4188) */
export default function LoginEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailInvalid = email.length > 0 && !EMAIL_RE.test(email);
  const canSubmit = EMAIL_RE.test(email.trim()) && password.length > 0;

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-[calc(68px+env(safe-area-inset-top))]">
        <img
          src={loginLogo}
          alt="쓰담"
          className="mx-auto h-[61px] w-[89px] object-contain"
        />

        <div className="mt-[40px] flex flex-col">
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요."
              autoComplete="email"
              error={emailInvalid}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요."
              autoComplete="current-password"
            />
          </div>
          {emailInvalid ? (
            <p
              role="alert"
              className="mt-1 text-[12px] leading-[18px] tracking-[-0.025em] text-error"
            >
              올바른 이메일 형식을 입력해주세요.
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => navigate("/mate", { replace: true })}
          className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 font-semibold ${
            canSubmit
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          로그인
        </button>
        <p className="mt-3 text-center text-body2 text-gray-500">
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
