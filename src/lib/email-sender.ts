import { Resend } from 'resend';

export interface EmailSendResult {
  sent: boolean;
  error?: string;
}

/**
 * Send the generated composite image to the user's email.
 *
 * @param email - Recipient email address
 * @param imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param sceneName - Name of the scene used for the composite
 * @returns true if email sent successfully, false otherwise
 */
export async function sendGeneratedImage(
  email: string,
  imageBase64: string,
  sceneName: string
): Promise<EmailSendResult> {
  if (!process.env.RESEND_API_KEY) {
    const error = 'RESEND_API_KEY is not configured';
    console.warn(`⚠️ ${error}. Skipping email delivery.`);
    return { sent: false, error };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'IP Verse AI <onboarding@resend.dev>';

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Convert base64 to Buffer for attachment
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `進入虛擬偶像的世界｜${sceneName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0614; color: #e8e0f0; padding: 40px 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">
              ✨ IP Verse AI
            </h1>
          </div>
          
          <p style="font-size: 18px; text-align: center; margin-bottom: 10px;">
            你的 AI 合照已完成！
          </p>
          
          <p style="font-size: 14px; color: #a0a0b0; text-align: center; margin-bottom: 30px;">
            場景：${sceneName}
          </p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #a0a0b0;">
              你的合照已附在此封郵件中，請查收附件 📎
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            此為系統自動發送的郵件，請勿直接回覆。<br/>
            感謝你的參與！
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `ip-verse-ai-${sceneName}.png`,
          content: imageBuffer,
          contentType: 'image/png',
        },
      ],
    });

    if (result.error) {
      const errorMessage =
        result.error.message || result.error.name || 'Resend API returned an error';
      console.error('Email sending failed:', result.error);
      return { sent: false, error: errorMessage };
    }

    console.log(
      `✅ Email sent to ${email} (scene: ${sceneName}, id: ${result.data?.id || 'unknown'})`
    );
    return { sent: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown email delivery error';
    console.error('Email sending failed:', error);
    return { sent: false, error: errorMessage };
  }
}
