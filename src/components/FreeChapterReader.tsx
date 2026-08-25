'use client';

import { useEffect, useRef, useState } from 'react';
import { freeChapter, type ChapterBlock } from '@/lib/chapter';
import { trackPixel, trackPixelCustom } from '@/lib/pixel';

function Block({ block }: { block: ChapterBlock }) {
  switch (block.type) {
    case 'h':
      return (
        <h3 className="mb-3 mt-8 text-xl font-bold text-navy md:text-2xl">
          {block.text}
        </h3>
      );
    case 'quote':
      return (
        <blockquote className="my-6 border-r-4 border-gold bg-gold/10 px-5 py-4 text-lg font-bold leading-relaxed text-navy">
          {block.text}
        </blockquote>
      );
    case 'list':
      return (
        <ul className="my-4 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 shrink-0 text-gold">◆</span>
              <span className="leading-loose text-ink/85">{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <p className="text-ink/85">{block.text}</p>;
  }
}

export function FreeChapterReader() {
  const sectionRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  // تتبّع فتح/رؤية الفصل المجاني مرة واحدة
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !seen) {
          setSeen(true);
          trackPixel('ViewContent', {
            content_name: 'الفصل المجاني',
            content_type: 'free_chapter',
          });
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [seen]);

  function goToPricing() {
    trackPixelCustom('ClickContinueBook', { source: 'free_chapter_end' });
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      id="free-chapter"
      ref={sectionRef}
      className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16"
    >
      <div className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
        {/* ترويسة الفصل */}
        <div className="border-b border-navy/10 bg-ivory px-6 py-6 text-center md:px-10">
          <span className="mb-2 inline-block rounded-full bg-navy/5 px-3 py-1 text-sm font-bold text-gold-dark">
            {freeChapter.stageLabel}
          </span>
          <h2 className="text-2xl font-extrabold text-navy md:text-3xl">
            {freeChapter.number}: {freeChapter.title}
          </h2>
          <p className="mt-2 text-sm text-ink/50">
            ⏱ قراءة ~{freeChapter.readingMinutes} دقائق · فصل مجاني كامل
          </p>
        </div>

        {/* نص الفصل */}
        <div className="chapter-prose px-6 py-8 text-[17px] md:px-10 md:py-10">
          {freeChapter.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {/* CTA نهاية الفصل */}
        <div className="border-t border-navy/10 bg-navy px-6 py-10 text-center text-ivory md:px-10">
          <h3 className="mb-2 text-xl font-bold md:text-2xl">
            عجبك الفصل؟ ده كان البداية بس 🔥
          </h3>
          <p className="mx-auto mb-6 max-w-md text-ivory/75">
            باقي الكتاب فيه خلاصة الـ14 كتاب على المراحل الأربعة كاملة —
            جاهزة للتطبيق من النهارده.
          </p>
          <button
            onClick={goToPricing}
            className="rounded-xl bg-gold px-8 py-4 text-lg font-bold text-navy-dark transition hover:bg-gold-light"
          >
            كمّل باقي الكتاب ←
          </button>
        </div>
      </div>
    </section>
  );
}
