import crypto from 'crypto';
import { kvGet, kvSet, kvDel } from './kv';

// ==========================================================================
//  طلبات الدفع عبر InstaPay.
//  - بيانات الطلب في  order:<id>  (صغيرة)، وفهرس الأرقام في  orders:ids
//  - صورة الإيصال لوحدها في  receipt:<id>  عشان نقدر نمسحها من غير الطلب.
// ==========================================================================

export type OrderStatus = 'pending' | 'approved' | 'rejected';

export type Order = {
  id: string;
  status: OrderStatus;
  email: string;
  phone: string;
  createdAt: string;
  decidedAt?: string;
  hasReceipt: boolean;
};

const INDEX_KEY = 'orders:ids';
const MAX_RECEIPT_CHARS = 700_000; // ~500KB صورة بعد الضغط
const RECEIPT_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

async function readIds(): Promise<string[]> {
  const raw = await kvGet(INDEX_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  const raw = await kvGet(`order:${id}`);
  return raw ? (JSON.parse(raw) as Order) : null;
}

async function saveOrder(o: Order): Promise<void> {
  await kvSet(`order:${o.id}`, JSON.stringify(o));
}

export async function createOrder(input: {
  email: string;
  phone: string;
  receipt: string;
}): Promise<Order> {
  const email = input.email.trim().slice(0, 120);
  const phone = input.phone.trim().slice(0, 20);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('الإيميل غير صحيح');
  }
  if (!/^[0-9+\s-]{10,20}$/.test(phone)) {
    throw new Error('رقم الموبايل غير صحيح');
  }
  if (
    input.receipt.length > MAX_RECEIPT_CHARS ||
    !RECEIPT_RE.test(input.receipt)
  ) {
    throw new Error('صورة الإيصال غير صالحة أو كبيرة جدًا');
  }

  const order: Order = {
    id: crypto.randomBytes(8).toString('hex'),
    status: 'pending',
    email,
    phone,
    createdAt: new Date().toISOString(),
    hasReceipt: true,
  };
  await kvSet(`receipt:${order.id}`, input.receipt);
  await saveOrder(order);
  const ids = await readIds();
  ids.push(order.id);
  await kvSet(INDEX_KEY, JSON.stringify(ids));
  return order;
}

export async function listOrders(): Promise<Order[]> {
  const ids = await readIds();
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders
    .filter((o): o is Order => !!o)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReceipt(id: string): Promise<string | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  return kvGet(`receipt:${id}`);
}

export async function setStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<Order | null> {
  const o = await getOrder(id);
  if (!o) return null;
  o.status = status;
  o.decidedAt = new Date().toISOString();
  await saveOrder(o);
  return o;
}

// يمسح صورة الإيصال فقط ويسيب بيانات الطلب.
export async function deleteReceipt(id: string): Promise<boolean> {
  const o = await getOrder(id);
  if (!o) return false;
  await kvDel(`receipt:${id}`);
  o.hasReceipt = false;
  await saveOrder(o);
  return true;
}

// يمسح الطلب بالكامل (البيانات + الإيصال).
export async function deleteOrder(id: string): Promise<boolean> {
  const o = await getOrder(id);
  if (!o) return false;
  await kvDel(`receipt:${id}`);
  await kvDel(`order:${id}`);
  const ids = (await readIds()).filter((x) => x !== id);
  await kvSet(INDEX_KEY, JSON.stringify(ids));
  return true;
}

// يمسح إيصالات كل الطلبات اللي اتحسمت (مقبولة/مرفوضة). يرجّع عددها.
export async function deleteProcessedReceipts(): Promise<number> {
  const all = await listOrders();
  let n = 0;
  for (const o of all) {
    if (o.status !== 'pending' && o.hasReceipt) {
      await deleteReceipt(o.id);
      n++;
    }
  }
  return n;
}
