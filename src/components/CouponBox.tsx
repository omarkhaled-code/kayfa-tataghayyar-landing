'use client';

import { useState } from 'react';

// صندوق «معاك كوبون؟» — لو الكوبون 100% وصالح بينزّل الكتاب على طول.
export function CouponBox() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function redeem() {
    const c = code.trim();
    if (!c || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/coupon/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'الكوبون مش صحيح');
      }

      if (data.free && data.downloadUrl) {
        setDone(true);
        // نبدأ التحميل مباشرة
        window.location.href = data.downloadUrl;
      } else {
        setError('الكوبون ده خصم جزئي — استخدمه في صفحة الدفع.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حصل خطأ، حاول تاني.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-md px-5 text-center">
        <h3 className="mb-1 text-lg font-bold text-navy">معاك كوبون هدية؟ 🎁</h3>
        <p className="mb-4 text-sm text-ink/60">
          اكتب الكوبون وحمّل الكتاب على طول.
        </p>

        {done ? (
          <div className="rounded-xl border border-stage-self/30 bg-stage-self/5 p-4 text-stage-self">
            ✅ تمام! التحميل بدأ. لو ماشتغلش،{' '}
            <button
              onClick={redeem}
              className="font-bold underline"
              type="button"
            >
              اضغط هنا
            </button>
            .
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && redeem()}
              placeholder="اكتب كود الكوبون"
              className="flex-1 rounded-xl border border-navy/20 bg-ivory px-4 py-3 text-center outline-none focus:border-gold"
            />
            <button
              onClick={redeem}
              disabled={loading}
              className="rounded-xl bg-navy px-6 py-3 font-bold text-ivory transition hover:bg-navy-light disabled:opacity-70"
            >
              {loading ? '...' : 'فعّل الكوبون'}
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
