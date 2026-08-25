import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// ==========================================================================
//  إدارة الكوبونات — تخزين دائم.
//
//  ✅ على Vercel: بيستخدم Upstash Redis / Vercel KV تلقائيًا لو المتغيرات
//     دي موجودة:  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//     (أو KV_REST_API_URL + KV_REST_API_TOKEN من تكامل Vercel).
//
//  🖥️ محليًا / على VPS من غير المتغيرات دي: بيرجع لملف JSON محلي
//     (.data/coupons.json).
//
//  ملاحظة: الاستهلاك (single-use) بيتم بقراءة-تعديل-كتابة؛ لسوق كوبونات
//  موزّعة يدويًا ده كافٍ تمامًا.
// ==========================================================================

export type Coupon = {
  code: string;
  discountPercent: number; // 100 = تحميل مجاني مباشر
  maxUses: number; // كام مرة صالح (افتراضي 1)
  usedCount: number;
  createdAt: string;
};

// ---- اختيار المخزن ----
const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS = !!(REDIS_URL && REDIS_TOKEN);
const REDIS_KEY = 'coupons:v1';

const FILE = path.join(process.cwd(), '.data', 'coupons.json');

// ---- Upstash Redis REST ----
async function redisCmd(cmd: string[]): Promise<unknown> {
  const res = await fetch(REDIS_URL as string, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error('Redis: ' + data.error);
  return data.result ?? null;
}

// ---- قراءة/كتابة كل الكوبونات (نفس الشكل للمخزنين) ----
async function readAll(): Promise<Record<string, Coupon>> {
  if (USE_REDIS) {
    const raw = (await redisCmd(['GET', REDIS_KEY])) as string | null;
    return raw ? (JSON.parse(raw) as Record<string, Coupon>) : {};
  }
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as Record<string, Coupon>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, Coupon>): Promise<void> {
  if (USE_REDIS) {
    await redisCmd(['SET', REDIS_KEY, JSON.stringify(data)]);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ---- أدوات ----
function normalize(code: string): string {
  return code.trim().toUpperCase();
}

function genCode(): string {
  return 'BOOK-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// ---- العمليات ----
export async function listCoupons(): Promise<Coupon[]> {
  const all = await readAll();
  return Object.values(all).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function createCoupon(opts: {
  code?: string;
  discountPercent?: number;
  maxUses?: number;
}): Promise<Coupon> {
  const all = await readAll();
  const code = opts.code ? normalize(opts.code) : genCode();

  if (!/^[A-Z0-9\-_]{3,32}$/.test(code)) {
    throw new Error('كود غير صالح (حروف/أرقام إنجليزي، 3–32 خانة)');
  }
  if (all[code]) throw new Error('الكوبون ده موجود بالفعل');

  const coupon: Coupon = {
    code,
    discountPercent: Math.min(100, Math.max(1, opts.discountPercent ?? 100)),
    maxUses: Math.max(1, Math.floor(opts.maxUses ?? 1)),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  all[code] = coupon;
  await writeAll(all);
  return coupon;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const all = await readAll();
  const key = normalize(code);
  if (!all[key]) return false;
  delete all[key];
  await writeAll(all);
  return true;
}

// يستهلك مرة واحدة من الكوبون لو صالح.
export async function redeemCoupon(
  code: string
): Promise<{ ok: true; coupon: Coupon } | { ok: false; reason: string }> {
  const key = normalize(code);
  const all = await readAll();
  const c = all[key];
  if (!c) return { ok: false, reason: 'الكوبون غير صحيح' };
  if (c.usedCount >= c.maxUses) {
    return { ok: false, reason: 'الكوبون ده اتستخدم خلاص' };
  }
  c.usedCount += 1;
  all[key] = c;
  await writeAll(all);
  return { ok: true, coupon: c };
}
