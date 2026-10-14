import { NextRequest, NextResponse } from 'next/server';
import {
  listOrders,
  getReceipt,
  setStatus,
  deleteReceipt,
  deleteOrder,
  deleteProcessedReceipts,
} from '@/lib/orders';

export const runtime = 'nodejs';

function authed(req: NextRequest): boolean {
  const pw = req.headers.get('x-admin-password');
  return !!process.env.ADMIN_PASSWORD && pw === process.env.ADMIN_PASSWORD;
}

const unauthorized = () =>
  NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

// بدون باراميتر: قائمة الطلبات. ?receipt=<id>: صورة الإيصال لطلب واحد.
export async function GET(req: NextRequest) {
  if (!authed(req)) return unauthorized();
  const receiptId = req.nextUrl.searchParams.get('receipt');
  if (receiptId) {
    return NextResponse.json({ receipt: await getReceipt(receiptId) });
  }
  return NextResponse.json({ orders: await listOrders() });
}

// قبول/رفض طلب.
export async function PATCH(req: NextRequest) {
  if (!authed(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (body.status !== 'approved' && body.status !== 'rejected') {
    return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
  }
  const order = await setStatus(String(body.id ?? ''), body.status);
  if (!order) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
  }
  return NextResponse.json({ order });
}

// ?id=<id>&scope=receipt  → يمسح الإيصال بس
// ?id=<id>&scope=order    → يمسح الطلب كله
// ?scope=processed        → يمسح إيصالات كل الطلبات المقبولة/المرفوضة
export async function DELETE(req: NextRequest) {
  if (!authed(req)) return unauthorized();
  const scope = req.nextUrl.searchParams.get('scope');
  const id = req.nextUrl.searchParams.get('id') || '';
  if (scope === 'processed') {
    return NextResponse.json({ deleted: await deleteProcessedReceipts() });
  }
  if (scope === 'receipt') return NextResponse.json({ ok: await deleteReceipt(id) });
  if (scope === 'order') return NextResponse.json({ ok: await deleteOrder(id) });
  return NextResponse.json({ error: 'scope غير صالح' }, { status: 400 });
}
