import { NextRequest, NextResponse } from 'next/server';
import { redeemCoupon } from '@/lib/coupons';
import { signDownloadToken } from '@/lib/token';

export const runtime = 'nodejs';

// استخدام كوبون من الزائر. لو الكوبون 100% وصالح → بنستهلك مرة ونرجّع رابط تحميل موقّع.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code : '';
  if (!code.trim()) {
    return NextResponse.json(
      { ok: false, error: 'اكتب الكوبون الأول' },
      { status: 400 }
    );
  }

  const res = await redeemCoupon(code);
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.reason }, { status: 400 });
  }

  const c = res.coupon;

  if (c.discountPercent >= 100) {
    // تحميل مجاني مباشر
    const token = signDownloadToken();
    return NextResponse.json({
      ok: true,
      free: true,
      downloadUrl: `/api/download?token=${token}`,
    });
  }

  // خصم جزئي (< 100%) — حاليًا مدعوم كمعلومة فقط؛ ربطه بسعر Kashier خطوة تانية.
  return NextResponse.json({
    ok: true,
    free: false,
    discountPercent: c.discountPercent,
  });
}
