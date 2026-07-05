import { createHmac, timingSafeEqual } from "crypto";
import { env } from "../env";

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET || env.FORM_TOKEN_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET or FORM_TOKEN_SECRET must be set in environment");
  return secret;
}

export function signFormPasswordToken(formId: string): string {
    const SECRET = getSecret();
    const payload = JSON.stringify({ formId, exp: Date.now() + 3600000 });
    const hmac = createHmac("sha256", SECRET).update(payload).digest("hex");
    return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

export function verifyFormPasswordToken(token: string): { formId: string } | null {
    try {
        const SECRET = getSecret();
        const [encoded, sig] = token.split(".");
        if (!encoded || !sig) return null;
        const payload = Buffer.from(encoded, "base64").toString();
        const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
        if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
        const { formId, exp } = JSON.parse(payload);
        if (Date.now() > exp) return null;
        return { formId };
    } catch {
        return null;
    }
}
