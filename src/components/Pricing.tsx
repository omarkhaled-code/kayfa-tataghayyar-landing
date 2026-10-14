import { InstaPayCheckout } from './InstaPayCheckout';
import { CouponBox } from './CouponBox';
import { book, PRICE_EGP, ORIGINAL_PRICE_EGP } from '@/lib/book-data';

const steps = [
  { n: '١', t: 'حوّل على InstaPay' },
  { n: '٢', t: 'ارفع صورة الإيصال' },
  { n: '٣', t: 'حمّل الكتاب بعد المراجعة' },
];

export function Pricing() {
  const discount = Math.round(
    ((ORIGINAL_PRICE_EGP - PRICE_EGP) / ORIGINAL_PRICE_EGP) * 100
  );

  return (
    <section id="pricing" className="scroll-mt-20 bg-ivory py-16">
      <div className="mx-auto max-w-lg px-5">
        <div className="overflow-hidden rounded-3xl border-2 border-gold bg-white shadow-xl">
          <div className="bg-gold px-6 py-3 text-center text-sm font-bold text-white">
            سعر الإطلاق — وفّر {discount}%
          </div>

          <div className="px-6 py-8 text-center md:px-10">
            <h2 className="mb-1 text-2xl font-extrabold text-navy">
              {book.title}
            </h2>
            <p className="mb-6 text-ink/60">النسخة الإلكترونية الكاملة (PDF)</p>

            <div className="mb-6 flex items-end justify-center gap-3">
              <span className="text-2xl text-ink/40 line-through">
                {ORIGINAL_PRICE_EGP} ج
              </span>
              <span className="text-5xl font-extrabold text-navy">
                {PRICE_EGP}
              </span>
              <span className="mb-1 text-xl font-bold text-navy">جنيه</span>
            </div>

            <ul className="mx-auto mb-7 max-w-xs space-y-2 text-right text-sm text-ink/80">
              {[
                'خلاصة 14 كتاب في مكان واحد',
                'المراحل الأربعة كاملة',
                'وصول مدى الحياة، حمّله مرة واقراه في أي وقت',
                'يتقرا على الموبايل والكمبيوتر والتابلت',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <InstaPayCheckout className="bg-navy text-ivory shadow-lg shadow-navy/20 hover:bg-navy-light" />

            {/* خطوات الدفع — مختصرة وواضحة قبل ما العميل يبدأ */}
            <ol className="mt-6 grid grid-cols-3 gap-2 text-xs text-ink/70">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="rounded-xl bg-ivory px-2 py-3 leading-snug"
                >
                  <span className="mx-auto mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                    {s.n}
                  </span>
                  {s.t}
                </li>
              ))}
            </ol>

            <p className="mt-4 text-xs leading-relaxed text-ink/50">
              بنراجع كل إيصال بنفسنا. لو حصلت أي مشكلة، تواصل معانا من قسم
              «مين اللي بيبيعلك» تحت وهنحلّها.
            </p>
          </div>
        </div>

        <CouponBox />
      </div>
    </section>
  );
}
