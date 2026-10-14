import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ==========================================================================
//  بدء عملية دفع Paymob (التكامل الكلاسيكي):
//    1) auth token
//    2) إنشاء طلب (order)
//    3) إنشاء مفتاح دفع (payment key) بالـ integration المناسب
//    4) إرجاع رابط الـ iframe لتحويل المستخدم
//
//  ملاحظة عن المحفظة: نستخدم نفس الـ iframe للكارت والمحفظة — الـ iframe
//  بيعرض طريقة الدفع حسب الـ integration المرتبط بمفتاح الدفع، وبيجمع
//  رقم المحفظة من المستخدم بنفسه. لو حابب تدمج تدفّق محفظة مباشر (بدون
//  iframe) هتحتاج تجمع رقم الموبايل وتستخدم endpoint اسمه
//  /acceptance/payments/pay — الكود ده مكتوب للـ iframe لتبسيط التجربة.
// ==========================================================================

const PAYMOB_BASE = 'https://accept.paymob.com/api';
const PRICE_EGP = Number(process.env.NEXT_PUBLIC_PRICE_EGP ?? 49);

function envOK() {
  return (
    !!process.env.PAYMOB_API_KEY &&
    !!process.env.PAYMOB_IFRAME_ID &&
    !!process.env.PAYMOB_CARD_INTEGRATION_ID
  );
}

export async function POST(req: NextRequest) {
  if (!envOK()) {
    return NextResponse.json(
      { error: 'بوابة الدفع غير مُهيّأة بعد (مفاتيح Paymob ناقصة).' },
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

  const integrationId =
    method === 'wallet'
      ? process.env.PAYMOB_WALLET_INTEGRATION_ID ||
        process.env.PAYMOB_CARD_INTEGRATION_ID
      : process.env.PAYMOB_CARD_INTEGRATION_ID;

  const amountCents = Math.round(PRICE_EGP * 100);
  const merchantOrderId = `order_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    // 1) auth token
    const authRes = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });
    const authData = await authRes.json();
    const authToken = authData.token;
    if (!authToken) throw new Error('auth failed');

    // 2) إنشاء الطلب
    const orderRes = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId,
        items: [
          {
            name: 'كتاب: كيف تتغيّر للأفضل',
            amount_cents: amountCents,
            description: 'نسخة إلكترونية PDF',
            quantity: 1,
          },
        ],
      }),
    });
    const orderData = await orderRes.json();
    const orderId = orderData.id;
    if (!orderId) throw new Error('order failed');

    // 3) مفتاح الدفع
    const keyRes = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        currency: 'EGP',
        integration_id: Number(integrationId),
        // بيانات فوترة — نستخدم قيمًا مبدئية لأننا لا نجمّعها من المستخدم.
        // لو حابب تحسّن الإيصالات، اجمع الإيميل/الموبايل واملأهم هنا.
        billing_data: {
          apartment: 'NA',
          email: 'na@example.com',
          floor: 'NA',
          first_name: 'Customer',
          street: 'NA',
          building: 'NA',
          phone_number: '+201000000000',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'EG',
          last_name: 'Customer',
          state: 'NA',
        },
      }),
    });
    const keyData = await keyRes.json();
    const paymentToken = keyData.token;
    if (!paymentToken) throw new Error('payment key failed');

    // 4) رابط الـ iframe
    const url = `${PAYMOB_BASE}/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error('Paymob initiate error:', e);
    return NextResponse.json(
      { error: 'تعذّر بدء الدفع الآن، حاول تاني بعد شوية.' },
      { status: 502 }
    );
  }
}
