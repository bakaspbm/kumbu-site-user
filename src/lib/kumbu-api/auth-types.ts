export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresInSeconds?: number;
  userId: string;
  email?: string | null;
  displayName?: string | null;
  admin?: boolean;
  emailVerified?: boolean;
  emailActionLink?: string | null;
}

export interface KumbuSessionUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
}

export interface KumbuSession {
  user: KumbuSessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface KumbuRegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export type RegisterBackendResult = {
  session: KumbuSession;
  emailActionLink?: string | null;
};
