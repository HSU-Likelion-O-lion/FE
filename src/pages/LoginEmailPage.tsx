import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, login } from "../api";
import Input from "../components/Input";
import webBg from "../assets/common/web-bg.png";
import logoDark from "../assets/common/logo-dark.svg";
import logoWhite from "../assets/common/logo-white.svg";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 웹 인증 화면 공통 그라데이션 (회원가입과 동일) */
const WEB_AUTH_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1440 1024' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.35 73.6 -103.5 1.8984 706.5 13)'><stop stop-color='rgba(253,253,255,0)' offset='0'/><stop stop-color='rgba(253,253,255,1)' offset='1'/></radialGradient></defs></svg>\")";

/** 이메일 로그인 (Figma 181:4089) — 웹 ≥431px 회원가입과 동일 배경·input */
export default function LoginEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailInvalid = email.length > 0 && !EMAIL_RE.test(email);
  const canSubmit =
    EMAIL_RE.test(email.trim()) && password.length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await login(email.trim(), password);
      navigate("/mate", { replace: true });
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "로그인에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none min-[431px]:overflow-y-auto min-[431px]:bg-transparent">
      {/* 웹 배경 + 그라데이션 */}
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
          style={{ backgroundImage: WEB_AUTH_GRADIENT }}
        />
      </div>

      {/* —— 모바일 — Figma 181:4089 —— */}
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-[128px] min-[431px]:hidden">
        <div className="mx-auto flex h-[91px] w-[113px] shrink-0 items-center justify-center">
          <img
            src={logoDark}
            alt="쓰담"
            className="h-[60px] w-[89px] object-contain"
          />
        </div>

        <div className="mt-10 flex flex-col">
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
          {formError ? (
            <p
              role="alert"
              className="mt-1 text-[12px] leading-[18px] tracking-[-0.025em] text-error"
            >
              {formError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2 min-[431px]:hidden">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void submit()}
          className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 font-semibold ${
            canSubmit
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
        <p className="mt-3 text-center text-body2 text-gray-500">
          아직 회원이 아니신가요?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="underline underline-offset-2"
          >
            회원가입
          </button>
        </p>
      </div>

      {/* —— 웹 — 회원가입과 동일 배경·glass input —— */}
      <div className="relative z-10 mx-auto hidden min-h-dvh w-full max-w-[353px] flex-col items-center px-5 py-16 min-[431px]:flex">
        <img
          src={logoWhite}
          alt="쓰담"
          className="h-[95px] w-[140px] shrink-0 object-contain"
        />

        <div className="mt-[70px] flex w-full flex-col gap-4">
          <Input
            variant="glass"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요."
            autoComplete="email"
          />
          <Input
            variant="glass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요."
            autoComplete="current-password"
          />
        </div>

        {emailInvalid || formError ? (
          <div
            role="alert"
            className="mt-[31px] flex h-[54px] w-full shrink-0 items-center gap-3 rounded-2xl bg-[rgba(241,201,210,0.71)] px-5"
          >
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#da4263] text-[13px] font-bold leading-none text-white"
            >
              !
            </span>
            <p className="text-body1 text-[#da4263]">
              {formError ?? "올바른 이메일 형식을 입력해주세요."}
            </p>
          </div>
        ) : null}

        <div className="mt-auto w-full pt-16">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submit()}
            className={`flex h-[54px] w-full items-center justify-center rounded-2xl text-button1 font-semibold ${
              canSubmit
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {submitting ? "로그인 중…" : "로그인"}
          </button>
          <p className="mt-3 text-center text-body2 text-gray-500">
            아직 회원이 아니신가요?{" "}
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
