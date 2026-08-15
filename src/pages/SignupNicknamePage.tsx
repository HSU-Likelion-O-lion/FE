import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  checkNicknameAvailable,
  login,
  signup,
} from "../api";
import {
  clearSignupDraft,
  loadSignupDraft,
} from "../api/sessionDraft";
import Input from "../components/Input";
import webBg from "../assets/common/web-bg.png";

const NICKNAME_MAX = 8;
/** API minLength 2 · FE 최대 8자 */
const NICKNAME_RE = /^[가-힣a-zA-Z0-9]{2,8}$/;

const WEB_AUTH_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1440 1024' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.35 73.6 -103.5 1.8984 706.5 13)'><stop stop-color='rgba(253,253,255,0)' offset='0'/><stop stop-color='rgba(253,253,255,1)' offset='1'/></radialGradient></defs></svg>\")";

/** 회원가입 닉네임 입력 (Figma 988:6766) */
export default function SignupNicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadSignupDraft()) {
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  const canSubmit = NICKNAME_RE.test(nickname) && !submitting;

  const onNicknameChange = (value: string) => {
    setNickname(value.slice(0, NICKNAME_MAX));
    setFormError(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    const draft = loadSignupDraft();
    if (!draft) {
      navigate("/signup", { replace: true });
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const { available } = await checkNicknameAvailable(nickname);
      if (!available) {
        setFormError("이미 사용 중인 닉네임입니다.");
        return;
      }
      await signup(draft.email, draft.password, nickname);
      await login(draft.email, draft.password);
      clearSignupDraft();
      navigate("/mate", { replace: true });
    } catch (err) {
      console.error("[signup]", err);
      setFormError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "회원가입에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none min-[431px]:overflow-y-auto min-[431px]:bg-transparent">
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

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-[148px] min-[431px]:hidden">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-display text-[#282723]">
            안녕하세요, 쓰담이에요!
          </h1>
          <p className="text-body1 font-medium text-gray-500">
            당신을 뭐라고 불러드리면 될까요?
          </p>
        </div>

        <div className="mt-[51px] flex flex-col">
          <Input
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="닉네임을 입력해주세요.(2자~8자)"
            autoComplete="nickname"
            maxLength={NICKNAME_MAX}
          />
          <p className="mt-1 text-right text-caption leading-[18px] text-[#8e8b7e]">
            ({nickname.length}/{NICKNAME_MAX})
          </p>
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
          {submitting ? "가입 중…" : "시작하기"}
        </button>
      </div>

      <div className="relative z-10 mx-auto hidden min-h-dvh w-full max-w-[353px] flex-col px-5 py-16 min-[431px]:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-display text-[#282723]">
            안녕하세요, 쓰담이에요!
          </h1>
          <p className="text-body1 font-medium text-gray-500">
            당신을 뭐라고 불러드리면 될까요?
          </p>
        </div>

        <div className="mt-12 flex w-full flex-col">
          <Input
            variant="glass"
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="닉네임을 입력해주세요.(2자~8자)"
            autoComplete="nickname"
            maxLength={NICKNAME_MAX}
          />
          <p className="mt-1 text-right text-caption leading-[18px] text-[#8e8b7e]">
            ({nickname.length}/{NICKNAME_MAX})
          </p>
          {formError ? (
            <p
              role="alert"
              className="mt-2 text-[12px] leading-[18px] text-error"
            >
              {formError}
            </p>
          ) : null}
        </div>

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
            {submitting ? "가입 중…" : "시작하기"}
          </button>
        </div>
      </div>
    </main>
  );
}
