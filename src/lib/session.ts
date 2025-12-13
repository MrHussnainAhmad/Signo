import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { createSessionToken, verifySessionToken, type SessionPayload } from '@/lib/tokens';
import { db } from '@/lib/db';

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = createSessionToken(payload);
  
  cookies().set(config.sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.sessionExpiry,
    path: '/',
  });
  
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(config.sessionCookieName)?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = verifySessionToken(token);
  return payload;
}

export async function destroySession(): Promise<void> {
  cookies().set(config.sessionCookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session || session.type !== 'team') {
    return null;
  }
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  
  if (!user) {
    await destroySession();
    return null;
  }
  
  return user;
}

export async function getCurrentWorkspace() {
  const session = await getSession();
  
  if (!session || session.type !== 'team') {
    return null;
  }
  
  const workspace = await db.workspace.findFirst({
    where: {
      members: {
        some: {
          userId: session.userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          projects: true,
          members: true,
        },
      },
    },
  });
  
  return workspace;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function requireVerifiedAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (!user.emailVerified) {
    throw new Error('Email not verified');
  }
  
  return user;
}

// Client session helpers
export async function getClientSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  
  if (!session || session.type !== 'client') {
    return null;
  }
  
  return session;
}

export async function getCurrentClient() {
  const session = await getClientSession();
  
  if (!session) {
    return null;
  }
  
  const client = await db.clientAccount.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  
  if (!client) {
    await destroySession();
    return null;
  }
  
  return client;
}