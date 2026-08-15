const SIGNUP_DRAFT_KEY = "sseudam.signupDraft";

export type SignupDraft = {
  email: string;
  password: string;
};

export function saveSignupDraft(draft: SignupDraft) {
  sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
}

export function loadSignupDraft(): SignupDraft | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SignupDraft;
  } catch {
    return null;
  }
}

export function clearSignupDraft() {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}

const SESSION_REFLECT_KEY = "sseudam.lastSession";

export type LastSessionMeta = {
  sessionId: number;
  aiQuestion?: string;
  userBookId?: number;
};

export function saveLastSession(meta: LastSessionMeta) {
  sessionStorage.setItem(SESSION_REFLECT_KEY, JSON.stringify(meta));
}

export function loadLastSession(): LastSessionMeta | null {
  try {
    const raw = sessionStorage.getItem(SESSION_REFLECT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastSessionMeta;
  } catch {
    return null;
  }
}

export function clearLastSession() {
  sessionStorage.removeItem(SESSION_REFLECT_KEY);
}

const DIAGNOSIS_KEY = "sseudam.lastDiagnosisId";

export function saveLastDiagnosisId(id: number) {
  sessionStorage.setItem(DIAGNOSIS_KEY, String(id));
}

export function loadLastDiagnosisId(): number | null {
  const raw = sessionStorage.getItem(DIAGNOSIS_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
