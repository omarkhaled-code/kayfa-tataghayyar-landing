import { book } from '@/lib/book-data';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

const links = [
  { href: '#stages', label: 'المراحل' },
  { href: '#free-chapter', label: 'فصل مجاني' },
  { href: '#pricing', label: 'السعر' },
  { href: '#about', label: 'تواصل معي' },
  { href: '#faq', label: 'الأسئلة' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-dark py-12 text-center text-ivory/70">
      <div className="mx-auto max-w-4xl px-5">
        <p className="mb-1 font-display text-xl font-extrabold text-ivory">
          {book.title}
        </p>
        <p className="mb-6 text-sm">تأليف: {book.author}</p>

        <nav
          aria-label="روابط سريعة"
          className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition hover:text-gold-light"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {(WHATSAPP || EMAIL) && (
          <p className="mb-6 text-sm">
            محتاج مساعدة؟{' '}
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gold-light underline"
              >
                واتساب
              </a>
            )}
            {WHATSAPP && EMAIL && ' · '}
            {EMAIL && (
              <a
                href={`mailto:${EMAIL}`}
                className="font-bold text-gold-light underline"
              >
                {EMAIL}
              </a>
            )}
          </p>
        )}

        <p className="text-xs text-ivory/50">
          © {year} — جميع الحقوق محفوظة. الدفع عبر InstaPay.
        </p>
      </div>
    </footer>
  );
}
