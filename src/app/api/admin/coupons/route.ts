import { NextRequest, NextResponse } from 'next/server';
import { createCoupon, listCoupons, deleteCoupon } from '@/lib/coupons';

export const runtime = 'nodejs';

// حماية بسيطة: كل الطلبات لازم تبعت باسورد الأدمن في هيدر x-admin-password.
// حط الباسورد في .env.local:  ADMIN_PASSWORD=......
function authed(req: NextRequest): boolean {
  const pw = req.headers.get('x-admin-password');
  return !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });
  }
  return NextResponse.json({ coupons: await listCoupons() });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    const coupon = await createCoupon({
      code: typeof body.code === 'string' ? body.code : undefined,
      discountPercent: Number(body.discountPercent) || 100,
      maxUses: Number(body.maxUses) || 1,
    });
    return NextResponse.json({ coupon });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'خطأ' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });
  }
  const code = req.nextUrl.searchParams.get('code') || '';
  const ok = await deleteCoupon(code);
  return NextResponse.json({ ok });
}
