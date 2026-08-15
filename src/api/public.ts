import { apiRequest } from "./client";

export async function getPublicPages() {
  return apiRequest<{
    supportUrl: string;
    termsUrl: string;
    privacyPolicyUrl: string;
  }>("/api/public/pages", { auth: false });
}
