import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';

export const runtime = 'nodejs';

// إنشاء طلب جديد بإيصال InstaPay (الحالة: قيد المراجعة).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const order = await createOrder({
      email: String(body.email ?? ''),
      phone: String(body.phone ?? ''),
      receipt: String(body.receipt ?? ''),
    });
    return NextResponse.json({ id: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'خطأ' },
      { status: 400 }
    );
  }
}
