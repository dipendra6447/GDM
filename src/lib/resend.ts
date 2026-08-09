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

export interface SendWelcomeEmailParams {
  toEmail: string;
  name?: string;
  role?: string;
}

/**
 * Sends a Welcome Email to new users on registration
 */
export async function sendWelcomeEmail({ toEmail, name, role }: SendWelcomeEmailParams) {
  const userName = name || 'JobNest Member';
  const roleTitle = role === 'job_seeker' ? 'Job Seeker' : role === 'job_poster' ? 'Employer' : role === 'business_promoter' ? 'Business Promoter' : 'Member';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #111111; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .logo { font-size: 24px; font-weight: 800; color: #D4AF37; letter-spacing: -0.5px; text-decoration: none; margin-bottom: 24px; display: inline-block; }
          .badge { display: inline-block; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); color: #D4AF37; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #b0b0b0; margin-bottom: 24px; }
          .btn-wrap { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4); }
          .note { font-size: 13px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ JobNest</div>
          <br />
          <div class="badge">${roleTitle} Account</div>
          <h1 class="title">Welcome to JobNest, ${userName}! 🎉</h1>
          <p class="text">
            Thank you for joining JobNest — your premier destination for career opportunities, talent acquisition, and business growth.
          </p>
          <p class="text">
            Your account has been created successfully. Explore your dashboard to start getting the most out of your membership.
          </p>
          <div class="btn-wrap">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="btn" target="_blank">Access Your Dashboard</a>
          </div>
          <div class="note">
            <p>If you have any questions, reply directly to this email or reach out to our 24/7 support team.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn('\n⚠️ [Resend Warning]: RESEND_API_KEY is not configured in .env.local.');
    console.warn(`📩 Welcome Email simulated for ${toEmail} (${userName})\n`);
    return { success: true, simulated: true };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobNest Welcome <onboarding@resend.dev>';
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Welcome to JobNest, ${userName}! ✨`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('❌ [Resend Error]: Welcome email failed:', response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Welcome Email sent to ${toEmail} (ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending Welcome Email:', error);
    return { success: false, error };
  }
}

export interface SendSubscriptionReceiptEmailParams {
  toEmail: string;
  billingName: string;
  planName: string;
  tier: string;
  amount: number;
  billingCycle: string;
  invoiceNumber: string;
  expiresAt: string | Date;
}

/**
 * Sends a Subscription Confirmation & Invoice Receipt Email
 */
export async function sendSubscriptionReceiptEmail({
  toEmail,
  billingName,
  planName,
  tier,
  amount,
  billingCycle,
  invoiceNumber,
  expiresAt,
}: SendSubscriptionReceiptEmailParams) {
  const formattedExpiry = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
          .receipt-box { background: #18181b; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #27272a; font-size: 14px; }
          .receipt-row:last-child { border-bottom: none; }
          .label { color: #a1a1aa; }
          .value { color: #ffffff; font-weight: 600; text-align: right; }
          .gold-value { color: #D4AF37; font-weight: 700; }
          .btn-wrap { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4); }
          .note { font-size: 13px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ JobNest Premium</div>
          <h1 class="title">Subscription Activated! 👑</h1>
          <p class="text">
            Hi <strong>${billingName}</strong>, thank you for upgrading! Your <strong>JobNest Premium</strong> subscription is now active.
          </p>
          <div class="receipt-box">
            <div class="receipt-row">
              <span class="label">Invoice Number</span>
              <span class="value">${invoiceNumber}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Plan Purchased</span>
              <span class="value gold-value">${planName} (${tier.toUpperCase()})</span>
            </div>
            <div class="receipt-row">
              <span class="label">Billing Cycle</span>
              <span class="value" style="text-transform: capitalize;">${billingCycle}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Total Paid (incl. Tax)</span>
              <span class="value gold-value">$${amount}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Access Valid Until</span>
              <span class="value">${formattedExpiry}</span>
            </div>
          </div>
          <div class="btn-wrap">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription" class="btn" target="_blank">Manage Subscription</a>
          </div>
          <div class="note">
            <p>You can view and download all your tax invoices anytime in your JobNest Billing Dashboard.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn('\n⚠️ [Resend Warning]: RESEND_API_KEY is not configured in .env.local.');
    console.warn(`📩 Subscription Receipt Email simulated for ${toEmail} (${invoiceNumber})\n`);
    return { success: true, simulated: true };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobNest Billing <billing@resend.dev>';
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Receipt for Your JobNest Premium Subscription (${invoiceNumber}) 💳`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('❌ [Resend Error]: Subscription receipt email failed:', response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Subscription Receipt Email sent to ${toEmail} (ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending Subscription Receipt Email:', error);
    return { success: false, error };
  }
}

export interface SendContactInquiryEmailParams {
  toEmail: string;
  fullName: string;
  serviceType: string;
  budget?: string;
  timeline?: string;
  message: string;
  company?: string;
  phone?: string;
  inquiryId?: string;
}

/**
 * Sends a Contact Inquiry / Quote Request Confirmation Email
 */
export async function sendContactInquiryEmail({
  toEmail,
  fullName,
  serviceType,
  budget,
  timeline,
  message,
  company,
  phone,
  inquiryId,
}: SendContactInquiryEmailParams) {
  const formattedService = serviceType
    ? serviceType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Custom Service';

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
          .summary-box { background: #18181b; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #27272a; font-size: 14px; }
          .summary-row:last-child { border-bottom: none; }
          .label { color: #a1a1aa; }
          .value { color: #ffffff; font-weight: 600; text-align: right; }
          .gold-value { color: #D4AF37; font-weight: 700; }
          .btn-wrap { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4); }
          .note { font-size: 13px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✨ JobNest Enterprise</div>
          <h1 class="title">Inquiry Received! ✉️</h1>
          <p class="text">
            Hi <strong>${fullName}</strong>, thank you for reaching out to JobNest! We have received your project inquiry and assigned it to our senior technical team.
          </p>
          <div class="summary-box">
            ${inquiryId ? `
            <div class="summary-row">
              <span class="label">Reference ID</span>
              <span class="value gold-value">${inquiryId}</span>
            </div>` : ''}
            <div class="summary-row">
              <span class="label">Requested Service</span>
              <span class="value gold-value">${formattedService}</span>
            </div>
            ${budget ? `
            <div class="summary-row">
              <span class="label">Estimated Budget</span>
              <span class="value">${budget}</span>
            </div>` : ''}
            ${timeline ? `
            <div class="summary-row">
              <span class="label">Desired Timeline</span>
              <span class="value">${timeline}</span>
            </div>` : ''}
            ${company ? `
            <div class="summary-row">
              <span class="label">Company</span>
              <span class="value">${company}</span>
            </div>` : ''}
          </div>
          <p class="text" style="font-size: 14px;">
            <strong>Your Message:</strong><br />
            <em style="color: #d4d4d8;">"${message}"</em>
          </p>
          <div class="btn-wrap">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contact" class="btn" target="_blank">Contact Support</a>
          </div>
          <div class="note">
            <p>Our solutions team will analyze your requirements and get back to you within <strong>2 business hours</strong>.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn('\n⚠️ [Resend Warning]: RESEND_API_KEY is not configured in .env.local.');
    console.warn(`📩 Contact Inquiry Confirmation Email simulated for ${toEmail} (${formattedService})\n`);
    return { success: true, simulated: true };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobNest Support <support@resend.dev>';
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `We've Received Your ${formattedService} Inquiry — JobNest ✨`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('❌ [Resend Error]: Contact inquiry email failed:', response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Contact Inquiry Email sent to ${toEmail} (ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending Contact Inquiry Email:', error);
    return { success: false, error };
  }
}

export interface SendEmailOtpParams {
  toEmail: string;
  otpCode: string;
}

/**
 * Sends a 6-digit Email Verification OTP using Resend
 */
export async function sendEmailOtp({ toEmail, otpCode }: SendEmailOtpParams) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1739; color: #ffffff; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; color: #1f2937; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); text-align: center; }
          .logo { font-size: 26px; font-weight: 800; color: #00B0FF; margin-bottom: 24px; display: inline-block; }
          .logo span { color: #0038FF; }
          .title { font-size: 22px; font-weight: 800; color: #0b1739; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .otp-box { background: #f0f7ff; border: 2px dashed #0072FF; border-radius: 16px; padding: 20px; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #0038FF; margin: 24px 0; }
          .note { font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 28px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">JobNest</div>
          <h1 class="title">Verify Your Email Address</h1>
          <p class="text">
            Use the 6-digit verification code below to complete your signup on JobNest:
          </p>
          <div class="otp-box">${otpCode}</div>
          <p class="text" style="font-size: 13px;">
            This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          <div class="note">
            <p>If you did not request this email verification, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn('\n⚠️ [Resend Dev Simulation Mode]: RESEND_API_KEY is not set in .env.local.');
    console.warn(`📩 [Simulated Email OTP for ${toEmail}]: CODE: ${otpCode}\n`);
    return { success: true, simulated: true, otpCode };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobNest Verification <onboarding@resend.dev>';
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `${otpCode} is your JobNest verification code 🔐`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('❌ [Resend Error]: Email OTP failed:', response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Email OTP sent to ${toEmail} (ID: ${response.data?.id})`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error sending Email OTP:', error);
    return { success: false, error };
  }
}



