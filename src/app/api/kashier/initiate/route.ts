import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// ==========================================================================
//  بدء عملية دفع Kashier (Hosted Payment Page):
//  على عكس Paymob، مفيش استدعاء API لإنشاء طلب مسبقًا — بنبني رابط التحويل
//  محليًا: mid + orderId + amount + currency بتتحوّل لـ hash بتوقيع
//  HMAC-SHA256 باستخدام الـ Secret Key، وبنحوّل المستخدم مباشرة.
//
//  صيغة الـ hash (من توثيق Kashier الرسمي):
//    path = "/?payment=" + mid + "." + orderId + "." + amount + "." + currency
//    hash = HMAC_SHA256(path, KASHIER_SECRET_KEY)  -> hex
//
//  ملاحظة: allowedMethods=card / allowedMethods=wallet استخدام مبدئي للحفاظ
//  على نفس فكرة زرّي "كارت" و"محفظة" الحاليين — تأكد من القيم الفعلية مع
//  Kashier أو من تجربة حقيقية في الـ sandbox، فالتوثيق العام مايوضّحش
//  القيم المقبولة بالتفصيل.
// ==========================================================================

const PRICE_EGP = Number(process.env.NEXT_PUBLIC_PRICE_EGP ?? 49);

function envOK() {
  return (
    !!process.env.KASHIER_MERCHANT_ID &&
    !!process.env.KASHIER_SECRET_KEY
  );
}

export async function POST(req: NextRequest) {
  if (!envOK()) {
    return NextResponse.json(
      { error: 'بوابة الدفع غير مُهيّأة بعد (مفاتيح Kashier ناقصة).' },
      { status: 503 }
    );
  }

  let method: 'card' | 'wallet' = 'card';
  try {
    const body = await req.json();
    if (body?.method === 'wallet') method = 'wallet';
  } catch {
    // نكمّل بالكارت افتراضيًا
  }

  const mid = process.env.KASHIER_MERCHANT_ID!;
  const secretKey = process.env.KASHIER_SECRET_KEY!;
  const mode = process.env.KASHIER_MODE === 'live' ? 'live' : 'test';
  const currency = 'EGP';
  const amount = PRICE_EGP.toFixed(2);
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const path = `/?payment=${mid}.${orderId}.${amount}.${currency}`;
  const hash = crypto.createHmac('sha256', secretKey).update(path).digest('hex');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const merchantRedirect = `${siteUrl}/success`;

  const base =
    mode === 'live'
      ? 'https://iframe.kashier.io/payment'
      : 'https://test-iframe.kashier.io/payment';

  const params = new URLSearchParams({
    mid,
    orderId,
    amount,
    currency,
    hash,
    merchantRedirect,
    allowedMethods: method,
    display: 'ar',
  });

  return NextResponse.json({ url: `${base}?${params.toString()}` });
}
