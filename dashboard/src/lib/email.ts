import { Resend } from 'resend';

// Initialize Resend client (null if not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface TeamInviteEmailOptions {
  to: string;
  teamName: string;
  inviterName: string;
  role: 'admin' | 'member';
  inviteLink?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Send team invitation email
 */
export async function sendTeamInviteEmail({
  to,
  teamName,
  inviterName,
  role,
  inviteLink,
}: TeamInviteEmailOptions): Promise<EmailResult> {
  if (!resend) {
    // Graceful degradation - don't fail if email not configured
    console.warn('[EMAIL] Resend not configured, skipping invitation email');
    return { success: true, error: 'email_not_configured' };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@aicontrolframework.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aicontrolframework.com';
  const link = inviteLink || `${appUrl}/dashboard/teams`;

  try {
    const { data, error } = await resend.emails.send({
      from: `AI Control Framework <${fromEmail}>`,
      to: [to],
      subject: `You've been invited to join ${teamName}`,
      html: getInviteEmailHtml({ teamName, inviterName, role, inviteLink: link }),
      text: getInviteEmailText({ teamName, inviterName, role, inviteLink: link }),
    });

    if (error) {
      console.error('[EMAIL] Send error:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Team invite sent to:', to);
    return { success: true, messageId: data?.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send notification when user is added to team (already has account)
 */
export async function sendTeamAddedEmail({
  to,
  teamName,
  role,
}: Omit<TeamInviteEmailOptions, 'inviterName' | 'inviteLink'>): Promise<EmailResult> {
  if (!resend) {
    return { success: true, error: 'email_not_configured' };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@aicontrolframework.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aicontrolframework.com';

  try {
    const { data, error } = await resend.emails.send({
      from: `AI Control Framework <${fromEmail}>`,
      to: [to],
      subject: `You've been added to ${teamName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1f2937;">You've been added to ${teamName}</h2>

  <p>You now have <strong>${role}</strong> access to the team workspace.</p>

  <div style="margin: 30px 0;">
    <a href="${appUrl}/dashboard/teams" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Team Dashboard</a>
  </div>

  <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
    AI Control Framework
  </p>
</body>
</html>
      `.trim(),
      text: `You've been added to ${teamName} with ${role} access. View your team dashboard at ${appUrl}/dashboard/teams`,
    });

    if (error) {
      console.error('[EMAIL] Send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error('[EMAIL] Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

interface EmailTemplateParams {
  teamName: string;
  inviterName: string;
  role: 'admin' | 'member';
  inviteLink: string;
}

function getInviteEmailHtml({ teamName, inviterName, role, inviteLink }: EmailTemplateParams): string {
  const roleDescription = role === 'admin'
    ? 'As an admin, you can manage team members and settings.'
    : 'As a member, you can access shared frameworks and resources.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">AI Control Framework</h1>
  </div>

  <h2 style="color: #1f2937;">You're invited to join ${teamName}</h2>

  <p><strong>${inviterName}</strong> has invited you to join their team on AI Control Framework as a <strong>${role}</strong>.</p>

  <p>${roleDescription}</p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1f2937;">What's next?</h3>
    <p style="margin-bottom: 15px;">Click the button below to accept your invitation and get started.</p>
    <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Accept Invitation</a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    If you weren't expecting this invitation, you can safely ignore this email.
  </p>

  <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    AI Control Framework - Deployability Rating System
  </p>
</body>
</html>
  `.trim();
}

function getInviteEmailText({ teamName, inviterName, role, inviteLink }: EmailTemplateParams): string {
  const roleDescription = role === 'admin'
    ? 'As an admin, you can manage team members and settings.'
    : 'As a member, you can access shared frameworks and resources.';

  return `
You're invited to join ${teamName}

${inviterName} has invited you to join their team on AI Control Framework as a ${role}.

${roleDescription}

Accept your invitation: ${inviteLink}

If you weren't expecting this invitation, you can safely ignore this email.

---
AI Control Framework - Deployability Rating System
  `.trim();
}
