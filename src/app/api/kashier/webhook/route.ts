import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// ==========================================================================
//  Webhook تأكيد الدفع من Kashier.
//
//  Kashier بيبعت POST بـ { event, data } ورأس x-kashier-signature.
//  data.signatureKeys بتحدد أي حقول من data اتوقّعت: بنرتّبها أبجديًا،
//  بنبني منها query string (key=value&key=value)، وبنحسب HMAC-SHA256
//  باستخدام الـ Payment API Key، ونقارنه بالـ header.
//
//  ⚠️ ملاحظة مهمة: الكود ده بيتحقق ويسجّل الدفعة الناجحة فقط. لتسليم الكتاب
//     بشكل آمن (إيميل تلقائي / رابط موقّع لكل عميل) أضف قاعدة بيانات
//     وخدمة إيميل هنا — راجع README قسم "تسليم الكتاب".
// ==========================================================================

function buildSignaturePayload(
  data: Record<string, unknown>,
  signatureKeys: string[]
): string {
  const sortedKeys = [...signatureKeys].sort();
  return sortedKeys
    .map((key) => `${key}=${String(data[key] ?? '')}`)
    .join('&');
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.KASHIER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const receivedSignature = req.headers.get('x-kashier-signature');
  if (!receivedSignature) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  let payload: { event?: string; data?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { event, data } = payload;
  const signatureKeys = data?.signatureKeys as string[] | undefined;
  if (!data || !Array.isArray(signatureKeys)) {
    return NextResponse.json({ error: 'no transaction' }, { status: 400 });
  }

  const signaturePayload = buildSignaturePayload(data, signatureKeys);
  const computed = crypto
    .createHmac('sha256', apiKey)
    .update(signaturePayload)
    .digest('hex');

  const valid =
    computed.length === receivedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(receivedSignature)
    );

  if (!valid) {
    console.warn('Kashier webhook: invalid signature');
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  const status = String(data.status ?? '').toUpperCase();
  const orderId = data.merchantOrderId ?? data.orderReference ?? '';
  const amount = data.amount ?? '';

  if (status === 'SUCCESS') {
    // ✅ الدفع تم بنجاح والتحقق سليم.
    // TODO لتسليم آمن: خزّن الطلب في قاعدة بيانات وابعت رابط تحميل موقّع
    //      للعميل على إيميله. راجع README > "تسليم الكتاب".
    console.log(
      `Kashier: payment SUCCESS — event ${event}, order ${orderId}, ${amount} EGP`
    );
  } else {
    console.log(`Kashier: payment ${status || 'UNKNOWN'} — order ${orderId}`);
  }

  // نرد 200 دايمًا للمعاملات الموثّقة عشان Kashier مايكررش الإرسال.
  return NextResponse.json({ received: true });
}
