import { apiRequest } from "./client";
import {
  clearTokens,
  setStoredUser,
  setTokens,
  getRefreshToken,
} from "./authStorage";

export type LoginResult = {
  userId: number;
  nickname: string;
  accessToken: string;
  refreshToken: string;
};

export type SignUpResult = {
  userId: number;
  email: string;
  nickname: string;
  createdAt: string;
};

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResult>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setTokens(data.accessToken, data.refreshToken);
  setStoredUser({ userId: data.userId, nickname: data.nickname, email });
  return data;
}

export async function signup(
  email: string,
  password: string,
  nickname: string,
) {
  return apiRequest<SignUpResult>("/api/auth/signup", {
    method: "POST",
    auth: false,
    body: { email, password, nickname },
  });
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest<null>("/api/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken },
      });
    }
  } finally {
    clearTokens();
  }
}

export async function logoutAll() {
  try {
    await apiRequest<{ revokedCount: number }>("/api/auth/logout-all", {
      method: "POST",
    });
  } finally {
    clearTokens();
  }
}

export async function requestPasswordReset(email: string) {
  return apiRequest<null>("/api/auth/password/reset-request", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<null>("/api/auth/password/reset", {
    method: "POST",
    auth: false,
    body: { token, newPassword },
  });
}
