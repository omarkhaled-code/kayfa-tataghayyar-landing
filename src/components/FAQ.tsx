'use client';

import { useState } from 'react';
import { book } from '@/lib/book-data';

const faqs = [
  {
    q: 'هيوصلني إزاي بعد ما أدفع؟',
    a: book.delivery,
  },
  {
    q: 'ينفع أقراه على الموبايل؟',
    a: 'أكيد. الكتاب ملف PDF بيتفتح على أي موبايل أو تابلت أو كمبيوتر، وتقدر تقراه في أي وقت من غير إنترنت.',
  },
  {
    q: 'إيه طرق الدفع المتاحة؟',
    a: 'تقدر تدفع بالكارت البنكي (فيزا/ماستركارد) أو بمحفظة الموبايل، كله بأمان عن طريق بوابة Kashier.',
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-navy/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-right"
        aria-expanded={open}
      >
        <span className="font-bold text-navy">{q}</span>
        <span
          className={
            'shrink-0 text-2xl text-gold transition-transform ' +
            (open ? 'rotate-45' : '')
          }
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 leading-loose text-ink/75 animate-fade-up">{a}</p>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-2xl scroll-mt-20 px-5 py-16">
      <h2 className="mb-8 text-center text-2xl font-extrabold text-navy md:text-3xl">
        أسئلة شائعة
      </h2>
      <div>
        {faqs.map((f) => (
          <Item key={f.q} {...f} />
        ))}
      </div>
    </section>
  );
}
