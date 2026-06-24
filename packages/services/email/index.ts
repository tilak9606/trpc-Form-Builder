import { env } from "../env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  // Development: log to console
  if (env.NODE_ENV !== "production") {
    console.log("\n========== EMAIL ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text || "N/A"}`);
    console.log("===========================\n");
    return;
  }

  // Production: use Resend (recommended) or SMTP
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
    return;
  }

  throw new Error("No email provider configured");
}