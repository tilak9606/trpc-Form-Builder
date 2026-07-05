import { env } from "../env";
import { logger } from "@repo/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  // Development: log to console
  if (env.NODE_ENV !== "production") {
    logger.info(`Email to ${to}: ${subject}`);
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