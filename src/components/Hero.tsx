'use client';

import { BookCover } from './BookCover';
import { book } from '@/lib/book-data';
import { trackPixelCustom } from '@/lib/pixel';

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

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-5 py-14 md:flex-row md:justify-between md:py-20">
        {/* النص */}
        <div className="w-full text-center md:w-1/2 md:text-right">
          <span className="mb-5 inline-block rounded-full border border-gold/60 px-5 py-1.5 text-sm font-bold tracking-wide text-gold-light animate-fade-up">
            ١٤ كتابًا · ٤ مراحل
          </span>

          <h1 className="mb-5 text-3xl font-extrabold leading-tight md:text-5xl animate-fade-up">
            مش فاضي تقرا 14 كتاب؟
            <br />
            <span className="text-gold">خلاصتهم كلهم في كتاب واحد</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-ivory/80 md:mx-0 animate-fade-up">
            «{book.title}» — رحلة عملية في 4 مراحل تاخدك من فهم عقلك، لنفسك
            والناس، لمشاعرك، لحد إدارة فلوسك. بأسلوب بسيط وقابل للتطبيق.
          </p>

          <div className="flex flex-col items-center gap-3 md:flex-row md:items-stretch md:justify-start">
            <button
              onClick={scrollToChapter}
              className="w-full rounded-xl bg-gold px-8 py-4 text-lg font-bold text-navy-dark transition hover:bg-gold-light md:w-auto"
            >
              📖 اقرأ فصل مجاني
            </button>
            <a
              href="#pricing"
              className="w-full rounded-xl border border-ivory/30 px-8 py-4 text-center text-lg font-bold text-ivory transition hover:bg-ivory/10 md:w-auto"
            >
              اشترِ الكتاب
            </a>
          </div>
        </div>

        {/* الغلاف */}
        <div className="w-56 shrink-0 sm:w-64 md:w-80">
          <BookCover className="animate-fade-up" />
        </div>
      </div>
    </header>
  );
}
