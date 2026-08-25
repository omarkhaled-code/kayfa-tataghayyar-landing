import { BuyButton } from './BuyButton';
import { book, PRICE_EGP, ORIGINAL_PRICE_EGP } from '@/lib/book-data';

export function Pricing() {
  const discount = Math.round(
    ((ORIGINAL_PRICE_EGP - PRICE_EGP) / ORIGINAL_PRICE_EGP) * 100
  );

  return (
    <section id="pricing" className="scroll-mt-20 bg-ivory py-16">
      <div className="mx-auto max-w-lg px-5">
        <div className="overflow-hidden rounded-3xl border-2 border-gold bg-white shadow-xl">
          {/* شريط عاجل */}
          <div className="bg-gold px-6 py-3 text-center text-sm font-bold text-navy-dark">
            ⚡ عرض محدود — خصم {discount}% لفترة قصيرة
          </div>

          <div className="px-6 py-8 text-center md:px-10">
            <h2 className="mb-2 text-2xl font-extrabold text-navy">
              {book.title}
            </h2>
            <p className="mb-6 text-ink/60">النسخة الإلكترونية الكاملة (PDF)</p>

            {/* السعر */}
            <div className="mb-6 flex items-end justify-center gap-3">
              <span className="text-2xl text-ink/40 line-through">
                {ORIGINAL_PRICE_EGP} ج
              </span>
              <span className="text-5xl font-extrabold text-navy">
                {PRICE_EGP}
              </span>
              <span className="mb-1 text-xl font-bold text-navy">جنيه</span>
            </div>

            {/* المميزات */}
            <ul className="mx-auto mb-8 max-w-xs space-y-2 text-right text-sm text-ink/80">
              {[
                'خلاصة 14 كتاب في مكان واحد',
                'المراحل الأربعة كاملة',
                'وصول فوري بعد الدفع',
                'يتقرا على الموبايل والكمبيوتر',
                'دفع آمن عبر Kashier',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* أزرار الشراء */}
            <div className="space-y-3">
              <BuyButton
                method="card"
                className="bg-navy text-ivory hover:bg-navy-light"
              >
                💳 ادفع بالكارت — {PRICE_EGP} ج
              </BuyButton>
              <BuyButton
                method="wallet"
                className="border-2 border-navy bg-white text-navy hover:bg-navy/5"
              >
                📱 ادفع بمحفظة الموبايل
              </BuyButton>
            </div>

            <p className="mt-4 text-xs text-ink/50">
              🔒 دفع آمن عبر Kashier — بياناتك محميّة بالكامل.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
