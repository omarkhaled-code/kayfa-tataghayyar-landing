import crypto from 'crypto';

// ==========================================================================
//  توكن تحميل موقّع (HMAC) وقصير العمر — بيتصدر بعد الدفع الناجح أو بعد
//  استخدام كوبون صالح، والـ /api/download بيتحقق منه قبل ما يسلّم الكتاب.
//  ⚠️ حط سر قوي في .env.local:  DOWNLOAD_TOKEN_SECRET=......
// ==========================================================================

const SECRET =
  process.env.DOWNLOAD_TOKEN_SECRET || 'dev-insecure-secret-change-me';

const DEFAULT_TTL_MS = 60 * 60 * 1000; // ساعة

export function signDownloadToken(ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(`d.${exp}`)
    .digest('hex');
  return `${exp}.${sig}`;
}

export function verifyDownloadToken(token: string | null): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`d.${exp}`)
    .digest('hex');
  return (
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}
