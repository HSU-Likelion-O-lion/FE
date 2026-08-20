const KAKAO_SDK_SRC =
  "https://t1.kakaocdn.net/kakao_js_sdk/1.43.2/kakao.min.js";

type KakaoAuthSuccess = {
  access_token: string;
  token_type?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

type KakaoLoginOptions = {
  scope?: string;
  /** false면 카카오톡 앱(intent) 없이 브라우저 계정 로그인만 사용 */
  throughTalk?: boolean;
  success: (auth: KakaoAuthSuccess) => void;
  fail: (error: unknown) => void;
};

type KakaoSDK = {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Auth: {
    login: (options: KakaoLoginOptions) => void;
    /** 카카오톡 없이 계정 로그인 폼만 띄움 (웹 권장) */
    loginForm?: (options: KakaoLoginOptions) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let sdkPromise: Promise<KakaoSDK> | null = null;

function getKakaoAppKey(): string {
  const key = (import.meta.env.VITE_KAKAO_JS_KEY as string | undefined)?.trim();
  if (!key) {
    throw new Error("KAKAO_KEY_MISSING");
  }
  return key;
}

function loadKakaoSdk(): Promise<KakaoSDK> {
  if (window.Kakao?.isInitialized()) {
    return Promise.resolve(window.Kakao);
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<KakaoSDK>((resolve, reject) => {
    const appKey = getKakaoAppKey();

    const finish = () => {
      const kakao = window.Kakao;
      if (!kakao) {
        reject(new Error("KAKAO_SDK_MISSING"));
        return;
      }
      if (!kakao.isInitialized()) {
        kakao.init(appKey);
      }
      if (
        typeof kakao.Auth?.login !== "function" &&
        typeof kakao.Auth?.loginForm !== "function"
      ) {
        reject(new Error("KAKAO_LOGIN_UNSUPPORTED"));
        return;
      }
      resolve(kakao);
    };

    if (window.Kakao) {
      finish();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${KAKAO_SDK_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", finish);
      existing.addEventListener("error", () =>
        reject(new Error("KAKAO_SDK_LOAD_FAILED")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("KAKAO_SDK_LOAD_FAILED"));
    document.head.appendChild(script);
  });

  return sdkPromise.catch((err) => {
    sdkPromise = null;
    throw err;
  });
}

/**
 * 카카오 SDK 로그인 → accessToken
 * - 웹/DevTools 모바일 에뮬에서는 카카오톡 intent 대신 브라우저 로그인만 사용
 */
export async function getKakaoAccessToken(): Promise<string> {
  const kakao = await loadKakaoSdk();

  return new Promise((resolve, reject) => {
    const options: KakaoLoginOptions = {
      // DevTools 모바일 UA에서도 카카오톡 앱(intent://) 시도하지 않음
      throughTalk: false,
      success: (auth) => {
        if (!auth.access_token) {
          reject(new Error("KAKAO_TOKEN_EMPTY"));
          return;
        }
        resolve(auth.access_token);
      },
      fail: (error) => reject(error),
    };

    // loginForm이 있으면 계정 로그인 폼만 (톡 앱 미시도)
    if (typeof kakao.Auth.loginForm === "function") {
      kakao.Auth.loginForm(options);
      return;
    }
    kakao.Auth.login(options);
  });
}

function readKakaoFailMessage(error: unknown): string | null {
  if (error == null) return null;
  if (typeof error === "string" && error.trim()) return error;
  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const candidates = [e.error_description, e.errorMsg, e.message, e.error];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c;
    }
  }
  return null;
}

export function kakaoErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "KAKAO_KEY_MISSING") {
      return "카카오 JavaScript 키가 없어요. .env의 VITE_KAKAO_JS_KEY를 확인해 주세요.";
    }
    if (
      error.message === "KAKAO_SDK_MISSING" ||
      error.message === "KAKAO_SDK_LOAD_FAILED"
    ) {
      return "카카오 SDK를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
    }
    if (error.message === "KAKAO_LOGIN_UNSUPPORTED") {
      return "카카오 로그인 방식을 지원하지 않는 SDK예요. 페이지를 새로고침해 주세요.";
    }
  }

  const detail = readKakaoFailMessage(error);
  if (detail) {
    const lower = detail.toLowerCase();
    if (lower.includes("intent") || detail.includes("scheme")) {
      return "카카오톡 앱 실행에 실패했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.";
    }
    if (
      lower.includes("domain") ||
      detail.includes("도메인") ||
      detail.includes("등록")
    ) {
      return `카카오 앱에 사이트 도메인이 등록되지 않았어요.\n카카오 콘솔 → 플랫폼 → Web → http://localhost:5173 추가 후 다시 시도해 주세요.\n(${detail})`;
    }
    return `카카오 로그인에 실패했습니다.\n${detail}`;
  }

  return "카카오 로그인에 실패했습니다. 카카오 콘솔에서 JavaScript 키·Web 도메인(localhost:5173)·카카오 로그인 활성화를 확인해 주세요.";
}
