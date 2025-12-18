export const APP_NAME = "FileOk";

export const config = {
  appName: APP_NAME,
  appUrl: process.env.APP_URL || "https://signo-hypo.vercel.app",

  // Session
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "fileok_session",
  jwtSecret: process.env.JWT_SECRET!,

  // Token expiry times
  verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  inviteTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  resetTokenExpiry: 12 * 60 * 60 * 1000, // 12 hours
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
    business: {
      amount: 4900, // $49
      tax: 0,
      total: 4900,
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
      maxActiveProjects: 1,
      maxFileSize: 1 * 1024 * 1024 * 1024, // 1GB
      maxStorage: 25 * 1024 * 1024 * 1024, // 25GB
    },
    studio: {
      maxMembers: 5,
      maxActiveProjects: 5,
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
    },
    business: {
      maxMembers: 10,
      maxActiveProjects: 100, // Unlimited effectively
      maxFileSize: 5 * 1024 * 1024 * 1024 * 1024, // 5TB (Unlimited)
      maxStorage: 1 * 1024 * 1024 * 1024 * 1024, // 1TB
    },
  },

  // Email
  email: {
    from: process.env.EMAIL_FROM || `${APP_NAME} <mrhussnainahmad@gmail.com>`,
    smtp: {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    prices: {
      solo: process.env.STRIPE_SOLO_PRICE_ID || "",
      studio: process.env.STRIPE_STUDIO_PRICE_ID || "",
      business: process.env.STRIPE_BUSINESS_PRICE_ID || "",
      upgrade: process.env.STRIPE_UPGRADE_PRICE_ID || "",
    },
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },

  // Google Drive (OAuth-based; uses your personal Drive quota)
  googleDrive: {
    folderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
  },

  googleDriveOAuth: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
  },
} as const;

export type Plan = "UNPAID" | "SOLO" | "STUDIO" | "BUSINESS";
export type Role = "OWNER" | "MEMBER";
export type ProjectStatus =
  | "WAITING_FOR_CLIENT"
  | "CHANGES_REQUESTED"
  | "APPROVED";
export type AuthorType = "CLIENT" | "TEAM";