'use client';

import { useEffect, useRef, useState } from 'react';

// يظهر المحتوى بنعومة أول ما يدخل الشاشة أثناء السكرول.
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={
        'transition-all duration-700 ease-out ' +
        (shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0') +
        ' ' +
        className
      }
    >
      {children}
    </div>
  );
}
