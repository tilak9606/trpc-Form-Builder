function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function verificationEmailTemplate(
  verifyUrl: string,
  name: string,
): { html: string; text: string } {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verifyUrl);
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your email</title>
</head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 24px; color: #111;">
  <h2 style="margin-bottom: 8px;">Hi ${safeName},</h2>
  <p style="color: #555; line-height: 1.6;">Thanks for signing up! Please verify your email address to activate your account.</p>
  <a href="${safeUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Verify Email</a>
  <p style="color: #888; font-size: 13px;">Or copy this link: <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">${safeUrl}</code></p>
  <p style="color: #888; font-size: 13px; margin-top: 24px;">This link expires in 24 hours.</p>
</body>
</html>
  `.trim();

  const text = `Hi ${name},\n\nPlease verify your email by clicking this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`;

  return { html, text };
}

export function passwordResetEmailTemplate(resetUrl: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
</head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; padding: 24px; color: #111;">
  <h2 style="margin-bottom: 8px;">Password Reset</h2>
  <p style="color: #555; line-height: 1.6;">You requested a password reset. Click the button below to set a new password.</p>
  <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">Reset Password</a>
  <p style="color: #888; font-size: 13px;">Or copy this link: <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">${resetUrl}</code></p>
  <p style="color: #888; font-size: 13px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
  `.trim();

  const text = `Password Reset\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.`;

  return { html, text };
}
