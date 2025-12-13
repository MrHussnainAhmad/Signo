import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

// Generate a cryptographically secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Generate a short share token for project URLs
export function generateShareToken(): string {
  return crypto.randomBytes(16).toString('base64url');
}

// Hash a token for storage (one-time tokens like invites)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify a token against its hash
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}

// JWT Session Token
export interface SessionPayload {
  userId: string;
  workspaceId: string;
  email: string;
  type: 'team' | 'client';
}

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.sessionExpiry,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Email verification token
export interface VerificationTokenData {
  token: string;
  expiry: Date;
}

export function createVerificationToken(): VerificationTokenData {
  return {
    token: generateSecureToken(),
    expiry: new Date(Date.now() + config.verificationTokenExpiry),
  };
}

// Invite token
export interface InviteTokenData {
  token: string;
  tokenHash: string;
  expiry: Date;
}

export function createInviteToken(): InviteTokenData {
  const token = generateSecureToken(48); // Higher entropy for invites
  return {
    token,
    tokenHash: hashToken(token),
    expiry: new Date(Date.now() + config.inviteTokenExpiry),
  };
}

// Password reset token
export interface ResetTokenData {
  token: string;
  expiry: Date;
}

export function createResetToken(): ResetTokenData {
  return {
    token: generateSecureToken(),
    expiry: new Date(Date.now() + config.resetTokenExpiry),
  };
}