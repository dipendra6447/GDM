import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendPasswordResetEmailParams {
  toEmail: string;
  resetUrl: string;
}

/**
 * Sends a Password Reset Email using Resend
 */
export async function sendPasswordResetEmail({ toEmail, resetUrl }: SendPasswordResetEmailParams) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #111111; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 800; color: #D4AF37; letter-spacing: -0.5px; text-decoration: none; margin-bottom: 24px; display: inline-block; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #b0b0b0; margin-bottom: 24px; }
          .btn-wrap { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4); }
          .note { font-size: 13px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
          .link-fallback { color: #D4AF37; word-break: break-all; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ JobNest</div>
          <h1 class="title">Reset Your JobNest Password</h1>
          <p class="text">
            We received a request to reset the password for your JobNest account. Click the button below to choose a new password:
          </p>
          <div class="btn-wrap">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="text" style="font-size: 13px;">
            This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
          </p>
          <div class="note">
            <p>Button not working? Copy and paste this URL into your browser:</p>
            <p class="link-fallback">${resetUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn('\n⚠️ [Resend Warning]: RESEND_API_KEY is not configured in .env.local.');
    console.warn(`📩 Password Reset Link for ${toEmail}:\n${resetUrl}\n`);
    return { success: true, simulated: true, resetUrl };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobNest Security <onboarding@resend.dev>';
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'Reset Your JobNest Password',
      html: htmlContent,
    });

    if (response.error) {
      console.error('\n❌ [Resend Error]: Failed to send email via Resend API:');
      console.error(response.error);
      console.warn(`\n📩 Fallback Password Reset Link for ${toEmail}:\n${resetUrl}\n`);
      return { success: false, error: response.error, resetUrl };
    }

    console.log(`\n✅ Email successfully sent via Resend to ${toEmail} (Message ID: ${response.data?.id})\n`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('\n❌ Error invoking Resend SDK:', error);
    console.warn(`📩 Fallback Password Reset Link for ${toEmail}:\n${resetUrl}\n`);
    return { success: false, error, resetUrl };
  }
}
