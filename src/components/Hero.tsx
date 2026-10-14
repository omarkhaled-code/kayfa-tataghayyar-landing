'use client';

import { BookCover } from './BookCover';
import { book, PRICE_EGP, ORIGINAL_PRICE_EGP } from '@/lib/book-data';
import { trackPixelCustom } from '@/lib/pixel';

const trust = [
  { icon: '⚡', text: 'دفع سهل عبر InstaPay' },
  { icon: '📱', text: 'PDF على أي جهاز' },
  { icon: '💬', text: 'دعم مباشر من المؤلف' },
];

export function Hero() {
  function scrollToChapter() {
    trackPixelCustom('OpenFreeChapter', { source: 'hero' });
    document
      .getElementById('free-chapter')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-navy-dark via-navy to-navy-light text-ivory">
      {/* توهج ذهبي خفيف من أعلى المنتصف — زي الغلاف */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-navy-light/40 blur-3xl"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 pb-12 pt-8 md:flex-row md:justify-between md:gap-12 md:py-20">
        {/* النص — على الموبايل بيظهر الأول عشان العنوان والزرار يبانوا من غير سكرول */}
        <div className="w-full text-center md:w-1/2 md:text-right">
          <span className="mb-4 inline-block rounded-full border border-gold/60 px-4 py-1 text-sm font-bold tracking-wide text-gold-light animate-fade-up">
            ١٤ كتابًا · ٤ مراحل
          </span>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl animate-fade-up">
            مش فاضي تقرا 14 كتاب؟
            <br />
            <span className="text-gold-light">خلاصتهم كلهم في كتاب واحد</span>
          </h1>

          <p className="mx-auto mb-6 max-w-xl text-base leading-loose text-ivory/80 md:mx-0 md:text-lg animate-fade-up">
            «{book.title}» — رحلة عملية في 4 مراحل تاخدك من فهم عقلك، لنفسك
            والناس، لمشاعرك، لحد إدارة فلوسك. بأسلوب بسيط وقابل للتطبيق.
          </p>

          <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
            <span className="text-4xl font-extrabold text-gold-light">
              {PRICE_EGP} <span className="text-xl">جنيه</span>
            </span>
            <span className="text-lg text-ivory/50 line-through">
              {ORIGINAL_PRICE_EGP} ج
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a
              href="#pricing"
              className="w-full rounded-xl bg-gold-light px-8 py-4 text-center text-lg font-bold text-navy-dark shadow-lg shadow-black/20 transition hover:bg-gold-light/90 sm:w-auto"
            >
              اشترِ الكتاب الآن
            </a>
            <button
              onClick={scrollToChapter}
              className="w-full rounded-xl border border-ivory/30 px-8 py-4 text-lg font-bold text-ivory transition hover:bg-ivory/10 sm:w-auto"
            >
              📖 اقرأ فصل مجاني
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ivory/70 md:justify-start">
            {trust.map((t) => (
              <li key={t.text} className="flex items-center gap-1.5">
                <span aria-hidden>{t.icon}</span>
                {t.text}
              </li>
            ))}
          </ul>
        </div>

        {/* الغلاف */}
        <div className="w-44 shrink-0 sm:w-56 md:w-80">
          <BookCover className="animate-fade-up" />
        </div>
      </div>
    </header>
  );
}
