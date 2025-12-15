import { APP_NAME } from '@/lib/config';

// Premium Brand Colors - Refined palette
const BRAND = {
  primary: '#4f46e5', // Deep Indigo
  primaryLight: '#6366f1',
  background: '#fafafa',
  cardBg: '#ffffff',
  text: '#18181b',
  textSecondary: '#52525b',
  textMuted: '#a1a1aa',
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  accent: '#f4f4f5',
};

// Premium email layout wrapper
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
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 32px 24px !important; }
      .header { padding: 24px 24px 0 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: ${BRAND.background};">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.background};">
    <tr>
      <td style="padding: 48px 24px;">
        <table class="container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="margin: 0 auto; max-width: 520px;">
          
          <!-- Header -->
          <tr>
            <td class="header" style="padding: 0 0 40px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: ${BRAND.text}; letter-spacing: -0.3px;">${APP_NAME}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td class="content" style="background-color: ${BRAND.cardBg}; border-radius: 12px; padding: 48px 40px; border: 1px solid ${BRAND.border};">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid ${BRAND.borderLight}; padding-top: 24px;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.5;">
                      © ${new Date().getFullYear()} ${APP_NAME}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.5;">
                      You're receiving this email because you have an account with ${APP_NAME}.
                    </p>
                  </td>
                </tr>
              </table>
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

// Reusable button component
function primaryButton(text: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
      <tr>
        <td style="background-color: ${BRAND.primary}; border-radius: 8px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.01em;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Reusable info box
function infoBox(content: string, variant: 'default' | 'success' | 'warning' = 'default'): string {
  const colors = {
    default: { bg: BRAND.accent, border: BRAND.border },
    success: { bg: BRAND.successBg, border: '#d1fae5' },
    warning: { bg: BRAND.warningBg, border: '#fef3c7' },
  };
  const style = colors[variant];
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${style.bg}; border-radius: 8px; padding: 20px 24px; border: 1px solid ${style.border};">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

// Divider
function divider(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;"><tr><td style="border-top: 1px solid ${BRAND.borderLight};"></td></tr></table>`;
}

// 1. Email Verification
export function emailVerificationTemplate(name: string, verifyUrl: string) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Verify your email
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      Welcome to ${APP_NAME}, ${name}. Please verify your email address to activate your account.
    </p>
    
    ${primaryButton('Verify Email Address', verifyUrl)}
    
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </p>
    
    ${divider()}
    
    <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.6;">
      If the button doesn't work, copy this link:<br>
      <a href="${verifyUrl}" style="color: ${BRAND.primary}; word-break: break-all; font-size: 12px;">${verifyUrl}</a>
    </p>
  `, `Verify your email address for ${APP_NAME}`);

  const text = `
Verify your email

Welcome to ${APP_NAME}, ${name}. Please verify your email address to activate your account.

${verifyUrl}

This link expires in 24 hours. If you didn't create an account, you can ignore this email.

– ${APP_NAME}
`;

  return { html, text, subject: `Verify your email for ${APP_NAME}` };
}

// 2. Welcome Email (after verification)
export function welcomeEmailTemplate(name: string, loginUrl: string) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Welcome to ${APP_NAME}
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      Your email has been verified, ${name}. Your account is ready.
    </p>
    
    ${infoBox(`
      <p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; color: ${BRAND.text}; text-transform: uppercase; letter-spacing: 0.05em;">Choose your plan</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px 16px; background-color: ${BRAND.cardBg}; border-radius: 6px; border: 1px solid ${BRAND.border};">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${BRAND.text};">Solo — $19 <span style="font-weight: 400; color: ${BRAND.textMuted};">+ $3 tax</span></p>
            <p style="margin: 4px 0 0; font-size: 13px; color: ${BRAND.textSecondary};">For individual freelancers</p>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px 16px; background-color: ${BRAND.cardBg}; border-radius: 6px; border: 1px solid ${BRAND.border};">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${BRAND.text};">Studio — $29 <span style="font-weight: 400; color: ${BRAND.textMuted};">+ $3 tax</span></p>
            <p style="margin: 4px 0 0; font-size: 13px; color: ${BRAND.textSecondary};">For teams up to 5 members</p>
          </td>
        </tr>
      </table>
    `)}
    
    ${primaryButton('Go to Dashboard', loginUrl)}
  `, `Welcome to ${APP_NAME}`);

  const text = `
Welcome to ${APP_NAME}

Your email has been verified, ${name}. Your account is ready.

Choose your plan:
• Solo — $19 + $3 tax (For individual freelancers)
• Studio — $29 + $3 tax (For teams up to 5 members)

Go to Dashboard: ${loginUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `Welcome to ${APP_NAME}` };
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
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Payment confirmed
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      Thank you for your purchase, ${name}. Your ${planName} plan is now active.
    </p>
    
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.textSecondary};">Plan</td>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.text}; text-align: right; font-weight: 500;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.textSecondary};">Amount</td>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.text}; text-align: right;">$${(amount / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.textSecondary};">Tax</td>
          <td style="padding: 8px 0; font-size: 13px; color: ${BRAND.text}; text-align: right;">$${(tax / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 12px 0 8px;"><div style="border-top: 1px solid ${BRAND.border};"></div></td>
        </tr>
        <tr>
          <td style="padding: 0; font-size: 14px; color: ${BRAND.text}; font-weight: 600;">Total</td>
          <td style="padding: 0; font-size: 14px; color: ${BRAND.text}; text-align: right; font-weight: 600;">$${(total / 100).toFixed(2)}</td>
        </tr>
      </table>
    `)}
    
    ${receiptUrl ? primaryButton('View Receipt', receiptUrl) : ''}
  `, `Payment receipt for ${APP_NAME}`);

  const text = `
Payment confirmed

Thank you for your purchase, ${name}. Your ${planName} plan is now active.

Receipt:
Plan: ${planName}
Amount: $${(amount / 100).toFixed(2)}
Tax: $${(tax / 100).toFixed(2)}
Total: $${(total / 100).toFixed(2)}

${receiptUrl ? `View receipt: ${receiptUrl}` : ''}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Payment Receipt` };
}

// 4. Upgrade Confirmation
export function upgradeConfirmationTemplate(name: string, dashboardUrl: string) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Upgrade successful
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      Your workspace has been upgraded to Studio, ${name}. You can now invite up to 4 additional team members.
    </p>
    
    ${infoBox(`
      <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: ${BRAND.text};">What's included</p>
      <p style="margin: 0; font-size: 13px; color: ${BRAND.textSecondary}; line-height: 1.8;">
        • Invite up to 4 team members<br>
        • Collaborate on projects<br>
        • Manage team permissions
      </p>
    `)}
    
    ${primaryButton('Invite Team Members', dashboardUrl)}
  `, `Upgrade to Studio confirmed`);

  const text = `
Upgrade successful

Your workspace has been upgraded to Studio, ${name}. You can now invite up to 4 additional team members.

What's included:
• Invite up to 4 team members
• Collaborate on projects
• Manage team permissions

Invite team members: ${dashboardUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Welcome to Studio` };
}

// 5. Studio Member Added (notify owner)
export function memberAddedNotificationTemplate(
  ownerName: string,
  memberName: string,
  memberEmail: string
) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      New team member
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      A new member has joined your workspace, ${ownerName}.
    </p>
    
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.textSecondary};">Name</td>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.text}; text-align: right; font-weight: 500;">${memberName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.textSecondary};">Email</td>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.text}; text-align: right;">${memberEmail}</td>
        </tr>
      </table>
    `)}
  `, `${memberName} joined your workspace`);

  const text = `
New team member

A new member has joined your workspace, ${ownerName}.

Name: ${memberName}
Email: ${memberEmail}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — ${memberName} joined your workspace` };
}

// 6. Studio Invite Email
export function studioInviteTemplate(
  workspaceName: string,
  inviterName: string,
  inviteUrl: string
) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      You're invited
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      ${inviterName} has invited you to join <strong style="color: ${BRAND.text};">${workspaceName}</strong> on ${APP_NAME}.
    </p>
    
    ${primaryButton('Accept Invitation', inviteUrl)}
    
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This invitation expires in 1 hour. If it expires, ask ${inviterName} to send a new one.
    </p>
    
    ${divider()}
    
    <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.6;">
      If the button doesn't work, copy this link:<br>
      <a href="${inviteUrl}" style="color: ${BRAND.primary}; word-break: break-all; font-size: 12px;">${inviteUrl}</a>
    </p>
  `, `${inviterName} invited you to ${workspaceName}`);

  const text = `
You're invited

${inviterName} has invited you to join ${workspaceName} on ${APP_NAME}.

Accept your invitation: ${inviteUrl}

This invitation expires in 1 hour.

– ${APP_NAME}
`;

  return { html, text, subject: `Join ${workspaceName} on ${APP_NAME}` };
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
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Project created
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      A new project has been added to your workspace, ${teamMemberName}.
    </p>
    
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.textSecondary};">Project</td>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.text}; text-align: right; font-weight: 500;">${projectTitle}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.textSecondary};">Client</td>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.text}; text-align: right;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.textSecondary};">Email</td>
          <td style="padding: 4px 0; font-size: 13px; color: ${BRAND.text}; text-align: right;">${clientEmail}</td>
        </tr>
      </table>
    `)}
    
    ${primaryButton('View Project', projectUrl)}
  `, `New project: ${projectTitle}`);

  const text = `
Project created

A new project has been added to your workspace, ${teamMemberName}.

Project: ${projectTitle}
Client: ${clientName}
Email: ${clientEmail}

View project: ${projectUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — New project: ${projectTitle}` };
}

// 8. Email Change Verification
export function emailChangeVerificationTemplate(name: string, newEmail: string, verifyUrl: string) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Confirm email change
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      You requested to change your email address to <strong style="color: ${BRAND.text};">${newEmail}</strong>. Please confirm this change.
    </p>
    
    ${primaryButton('Confirm Email Change', verifyUrl)}
    
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link expires in 1 hour. If you didn't request this change, you can ignore this email.
    </p>
  `, `Confirm your email change on ${APP_NAME}`);

  const text = `
Confirm email change

You requested to change your email address to ${newEmail}. Please confirm this change.

${verifyUrl}

This link expires in 1 hour. If you didn't request this change, you can ignore this email.

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Confirm your email change` };
}

// 9. Client Comment Notification
export function clientCommentNotificationTemplate(
  teamMemberName: string,
  clientName: string,
  projectTitle: string,
  commentPreview: string,
  projectUrl: string
) {
  const truncatedComment = commentPreview.length > 180 ? commentPreview.substring(0, 180) + '...' : commentPreview;
  
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      New comment
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      ${clientName} commented on <strong style="color: ${BRAND.text};">${projectTitle}</strong>.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${BRAND.accent}; border-radius: 8px; padding: 20px 24px; border-left: 3px solid ${BRAND.primary};">
          <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary}; font-style: italic; line-height: 1.6;">
            "${truncatedComment}"
          </p>
        </td>
      </tr>
    </table>
    
    ${primaryButton('View Comment', projectUrl)}
  `, `${clientName} commented on ${projectTitle}`);

  const text = `
New comment

${clientName} commented on ${projectTitle}:

"${truncatedComment}"

View and reply: ${projectUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Comment on ${projectTitle}` };
}

// 10. Client Approval Email
export function clientApprovalTemplate(
  teamMemberName: string,
  clientName: string,
  projectTitle: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.success}; letter-spacing: -0.3px;">
      Project approved
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      ${clientName} has approved <strong style="color: ${BRAND.text};">${projectTitle}</strong>.
    </p>
    
    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: ${BRAND.success}; font-weight: 500; text-align: center;">
        Congratulations on the successful project.
      </p>
    `, 'success')}
    
    ${primaryButton('View Project', projectUrl)}
  `, `${projectTitle} has been approved`);

  const text = `
Project approved

${clientName} has approved ${projectTitle}.

Congratulations on the successful project.

View project: ${projectUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — ${projectTitle} Approved` };
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
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Changes requested
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      ${clientName} has requested changes on <strong style="color: ${BRAND.text};">${projectTitle}</strong>.
    </p>
    
    ${note ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="background-color: ${BRAND.warningBg}; border-radius: 8px; padding: 20px 24px; border-left: 3px solid ${BRAND.warning};">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${BRAND.warning}; text-transform: uppercase; letter-spacing: 0.05em;">Client's note</p>
          <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.6;">
            "${note}"
          </p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${primaryButton('View Project', projectUrl)}
  `, `Changes requested on ${projectTitle}`);

  const text = `
Changes requested

${clientName} has requested changes on ${projectTitle}.

${note ? `Client's note: "${note}"` : ''}

View project: ${projectUrl}

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Changes requested on ${projectTitle}` };
}

// 12. Thank You for Review Email
export function reviewThankYouTemplate(
  clientName: string,
  projectTitle: string,
  rating: number
) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Thank you for your review
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      Your feedback on <strong style="color: ${BRAND.text};">${projectTitle}</strong> has been submitted.
    </p>
    
    ${infoBox(`
      <p style="margin: 0 0 8px; font-size: 12px; color: ${BRAND.textMuted}; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Your rating</p>
      <p style="margin: 0; font-size: 24px; color: #eab308; text-align: center; letter-spacing: 2px;">
        ${stars}
      </p>
    `)}
    
    <p style="margin: 32px 0 0; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.6; text-align: center;">
      We appreciate your time and look forward to working with you again.
    </p>
  `, `Thank you for your review`);

  const text = `
Thank you for your review

Your feedback on ${projectTitle} has been submitted.

Your rating: ${stars}

We appreciate your time and look forward to working with you again.

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Thank you for your review` };
}

// Client Invite to View Project
export function clientProjectInviteTemplate(
  clientName: string,
  projectTitle: string,
  teamName: string,
  projectUrl: string
) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Project ready for review
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      ${teamName} has shared <strong style="color: ${BRAND.text};">${projectTitle}</strong> with you. Review the deliverables, leave comments, and approve when ready.
    </p>
    
    ${primaryButton('View Project', projectUrl)}
    
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
      You'll need to create an account with this email address to access the project.
    </p>
  `, `${teamName} shared ${projectTitle} with you`);

  const text = `
Project ready for review

${teamName} has shared ${projectTitle} with you. Review the deliverables, leave comments, and approve when ready.

View project: ${projectUrl}

You'll need to create an account with this email address to access the project.

– ${APP_NAME}
`;

  return { html, text, subject: `${teamName} shared ${projectTitle} with you` };
}

// Password Reset Email
export function passwordResetTemplate(name: string, resetUrl: string) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.text}; letter-spacing: -0.3px;">
      Reset your password
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      We received a request to reset your password, ${name}. Click below to create a new one.
    </p>
    
    ${primaryButton('Reset Password', resetUrl)}
    
    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
      This link expires in 1 hour. If you didn't request this, you can ignore this email.
    </p>
    
    ${divider()}
    
    <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; line-height: 1.6;">
      If the button doesn't work, copy this link:<br>
      <a href="${resetUrl}" style="color: ${BRAND.primary}; word-break: break-all; font-size: 12px;">${resetUrl}</a>
    </p>
  `, `Reset your ${APP_NAME} password`);

  const text = `
Reset your password

We received a request to reset your password, ${name}. Click the link below to create a new one:

${resetUrl}

This link expires in 1 hour. If you didn't request this, you can ignore this email.

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Reset your password` };
}

// 13. Data Retention Warning
export function dataRetentionWarningTemplate(
  ownerName: string,
  projectTitle: string,
  deleteDate: string
) {
  const html = emailLayout(`
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: ${BRAND.warning}; letter-spacing: -0.3px;">
      Data retention warning
    </h1>
    <p style="margin: 0 0 32px; font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.6;">
      The data for project <strong style="color: ${BRAND.text};">${projectTitle}</strong> will be permanently deleted from our servers on ${deleteDate} as per our retention policy.
    </p>
    
    ${infoBox(`
      <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.6;">
        Please download any files you need before this date. The project metadata will remain, but files will be removed.
      </p>
    `, 'warning')}
  `, `Data deletion warning for ${projectTitle}`);

  const text = `
Data retention warning

The data for project ${projectTitle} will be permanently deleted from our servers on ${deleteDate} as per our retention policy.

Please download any files you need before this date.

– ${APP_NAME}
`;

  return { html, text, subject: `${APP_NAME} — Data deletion warning: ${projectTitle}` };
}