import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/orders';
import { signDownloadToken } from '@/lib/token';

export const runtime = 'nodejs';

// حالة الطلب للعميل. لو اتقبل نرجّع رابط تحميل موقّع (صالح ساعة).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
  }
  const downloadUrl =
    order.status === 'approved'
      ? `/api/download?token=${signDownloadToken()}`
      : undefined;
  return NextResponse.json(
    { status: order.status, downloadUrl },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
