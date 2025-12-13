import { APP_NAME } from '@/lib/config';

// Signo Brand Colors
const BRAND = {
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  background: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  white: '#ffffff',
};

// Base email layout wrapper
function emailLayout(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${APP_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${BRAND.primary}; text-decoration: none; }
    a:hover { color: ${BRAND.primaryDark}; }
    .button { display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white} !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background-color: ${BRAND.primaryDark}; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: -0.5px;">
                ${APP_NAME}
              </h1>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td class="content" style="background-color: ${BRAND.white}; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding-top: 32px;">
              <p style="margin: 0; font-size: 14px; color: ${BRAND.textMuted};">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 13px; color: ${BRAND.textMuted};">
                You're receiving this email because you signed up for ${APP_NAME}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// 1. Email Verification
export function emailVerificationTemplate(name: string, verifyUrl: string) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Verify your email address
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      Welcome to ${APP_NAME}! Please verify your email address to get started with your account.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link will expire in 24 hours. If you didn't create a ${APP_NAME} account, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${verifyUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${verifyUrl}</a>
    </p>
  `, `Verify your ${APP_NAME} email address`);

  const text = `
Hi ${name},

Welcome to ${APP_NAME}! Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create a ${APP_NAME} account, you can safely ignore this email.

- The ${APP_NAME} Team
`;

  return { html, text, subject: `Verify your ${APP_NAME} email address` };
}

// 2. Welcome Email (after verification)
export function welcomeEmailTemplate(name: string, loginUrl: string) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Welcome to ${APP_NAME}! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      Your email has been verified and your account is ready to go! ${APP_NAME} helps you streamline client approvals for your projects.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${BRAND.text};">
        Choose your plan:
      </h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px; background-color: ${BRAND.white}; border-radius: 8px; margin-bottom: 8px;">
            <strong style="color: ${BRAND.text};">Solo Plan - $19 + $3 tax</strong>
            <p style="margin: 4px 0 0; font-size: 14px; color: ${BRAND.textMuted};">Perfect for individual freelancers. One login email.</p>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px; background-color: ${BRAND.white}; border-radius: 8px;">
            <strong style="color: ${BRAND.text};">Studio Plan - $29 + $3 tax</strong>
            <p style="margin: 4px 0 0; font-size: 14px; color: ${BRAND.textMuted};">For teams. Up to 5 team members.</p>
          </td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
  `, `Welcome to ${APP_NAME}!`);

  const text = `
Hi ${name},

Welcome to ${APP_NAME}! Your email has been verified and your account is ready to go.

Choose your plan:
- Solo Plan ($19 + $3 tax): Perfect for individual freelancers. One login email.
- Studio Plan ($29 + $3 tax): For teams. Up to 5 team members.

Get started here: ${loginUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `Welcome to ${APP_NAME}! 🎉` };
}

// 3. Payment Receipt
export function paymentReceiptTemplate(
  name: string,
  planName: string,
  amount: number,
  tax: number,
  total: number,
  receiptUrl?: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Payment Confirmed ✓
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      Thank you for your purchase! Your ${planName} plan is now active.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${BRAND.text};">
        Receipt Details
      </h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Plan</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right; font-weight: 500;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Amount</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right;">$${(amount / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Tax</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right;">$${(tax / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px 0;"><hr style="border: none; border-top: 1px solid ${BRAND.border};"></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 16px; font-weight: 600;">Total</td>
          <td style="padding: 8px 0; color: ${BRAND.primary}; font-size: 16px; text-align: right; font-weight: 600;">$${(total / 100).toFixed(2)}</td>
        </tr>
      </table>
    </div>
    ${receiptUrl ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${receiptUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Receipt
      </a>
    </div>
    ` : ''}
  `, `Payment receipt for ${APP_NAME} ${planName} plan`);

  const text = `
Hi ${name},

Thank you for your purchase! Your ${planName} plan is now active.

Receipt Details:
- Plan: ${planName}
- Amount: $${(amount / 100).toFixed(2)}
- Tax: $${(tax / 100).toFixed(2)}
- Total: $${(total / 100).toFixed(2)}

${receiptUrl ? `View receipt: ${receiptUrl}` : ''}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} Payment Receipt - ${planName} Plan` };
}

// 4. Upgrade Confirmation
export function upgradeConfirmationTemplate(name: string, dashboardUrl: string) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Upgrade Successful! 🚀
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      Your workspace has been upgraded to the <strong>Studio</strong> plan! You can now invite up to 4 additional team members.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: ${BRAND.text};">
        What's New
      </h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.8;">
        <li>Invite up to 4 team members</li>
        <li>Collaborate on projects together</li>
        <li>Manage team permissions</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Invite Team Members
      </a>
    </div>
  `, `Upgrade to Studio plan confirmed`);

  const text = `
Hi ${name},

Your workspace has been upgraded to the Studio plan! You can now invite up to 4 additional team members.

What's New:
- Invite up to 4 team members
- Collaborate on projects together
- Manage team permissions

Invite team members here: ${dashboardUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} Upgrade Confirmed - Welcome to Studio!` };
}

// 5. Studio Member Added (notify owner)
export function memberAddedNotificationTemplate(
  ownerName: string,
  memberName: string,
  memberEmail: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      New Team Member Joined
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${ownerName},<br><br>
      A new member has joined your ${APP_NAME} workspace.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Name</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right; font-weight: 500;">${memberName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Email</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right;">${memberEmail}</td>
        </tr>
      </table>
    </div>
  `, `${memberName} joined your ${APP_NAME} workspace`);

  const text = `
Hi ${ownerName},

A new member has joined your ${APP_NAME} workspace.

Name: ${memberName}
Email: ${memberEmail}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - ${memberName} joined your workspace` };
}

// 6. Studio Invite Email
export function studioInviteTemplate(
  workspaceName: string,
  inviterName: string,
  inviteUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      You're Invited! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      ${inviterName} has invited you to join <strong>${workspaceName}</strong> on ${APP_NAME}.
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      ${APP_NAME} is a client approval portal that helps teams manage project deliverables and get client sign-off efficiently.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Accept Invitation
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.6;">
      ⏰ This invitation expires in <strong>1 hour</strong>. If it expires, ask ${inviterName} to send a new one.
    </p>
    <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${inviteUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${inviteUrl}</a>
    </p>
  `, `${inviterName} invited you to join ${workspaceName} on ${APP_NAME}`);

  const text = `
You're Invited!

${inviterName} has invited you to join ${workspaceName} on ${APP_NAME}.

${APP_NAME} is a client approval portal that helps teams manage project deliverables and get client sign-off efficiently.

Accept your invitation here: ${inviteUrl}

⏰ This invitation expires in 1 hour.

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - You're invited to join ${workspaceName}` };
}

// 7. Project Created Email
export function projectCreatedTemplate(
  teamMemberName: string,
  projectTitle: string,
  clientName: string,
  clientEmail: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Project Created 📁
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${teamMemberName},<br><br>
      A new project has been created in your workspace.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Project</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right; font-weight: 500;">${projectTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Client</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${BRAND.textMuted}; font-size: 14px;">Email</td>
          <td style="padding: 8px 0; color: ${BRAND.text}; font-size: 14px; text-align: right;">${clientEmail}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Project
      </a>
    </div>
  `, `New project created: ${projectTitle}`);

  const text = `
Hi ${teamMemberName},

A new project has been created in your workspace.

Project: ${projectTitle}
Client: ${clientName}
Email: ${clientEmail}

View project: ${projectUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - New project: ${projectTitle}` };
}

// 8. Email Change Verification
export function emailChangeVerificationTemplate(name: string, newEmail: string, verifyUrl: string) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Confirm Email Change
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      You requested to change your email address to <strong>${newEmail}</strong>. Please confirm this change by clicking the button below.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Confirm Email Change
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link will expire in 1 hour. If you didn't request this change, please ignore this email.
    </p>
  `, `Confirm your email change on ${APP_NAME}`);

  const text = `
Hi ${name},

You requested to change your email address to ${newEmail}. Please confirm this change by clicking the link below:

${verifyUrl}

This link will expire in 1 hour. If you didn't request this change, please ignore this email.

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - Confirm your email change` };
}

// 9. Client Comment Notification
export function clientCommentNotificationTemplate(
  teamMemberName: string,
  clientName: string,
  projectTitle: string,
  commentPreview: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      New Client Comment 💬
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${teamMemberName},<br><br>
      <strong>${clientName}</strong> left a comment on <strong>${projectTitle}</strong>.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid ${BRAND.primary};">
      <p style="margin: 0; font-size: 15px; color: ${BRAND.text}; font-style: italic; line-height: 1.6;">
        "${commentPreview.length > 200 ? commentPreview.substring(0, 200) + '...' : commentPreview}"
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Comment
      </a>
    </div>
  `, `${clientName} commented on ${projectTitle}`);

  const text = `
Hi ${teamMemberName},

${clientName} left a comment on ${projectTitle}:

"${commentPreview}"

View and reply: ${projectUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - New comment on ${projectTitle}` };
}

// 10. Client Approval Email
export function clientApprovalTemplate(
  teamMemberName: string,
  clientName: string,
  projectTitle: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.success};">
      Project Approved! ✅
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${teamMemberName},<br><br>
      Great news! <strong>${clientName}</strong> has approved <strong>${projectTitle}</strong>. The project is now complete.
    </p>
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <p style="margin: 0; font-size: 16px; color: ${BRAND.success}; font-weight: 600;">
        Congratulations on the successful project!
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Project
      </a>
    </div>
  `, `${clientName} approved ${projectTitle}!`);

  const text = `
Hi ${teamMemberName},

Great news! ${clientName} has approved ${projectTitle}. The project is now complete.

🎉 Congratulations on the successful project!

View project: ${projectUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - Project Approved: ${projectTitle} ✅` };
}

// 11. Client Requested Changes Email
export function changesRequestedTemplate(
  teamMemberName: string,
  clientName: string,
  projectTitle: string,
  note: string | undefined,
  projectUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Changes Requested ⚡
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${teamMemberName},<br><br>
      <strong>${clientName}</strong> has requested changes on <strong>${projectTitle}</strong>.
    </p>
    ${note ? `
    <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #92400e; font-weight: 600;">Client's Note:</p>
      <p style="margin: 0; font-size: 15px; color: #78350f; line-height: 1.6;">
        "${note}"
      </p>
    </div>
    ` : ''}
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Project
      </a>
    </div>
  `, `${clientName} requested changes on ${projectTitle}`);

  const text = `
Hi ${teamMemberName},

${clientName} has requested changes on ${projectTitle}.

${note ? `Client's Note: "${note}"` : ''}

View project and make updates: ${projectUrl}

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - Changes requested on ${projectTitle}` };
}

// 12. Thank You for Review Email
export function reviewThankYouTemplate(
  clientName: string,
  projectTitle: string,
  rating: number
) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Thank You for Your Review! 🙏
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${clientName},<br><br>
      Thank you for taking the time to review <strong>${projectTitle}</strong>. Your feedback helps the team improve and helps other clients make informed decisions.
    </p>
    <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textMuted};">Your Rating</p>
      <p style="margin: 0; font-size: 32px; color: #fbbf24; letter-spacing: 4px;">
        ${stars}
      </p>
    </div>
    <p style="margin: 24px 0 0; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6; text-align: center;">
      We hope to work with you again soon!
    </p>
  `, `Thank you for your review on ${APP_NAME}`);

  const text = `
Hi ${clientName},

Thank you for taking the time to review ${projectTitle}. Your feedback helps the team improve and helps other clients make informed decisions.

Your Rating: ${stars}

We hope to work with you again soon!

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - Thank you for your review!` };
}

// Client Invite to View Project
export function clientProjectInviteTemplate(
  clientName: string,
  projectTitle: string,
  teamName: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      You Have a Project to Review 📋
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${clientName},<br><br>
      <strong>${teamName}</strong> has shared <strong>${projectTitle}</strong> with you on ${APP_NAME}. You can view the deliverables, leave comments, and approve the project when ready.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${projectUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Project
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.6;">
      You'll need to create an account with this email address to access the project.
    </p>
  `, `${teamName} shared a project with you on ${APP_NAME}`);

  const text = `
Hi ${clientName},

${teamName} has shared ${projectTitle} with you on ${APP_NAME}. You can view the deliverables, leave comments, and approve the project when ready.

View project: ${projectUrl}

You'll need to create an account with this email address to access the project.

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - ${teamName} shared ${projectTitle} with you` };
}

// Password Reset Email
export function passwordResetTemplate(name: string, resetUrl: string) {
  const html = emailLayout(`
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: ${BRAND.text};">
      Reset Your Password
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textMuted}; line-height: 1.6;">
      Hi ${name},<br><br>
      We received a request to reset your ${APP_NAME} password. Click the button below to create a new password.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
    </div>
    <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 24px 0;">
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${resetUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${resetUrl}</a>
    </p>
  `, `Reset your ${APP_NAME} password`);

  const text = `
Hi ${name},

We received a request to reset your ${APP_NAME} password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

- The ${APP_NAME} Team
`;

  return { html, text, subject: `${APP_NAME} - Reset your password` };
}