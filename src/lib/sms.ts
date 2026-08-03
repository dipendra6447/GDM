export interface SendSmsOtpParams {
  phone: string;
  otpCode: string;
}

/**
 * Sends a 6-digit SMS Verification OTP.
 * Supports Twilio / Msg91 if environment variables are set.
 * Falls back to Dev Simulation Mode (console output) for development testing.
 */
export async function sendSmsOtp({ phone, otpCode }: SendSmsOtpParams) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

  const messageText = `Your GoDiscoverMe verification code is: ${otpCode}. Valid for 10 minutes.`;

  // 1. Twilio Integration
  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhone,
          To: phone,
          Body: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`📱 [Twilio SMS]: Sent OTP to ${phone} (SID: ${data.sid})`);
        return { success: true, provider: 'twilio', data };
      } else {
        console.error('❌ [Twilio SMS Error]:', data);
        return { success: false, error: data };
      }
    } catch (err) {
      console.error('❌ [Twilio Exception]:', err);
      return { success: false, error: err };
    }
  }

  // 2. Msg91 Integration (India DLT)
  if (msg91AuthKey && msg91TemplateId) {
    try {
      const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=${phone.replace(/\D/g, '')}&otp=${otpCode}`, {
        method: 'GET',
        headers: {
          authkey: msg91AuthKey,
        },
      });
      const data = await res.json();
      if (res.ok && data.type === 'success') {
        console.log(`📱 [Msg91 SMS]: Sent OTP to ${phone}`);
        return { success: true, provider: 'msg91', data };
      } else {
        console.error('❌ [Msg91 SMS Error]:', data);
        return { success: false, error: data };
      }
    } catch (err) {
      console.error('❌ [Msg91 Exception]:', err);
      return { success: false, error: err };
    }
  }

  // 3. Dev Simulation Mode Fallback
  console.warn('\n⚠️ [SMS Dev Simulation Mode]: TWILIO or MSG91 environment variables are not set.');
  console.warn(`📱 [Simulated SMS OTP for ${phone}]: CODE: ${otpCode}\n`);
  return { success: true, simulated: true, otpCode };
}
