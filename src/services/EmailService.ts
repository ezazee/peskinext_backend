import { transactionalEmailsApi } from "../libs/brevo";
import { SENDER_EMAIL, SENDER_NAME } from "../config/env";
import * as Brevo from "@getbrevo/brevo";

export const sendForgotPasswordEmail = async (email: string, name: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Reset Password - PE SkinPro";
  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;background-color:#f5f7fa;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;">
          
          <!-- TOP BORDER (DOKU STYLE) -->
          <tr>
            <td style="height:6px;background-color:#38BDF8;"></td>
          </tr>

          <!-- LOGO -->
          <tr>
            <td style="padding:24px 32px;">
              <img src="https://peskinpro.id/frontend/assets/images/logo/peskin.png" alt="PE Skinpro"
                   width="140" style="display:block;">
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <h2 style="font-size:20px;color:#111827;margin:0 0 16px 0;">
                Reset Password
              </h2>

              <h3>Halo ${name},</h3>
              

              <p style="font-size:14px;line-height:1.6;color:#374151;margin-bottom:20px;">
                Kami menerima permintaan untuk mengubah password akun Anda.
                Silakan klik tombol di bawah ini untuk melanjutkan proses reset password.
              </p>

              <!-- BUTTON -->
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${resetLink}"
                       style="background-color:#38BDF8;color:#ffffff;
                              padding:12px 24px;
                              font-size:14px;
                              font-weight:bold;
                              text-decoration:none;
                              border-radius:4px;
                              display:inline-block;">
                      Ganti Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#374151;margin-bottom:8px;">
                Link ini akan kedaluwarsa dalam <strong>30 menit</strong>.
              </p>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;">
                Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;
                       font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
              <strong>PT Kilau Berlian Nusantara</strong><br>
              Jl. Dukuh Patra II No.75, RT.1/RW.13, Menteng Dalam, Kec. Tebet, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12870, Indonesia<br><br>
              Email ini dikirim secara otomatis, mohon tidak membalas email ini.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  sendSmtpEmail.sender = { "name": SENDER_NAME, "email": SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": email, "name": name }];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      console.log(`[EmailService] Attempting to send email to ${email} (Attempt ${attempts + 1}/${maxAttempts})`);
      await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      console.log(`[EmailService] Reset password email sent successfully to ${email}`);
      return; // Success, exit function
    } catch (error: any) {
      attempts++;
      console.error(`[EmailService] Error (Attempt ${attempts}):`, error.message || error);

      // Check if it's a network/DNS error (EAI_AGAIN, ENOTFOUND, etc)
      const isNetworkError = error.message && (error.message.includes("EAI_AGAIN") || error.message.includes("ENOTFOUND") || error.message.includes("ETIMEDOUT"));

      if (isNetworkError && attempts < maxAttempts) {
        console.log(`[EmailService] Network error detected. Retrying in 2 seconds...`);
        await sleep(2000);
        continue;
      }

      // If not network error, or max attempts reached, throw finally
      if (attempts >= maxAttempts) {
        throw new Error("Gagal mengirim email reset password setelah beberapa percobaan. Cek koneksi server.");
      }
    }
  }
};
