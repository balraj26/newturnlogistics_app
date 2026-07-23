import { apiFetch } from '@/lib/api-client';
import type {
  CompanyType,
  LoginResponse,
  PendingVerificationResponse,
  TokenPair,
} from '@/types/api';

export interface RegisterInput {
  organization_name: string;
  company_name: string;
  company_type: CompanyType;
  full_name: string;
  phone?: string;
  email: string;
  password: string;
  invite_token?: string;
}

export interface LoginInput {
  phone?: string;
  email?: string;
  password: string;
}

export interface CompleteOnboardingInput {
  organization_name: string;
  company_name: string;
  company_type: CompanyType;
  full_name: string;
  phone: string;
}

export interface PasswordResetConfirmInput {
  email: string;
  code: string;
  new_password: string;
}

/** Ported from New Turn/frontend/services/auth.ts. */
export const authService = {
  register: (data: RegisterInput) =>
    apiFetch<PendingVerificationResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: data,
      skipAuth: true,
    }),

  login: (data: LoginInput) =>
    apiFetch<LoginResponse>('/api/v1/auth/login', { method: 'POST', body: data, skipAuth: true }),

  logout: (refreshToken: string) =>
    apiFetch<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),

  resendEmailVerification: () =>
    apiFetch<void>('/api/v1/auth/email/verify/resend', { method: 'POST' }),

  confirmEmailVerification: (code: string) =>
    apiFetch<TokenPair>('/api/v1/auth/email/verify', { method: 'POST', body: { code } }),

  /** Pre-auth variants — used by signup and unverified-login, where the
   * caller only has a short-lived pending_token, not a stored access token. */
  resendPendingEmailVerification: (pendingToken: string) =>
    apiFetch<void>('/api/v1/auth/email/verify/resend', {
      method: 'POST',
      skipAuth: true,
      headers: { Authorization: `Bearer ${pendingToken}` },
    }),

  confirmPendingEmailVerification: (pendingToken: string, code: string) =>
    apiFetch<TokenPair>('/api/v1/auth/email/verify', {
      method: 'POST',
      skipAuth: true,
      headers: { Authorization: `Bearer ${pendingToken}` },
      body: { code },
    }),

  requestPasswordReset: (email: string) =>
    apiFetch<void>('/api/v1/auth/password-reset/request', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    }),

  confirmPasswordReset: (data: PasswordResetConfirmInput) =>
    apiFetch<TokenPair>('/api/v1/auth/password-reset/confirm', {
      method: 'POST',
      body: data,
      skipAuth: true,
    }),

  completeOnboarding: (data: CompleteOnboardingInput) =>
    apiFetch<void>('/api/v1/auth/complete-onboarding', { method: 'POST', body: data }),
};
