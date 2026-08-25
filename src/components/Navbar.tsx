'use client';

import { useEffect, useState } from 'react';
import { book } from '@/lib/book-data';

const links = [
  { href: '#stages', label: 'المراحل' },
  { href: '#free-chapter', label: 'فصل مجاني' },
  { href: '#pricing', label: 'السعر' },
  { href: '#faq', label: 'الأسئلة' },
];

// Navbar ثابت (sticky) يفضل ظاهر أثناء السكرول، وبتظهر فيه اللينكات.
// على الموبايل اللينكات بتتفتح من زر القائمة (☰).
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ظل أوضح للـ navbar بعد ما ننزل شوية
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={
        'sticky top-0 z-50 border-b bg-navy/95 backdrop-blur transition-shadow ' +
        (scrolled
          ? 'border-white/10 shadow-lg shadow-navy-dark/30'
          : 'border-transparent')
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        {/* الشعار / اسم الكتاب */}
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="font-display text-base font-extrabold text-ivory md:text-lg"
        >
          كيف تتغيّر <span className="text-gold-light">للأفضل</span>
        </a>

        {/* لينكات الديسكتوب */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-ivory/75 transition hover:text-gold-light"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* زر شراء + زر القائمة على الموبايل */}
        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-gold px-3 py-2 text-sm font-bold text-navy-dark transition hover:bg-gold-light sm:px-4"
          >
            اشترِ الآن
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory transition hover:bg-white/10 md:hidden"
          >
            <span className="text-xl">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* قائمة الموبايل المنسدلة */}
      {open && (
        <div className="border-t border-white/10 bg-navy px-5 py-3 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-ivory/80 transition hover:text-gold-light"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-lg bg-gold py-3 text-center font-bold text-navy-dark"
            >
              اشترِ الآن
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
