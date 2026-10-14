import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// ==========================================================================
//  Webhook تأكيد الدفع من Paymob (Transaction Processed Callback).
//
//  Paymob بيبعت POST بالمعاملة + قيمة hmac (في الـ query string).
//  بنتحقق من صحة الـ HMAC (SHA-512) عشان نتأكد إن الطلب فعلاً من Paymob،
//  وبعدها لو success=true نعتبر الدفع تم.
//
//  ⚠️ ملاحظة مهمة: الكود ده بيتحقق ويسجّل الدفعة الناجحة. لتسليم الكتاب
//     بشكل آمن (إيميل تلقائي / رابط موقّع لكل عميل) أضف قاعدة بيانات
//     وخدمة إيميل هنا — راجع README قسم "تسليم الكتاب".
// ==========================================================================

// ترتيب الحقول الذي يعتمده Paymob لحساب الـ HMAC لمعاملة (لا تغيّره).
const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
];

function getPath(obj: Record<string, unknown>, path: string): string {
  const val = path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    );
  if (val === true) return 'true';
  if (val === false) return 'false';
  if (val === null || val === undefined) return '';
  return String(val);
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  const receivedHmac = req.nextUrl.searchParams.get('hmac');
  if (!receivedHmac) {
    return NextResponse.json({ error: 'missing hmac' }, { status: 400 });
  }

  let payload: { obj?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const obj = payload.obj;
  if (!obj) {
    return NextResponse.json({ error: 'no transaction' }, { status: 400 });
  }

  // بناء السلسلة والتحقق من الـ HMAC
  const concatenated = HMAC_FIELDS.map((f) => getPath(obj, f)).join('');
  const computed = crypto
    .createHmac('sha512', secret)
    .update(concatenated)
    .digest('hex');

  const valid =
    computed.length === receivedHmac.length &&
    crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(receivedHmac)
    );

  if (!valid) {
    console.warn('Paymob webhook: invalid HMAC');
    return NextResponse.json({ error: 'invalid hmac' }, { status: 401 });
  }

  const success = obj.success === true || obj.success === 'true';
  const orderId = getPath(obj, 'order.id');
  const amount = getPath(obj, 'amount_cents');

  if (success) {
    // ✅ الدفع تم بنجاح والتحقق سليم.
    // TODO لتسليم آمن: خزّن الطلب في قاعدة بيانات وابعت رابط تحميل موقّع
    //      للعميل على إيميله. راجع README > "تسليم الكتاب".
    console.log(`Paymob: payment SUCCESS — order ${orderId}, ${amount} cents`);
  } else {
    console.log(`Paymob: payment FAILED/PENDING — order ${orderId}`);
  }

  // نرد 200 دايمًا للمعاملات الموثّقة عشان Paymob مايكررش الإرسال.
  return NextResponse.json({ received: true });
}
