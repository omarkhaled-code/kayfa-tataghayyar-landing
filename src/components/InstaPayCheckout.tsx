'use client';

import { useEffect, useState } from 'react';
import { trackPixel } from '@/lib/pixel';
import { PRICE_EGP } from '@/lib/book-data';

const IPA = process.env.NEXT_PUBLIC_INSTAPAY_IPA || 'omarkhaled5758@instapay';
const PAY_LINK = process.env.NEXT_PUBLIC_INSTAPAY_LINK || '';
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

// يصغّر الصورة في المتصفح (أطول ضلع 1400px، JPEG) لحد ~350KB قبل الرفع.
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let q = 0.8;
  let out = canvas.toDataURL('image/jpeg', q);
  while (out.length > 470_000 && q > 0.3) {
    q -= 0.1;
    out = canvas.toDataURL('image/jpeg', q);
  }
  return out;
}

export function InstaPayCheckout({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy]);

  function openModal() {
    setOpen(true);
    trackPixel('InitiateCheckout', {
      value: PRICE_EGP,
      currency: 'EGP',
      content_name: 'كيف تتغيّر للأفضل',
    });
  }

  async function copyIpa() {
    try {
      await navigator.clipboard.writeText(IPA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* المستخدم يقدر ينسخ يدويًا */
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    try {
      setReceipt(await compressImage(f));
    } catch {
      setReceipt(null);
      setError('مقدرناش نقرا الصورة دي، جرّب صورة تانية.');
    }
  }

  async function submit() {
    setError(null);
    if (!receipt) return setError('ارفع صورة إيصال التحويل الأول.');
    setBusy(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, receipt }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || 'حصل خطأ');
      try {
        localStorage.setItem('lastOrderId', data.id);
      } catch {
        /* ignore */
      }
      window.location.href = `/order/${data.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حصل خطأ، حاول تاني.');
      setBusy(false);
    }
  }

  const input =
    'w-full rounded-lg border border-navy/20 bg-ivory px-3 py-2.5 outline-none focus:border-gold';

  return (
    <>
      <button
        onClick={openModal}
        className={
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold transition ' +
          className
        }
      >
        ⚡ ادفع {PRICE_EGP} جنيه عبر InstaPay
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ipay-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 text-right sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="ipay-title" className="text-xl font-extrabold text-navy">
                الدفع عبر InstaPay
              </h3>
              <button
                onClick={() => setOpen(false)}
                disabled={busy}
                aria-label="إغلاق"
                className="text-2xl text-ink/40 hover:text-ink"
              >
                ×
              </button>
            </div>

            {/* الخطوة 1 */}
            <p className="mb-2 flex items-center gap-2 font-bold text-navy">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs text-white">١</span>
              حوّل {PRICE_EGP} جنيه على العنوان ده
            </p>
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-gold bg-ivory p-3">
              <span
                dir="ltr"
                className="flex-1 break-all text-left font-mono text-sm font-bold text-navy"
              >
                {IPA}
              </span>
              <button
                onClick={copyIpa}
                className="rounded-lg bg-navy px-3 py-1.5 text-sm font-bold text-ivory"
              >
                {copied ? 'اتنسخ ✓' : 'نسخ'}
              </button>
            </div>
            {PAY_LINK && (
              <a
                href={PAY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-block text-sm font-bold text-navy underline"
              >
                أو افتح رابط التحويل المباشر ↗
              </a>
            )}

            {/* الخطوة 2 */}
            <p className="mb-2 mt-5 flex items-center gap-2 font-bold text-navy">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs text-white">٢</span>
              صوّر شاشة التحويل وارفعها
            </p>
            <label className="mb-4 block cursor-pointer rounded-xl border-2 border-dashed border-navy/30 p-4 text-center text-sm text-ink/70 hover:border-gold">
              {receipt ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt}
                    alt="الإيصال"
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <span className="mt-2 block font-bold text-green-700">
                    ✓ تم اختيار الإيصال (اضغط للتغيير)
                  </span>
                </>
              ) : (
                <span className="block py-3">
                  <span className="mb-1 block text-3xl">📸</span>
                  اضغط لاختيار صورة الإيصال
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
              />
            </label>

            {/* الخطوة 3 */}
            <p className="mb-2 flex items-center gap-2 font-bold text-navy">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs text-white">٣</span>
              بياناتك
            </p>
            <div className="mb-4 space-y-3">
              <input
                type="email"
                dir="ltr"
                autoComplete="email"
                aria-label="الإيميل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="الإيميل"
                className={input}
              />
              <input
                type="tel"
                dir="ltr"
                autoComplete="tel"
                inputMode="tel"
                aria-label="رقم الموبايل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الموبايل"
                className={input}
              />
            </div>

            <button
              onClick={submit}
              disabled={busy}
              className="w-full rounded-xl bg-gold px-6 py-4 text-lg font-bold text-navy-dark transition hover:bg-gold-light disabled:opacity-60"
            >
              {busy ? 'جاري الإرسال…' : 'إرسال الإيصال'}
            </button>
            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700"
              >
                {error}
              </p>
            )}
            <p className="mt-3 text-center text-xs text-ink/50">
              بنراجع الإيصال ونفتحلك التحميل في أقرب وقت.
            </p>
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-sm text-navy underline"
              >
                مشكلة في الرفع؟ ابعت الإيصال على واتساب
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
