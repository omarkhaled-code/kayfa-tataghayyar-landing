'use client';

import { useEffect, useState } from 'react';
import { PRICE_EGP, ORIGINAL_PRICE_EGP } from '@/lib/book-data';

// شريط CTA ثابت أسفل الشاشة على الموبايل، يفضل ظاهر أثناء السكرول.
// بيختفي لما قسم الأسعار نفسه يبقى ظاهر (عشان مايكرّرش نفسه).
export function StickyCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const pricing = document.getElementById('pricing');
    if (!pricing) return;
    const obs = new IntersectionObserver(
      (entries) => setHidden(entries[0].isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(pricing);
    return () => obs.disconnect();
  }, []);

  function goToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div
      className={
        'fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-navy/95 backdrop-blur transition-transform duration-300 md:hidden ' +
        (hidden ? 'translate-y-full' : 'translate-y-0')
      }
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-ivory">
          <span className="text-sm text-ivory/50 line-through">
            {ORIGINAL_PRICE_EGP} ج
          </span>{' '}
          <span className="text-xl font-extrabold text-gold">
            {PRICE_EGP} جنيه
          </span>
        </div>
        <button
          onClick={goToPricing}
          className="rounded-xl bg-gold px-6 py-3 font-bold text-navy-dark transition hover:bg-gold-light"
        >
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}
