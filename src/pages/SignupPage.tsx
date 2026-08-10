import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import loginLogo from "../assets/auth/login-logo.svg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "email" | "password" | "passwordConfirm";

type FieldError = {
  field: FieldKey;
  message: string;
};

function resolveSignupError(
  email: string,
  password: string,
  passwordConfirm: string,
): FieldError | null {
  if (email.length > 0 && !EMAIL_RE.test(email)) {
    return {
      field: "email",
      message: "올바른 이메일 형식을 입력해주세요.",
    };
  }
  if (password.length > 0 && password.length < 8) {
    return {
      field: "password",
      message: "비밀번호는 8자리 이상이여야 합니다.",
    };
  }
  if (passwordConfirm.length > 0 && passwordConfirm !== password) {
    return {
      field: "passwordConfirm",
      message: "비밀번호가 일치하지 않습니다.",
    };
  }
  return null;
}

/** 이메일 회원가입 (Figma 182:4288 / 에러 182:4320, 182:4347) */
export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const fieldError = resolveSignupError(email, password, passwordConfirm);
  const canSubmit =
    EMAIL_RE.test(email.trim()) &&
    password.length >= 8 &&
    password === passwordConfirm;

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
              error={fieldError?.field === "email"}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자리 이상 비밀번호를 입력해주세요"
              autoComplete="new-password"
              error={fieldError?.field === "password"}
            />
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
              autoComplete="new-password"
              error={fieldError?.field === "passwordConfirm"}
            />
          </div>
          {fieldError ? (
            <p
              role="alert"
              className="mt-1 text-[12px] leading-[18px] tracking-[-0.025em] text-error"
            >
              {fieldError.message}
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
          가입하기
        </button>
        <p className="mt-3 text-center text-body2 text-gray-500">
          이미 회원이신가요?{" "}
          <button
            type="button"
            onClick={() => navigate("/login/email")}
            className="underline underline-offset-2"
          >
            로그인
          </button>
        </p>
      </div>
    </main>
  );
}
