'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PurchaseTracker } from '@/components/PurchaseTracker';
import { PRICE_EGP, book } from '@/lib/book-data';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

type State = {
  status: 'pending' | 'approved' | 'rejected';
  downloadUrl?: string;
};

// خطوات الرحلة: 0=تحويل، 1=رفع الإيصال، 2=مراجعة، 3=تحميل
function Stepper({ current, failed }: { current: number; failed: boolean }) {
  const steps = ['تحويل', 'رفع الإيصال', 'مراجعة', 'تحميل'];
  return (
    <ol className="mb-8 flex items-start justify-between" aria-label="مراحل الطلب">
      {steps.map((t, i) => {
        const done = i < current || (i === current && current === 3);
        const active = i === current && !done;
        const bad = failed && active;
        return (
          <li key={t} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ' +
                (bad
                  ? 'bg-red-100 text-red-600'
                  : done
                    ? 'bg-green-600 text-white'
                    : active
                      ? 'bg-gold text-white ring-4 ring-gold/25'
                      : 'bg-navy/10 text-navy/40')
              }
            >
              {bad ? '!' : done ? '✓' : i + 1}
            </span>
            <span
              className={
                'text-xs ' + (active || done ? 'font-bold text-navy' : 'text-ink/40')
              }
            >
              {t}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const [state, setState] = useState<State | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${params.id}`, {
          cache: 'no-store',
        });
        if (res.status === 404) return !stop && setNotFound(true);
        const data = (await res.json()) as State;
        if (!stop) setState(data);
      } catch {
        /* نحاول تاني في الدورة الجاية */
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [params.id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  let icon = '⏳';
  let title = 'جاري التحميل…';
  let text = '';
  let current = 2;
  if (notFound) {
    icon = '❓';
    title = 'الطلب غير موجود';
    text = 'تأكد من الرابط اللي معاك.';
  } else if (state?.status === 'pending') {
    title = 'إيصالك قيد المراجعة';
    text =
      'استلمنا الإيصال وبنراجعه. الصفحة دي بتتحدّث لوحدها، وأول ما نقبله هيظهرلك زرار التحميل. احتفظ برابط الصفحة دي.';
  } else if (state?.status === 'approved') {
    icon = '✅';
    title = 'تم قبول الدفع!';
    text = `مبروك 🎉 دلوقتي تقدر تحمّل «${book.title}».`;
    current = 3;
  } else if (state?.status === 'rejected') {
    icon = '⚠️';
    title = 'مقدرناش نتأكد من التحويل';
    text =
      'الإيصال مش واضح أو المبلغ ماوصلش. لو دفعت فعلًا ابعت الإيصال تاني من الصفحة الرئيسية، أو كلمنا وهنحلّها.';
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-navy/10 bg-white p-7 text-center shadow-xl">
        {state?.status === 'approved' && (
          <PurchaseTracker value={PRICE_EGP} onceKey={params.id} />
        )}

        {!notFound && (
          <Stepper current={current} failed={state?.status === 'rejected'} />
        )}

        <div
          aria-hidden
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold/20 text-4xl"
        >
          {icon}
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-navy">{title}</h1>
        <p className="mb-6 leading-loose text-ink/75" aria-live="polite">
          {text}
        </p>

        {state?.status === 'approved' && state.downloadUrl && (
          <a
            href={state.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-block w-full rounded-xl bg-gold px-6 py-4 text-lg font-bold text-navy-dark transition hover:bg-gold-light"
          >
            ⬇️ حمّل الكتاب الآن
          </a>
        )}
        {state?.status === 'rejected' && (
          <Link
            href="/#pricing"
            className="mb-4 inline-block w-full rounded-xl bg-navy px-6 py-4 text-lg font-bold text-ivory"
          >
            ارجع للدفع
          </Link>
        )}

        {state?.status === 'pending' && (
          <button
            onClick={copyLink}
            className="mb-4 w-full rounded-xl border-2 border-navy px-6 py-3 font-bold text-navy transition hover:bg-navy hover:text-ivory"
          >
            {copied ? 'اتنسخ ✓' : '🔗 انسخ رابط الطلب'}
          </button>
        )}

        {WHATSAPP && state && state.status !== 'approved' && (
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 block text-sm font-bold text-navy underline"
          >
            💬 محتاج مساعدة؟ كلمني على واتساب
          </a>
        )}

        <Link
          href="/"
          className="block text-sm text-ink/50 underline transition hover:text-navy"
        >
          الرجوع للصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}
