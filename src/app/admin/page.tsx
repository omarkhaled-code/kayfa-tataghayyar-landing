'use client';

import { useState } from 'react';

type Coupon = {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  createdAt: string;
};

type Order = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  email: string;
  phone: string;
  createdAt: string;
  hasReceipt: boolean;
};

const STATUS_LABEL = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
} as const;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'orders' | 'coupons'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewing, setViewing] = useState<{ id: string; src: string | null } | null>(null);

  // نموذج إنشاء
  const [code, setCode] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [discount, setDiscount] = useState(100);

  async function api(method: string, body?: object, qs = '') {
    const res = await fetch('/api/admin/coupons' + qs, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res;
  }

  async function ordersApi(method: string, body?: object, qs = '') {
    return fetch('/api/admin/orders' + qs, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async function refreshOrders() {
    const res = await ordersApi('GET');
    const data = await res.json();
    setOrders(data.orders || []);
  }

  async function viewReceipt(id: string) {
    setViewing({ id, src: null });
    const res = await ordersApi('GET', undefined, `?receipt=${id}`);
    const data = await res.json();
    setViewing({ id, src: data.receipt || null });
  }

  async function decide(id: string, status: 'approved' | 'rejected') {
    await ordersApi('PATCH', { id, status });
    refreshOrders();
  }

  async function deleteReceipt(id: string) {
    if (!confirm('تمسح صورة الإيصال دي؟ مش هتقدر ترجعها.')) return;
    await ordersApi('DELETE', undefined, `?scope=receipt&id=${id}`);
    setViewing(null);
    refreshOrders();
  }

  async function deleteOrder(id: string) {
    if (!confirm('تمسح الطلب كله (البيانات + الإيصال)؟')) return;
    await ordersApi('DELETE', undefined, `?scope=order&id=${id}`);
    setViewing(null);
    refreshOrders();
  }

  async function deleteProcessed() {
    if (!confirm('تمسح إيصالات كل الطلبات المقبولة والمرفوضة؟')) return;
    const res = await ordersApi('DELETE', undefined, '?scope=processed');
    const data = await res.json();
    setMsg(`اتمسح ${data.deleted} إيصال.`);
    refreshOrders();
  }

  async function login() {
    setMsg(null);
    const res = await api('GET');
    if (res.status === 401) {
      setMsg('الباسورد غلط.');
      return;
    }
    const data = await res.json();
    setCoupons(data.coupons || []);
    setAuthed(true);
    const ores = await ordersApi('GET');
    const odata = await ores.json();
    setOrders(odata.orders || []);
  }

  async function refresh() {
    const res = await api('GET');
    const data = await res.json();
    setCoupons(data.coupons || []);
  }

  async function create() {
    setMsg(null);
    const res = await api('POST', {
      code: code.trim() || undefined,
      discountPercent: discount,
      maxUses,
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'خطأ');
      return;
    }
    setCode('');
    setMsg(`اتعمل الكوبون: ${data.coupon.code}`);
    refresh();
  }

  async function remove(c: string) {
    await api('DELETE', undefined, `?code=${encodeURIComponent(c)}`);
    refresh();
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setMsg(`اتنسخ: ${text}`);
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-5">
        <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-lg">
          <h1 className="mb-1 text-2xl font-extrabold text-navy">لوحة الأدمن</h1>
          <p className="mb-6 text-sm text-ink/60">للأدمن فقط</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="باسورد الأدمن"
            className="mb-3 w-full rounded-xl border border-navy/20 bg-ivory px-4 py-3 text-center outline-none focus:border-gold"
          />
          <button
            onClick={login}
            className="w-full rounded-xl bg-navy px-6 py-3 font-bold text-ivory transition hover:bg-navy-light"
          >
            دخول
          </button>
          {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-extrabold text-navy">لوحة الأدمن</h1>

        <div className="mb-6 flex gap-2">
          {(['orders', 'coupons'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMsg(null);
              }}
              className={
                'rounded-xl px-5 py-2 font-bold transition ' +
                (tab === t
                  ? 'bg-navy text-ivory'
                  : 'bg-white text-navy hover:bg-navy/5')
              }
            >
              {t === 'orders'
                ? `الطلبات (${orders.filter((o) => o.status === 'pending').length})`
                : 'الكوبونات'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <button
                onClick={refreshOrders}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-navy hover:bg-navy/5"
              >
                🔄 تحديث
              </button>
              <button
                onClick={deleteProcessed}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                🗑️ امسح إيصالات الطلبات المحسومة
              </button>
              {msg && <span className="text-sm text-navy">{msg}</span>}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
              <table className="w-full text-right text-sm">
                <thead className="bg-ivory text-ink/60">
                  <tr>
                    <th className="p-3 font-bold">التاريخ</th>
                    <th className="p-3 font-bold">العميل</th>
                    <th className="p-3 font-bold">الحالة</th>
                    <th className="p-3 font-bold">الإيصال</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-ink/50">
                        مفيش طلبات لسه.
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-navy/5 align-top">
                      <td className="p-3 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3" dir="ltr">
                        <div>{o.email}</div>
                        <div className="text-ink/60">{o.phone}</div>
                      </td>
                      <td className="p-3">{STATUS_LABEL[o.status]}</td>
                      <td className="p-3">
                        {o.hasReceipt ? (
                          <button
                            onClick={() => viewReceipt(o.id)}
                            className="font-bold text-navy underline"
                          >
                            عرض
                          </button>
                        ) : (
                          <span className="text-ink/40">اتمسح</span>
                        )}
                      </td>
                      <td className="space-x-3 space-x-reverse p-3 text-left whitespace-nowrap">
                        {o.status === 'pending' && (
                          <>
                            <button
                              onClick={() => decide(o.id, 'approved')}
                              className="font-bold text-green-600 hover:underline"
                            >
                              قبول
                            </button>
                            <button
                              onClick={() => decide(o.id, 'rejected')}
                              className="font-bold text-orange-600 hover:underline"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteOrder(o.id)}
                          className="text-red-500 hover:underline"
                        >
                          حذف الطلب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewing && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={() => setViewing(null)}
              >
                <div
                  className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {viewing.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={viewing.src} alt="الإيصال" className="mx-auto mb-3 rounded-lg" />
                  ) : (
                    <p className="p-8 text-ink/50">جاري التحميل…</p>
                  )}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => deleteReceipt(viewing.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white"
                    >
                      🗑️ امسح الإيصال
                    </button>
                    <button
                      onClick={() => setViewing(null)}
                      className="rounded-lg bg-navy px-4 py-2 font-bold text-ivory"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'coupons' && (
        <>

        {/* إنشاء كوبون */}
        <div className="mb-8 rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-navy">اعمل كوبون جديد</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-ink/60">الكود (اختياري)</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="يتولّد تلقائي"
                className="w-full rounded-lg border border-navy/20 bg-ivory px-3 py-2 outline-none focus:border-gold"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-ink/60">صالح كام مرة</span>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full rounded-lg border border-navy/20 bg-ivory px-3 py-2 outline-none focus:border-gold"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-ink/60">نسبة الخصم %</span>
              <input
                type="number"
                min={1}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full rounded-lg border border-navy/20 bg-ivory px-3 py-2 outline-none focus:border-gold"
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-ink/50">
            100% = تحميل الكتاب مجانًا على طول. أقل من 100% = خصم (بيتفعّل في
            صفحة الدفع لاحقًا).
          </p>
          <button
            onClick={create}
            className="mt-4 rounded-xl bg-gold px-6 py-3 font-bold text-navy-dark transition hover:bg-gold-light"
          >
            اعمل الكوبون
          </button>
          {msg && <p className="mt-3 text-sm text-navy">{msg}</p>}
        </div>

        {/* قائمة الكوبونات */}
        <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-ivory text-ink/60">
              <tr>
                <th className="p-3 font-bold">الكود</th>
                <th className="p-3 font-bold">الخصم</th>
                <th className="p-3 font-bold">صالح كام مرة كمان</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-ink/50">
                    مفيش كوبونات لسه.
                  </td>
                </tr>
              )}
              {coupons.map((c) => {
                const left = c.maxUses - c.usedCount;
                const active = left > 0;
                return (
                  <tr key={c.code} className="border-t border-navy/5">
                    <td className="p-3 font-mono font-bold text-navy">
                      <button
                        onClick={() => copy(c.code)}
                        title="انسخ"
                        className="hover:text-gold-dark"
                      >
                        {c.code} 📋
                      </button>
                    </td>
                    <td className="p-3">{c.discountPercent}%</td>
                    <td className="p-3">
                      {left} من {c.maxUses}
                    </td>
                    <td className="p-3">
                      {active ? (
                        <span className="text-green-600">صالح</span>
                      ) : (
                        <span className="text-ink/40">اتستخدم</span>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      <button
                        onClick={() => remove(c.code)}
                        className="text-red-500 hover:underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </main>
  );
}
