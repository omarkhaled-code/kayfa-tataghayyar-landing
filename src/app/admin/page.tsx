'use client';

import { useState } from 'react';

type Coupon = {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  createdAt: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

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
          <h1 className="mb-1 text-2xl font-extrabold text-navy">لوحة الكوبونات</h1>
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
        <h1 className="mb-6 text-2xl font-extrabold text-navy">
          لوحة الكوبونات
        </h1>

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
      </div>
    </main>
  );
}
