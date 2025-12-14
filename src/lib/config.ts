export const APP_NAME = "Signo";

export const config = {
  appName: APP_NAME,
  appUrl: process.env.APP_URL || 'https://signo-hypo.vercel.app',
  
  // Session
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'signo_session',
  jwtSecret: process.env.JWT_SECRET!,
  
  // Token expiry times
  verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  inviteTokenExpiry: 60 * 60 * 1000, // 1 hour
  resetTokenExpiry: 60 * 60 * 1000, // 1 hour
  sessionExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Pricing (in cents)
  pricing: {
    solo: {
      amount: 1900, // $19
      tax: 300, // $3
      total: 2200, // $22
    },
    studio: {
      amount: 2900, // $29
      tax: 300, // $3
      total: 3200, // $32
    },
    upgrade: {
      amount: 1500, // $15
      tax: 0,
      total: 1500,
    },
  },
  
  // Plan limits
  limits: {
    solo: {
      maxMembers: 1,
    },
    studio: {
      maxMembers: 5,
    },
  },
  
  // Email
  email: {
    from: process.env.EMAIL_FROM || `${APP_NAME} <noreply@signo.com>`,
    smtp: {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    prices: {
      solo: process.env.STRIPE_SOLO_PRICE_ID || '',
      studio: process.env.STRIPE_STUDIO_PRICE_ID || '',
      upgrade: process.env.STRIPE_UPGRADE_PRICE_ID || '',
    },
  },
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },
  
  // Google Drive
  googleDrive: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  },
} as const;

export type Plan = 'UNPAID' | 'SOLO' | 'STUDIO';
export type Role = 'OWNER' | 'MEMBER';
export type ProjectStatus = 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
export type AuthorType = 'CLIENT' | 'TEAM';