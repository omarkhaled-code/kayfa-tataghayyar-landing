import { book } from '@/lib/book-data';

// قسم "مين اللي بيبيعلك" — بيبني الثقة بعد السعر ويدّي العميل طريق للتواصل.
// كل البيانات من .env.local، واللي مش متحط بيتخفي لوحده.
const BIO = process.env.NEXT_PUBLIC_AUTHOR_BIO || '';
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL || '';
const FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL || '';
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

const contacts = [
  WHATSAPP && {
    label: 'واتساب',
    icon: '💬',
    href: `https://wa.me/${WHATSAPP}`,
    primary: true,
  },
  PHONE && { label: 'اتصال', icon: '📞', href: `tel:${PHONE}` },
  EMAIL && { label: 'إيميل', icon: '✉️', href: `mailto:${EMAIL}` },
  INSTAGRAM && { label: 'إنستجرام', icon: '📸', href: INSTAGRAM },
  FACEBOOK && { label: 'فيسبوك', icon: '👍', href: FACEBOOK },
].filter(Boolean) as {
  label: string;
  icon: string;
  href: string;
  primary?: boolean;
}[];

export function AboutAuthor() {
  return (
    <section id="about" className="scroll-mt-20 bg-white py-16">
      <div className="mx-auto max-w-2xl px-5 text-center">
        {/* أفاتار بالحرف الأول لحد ما تتحط صورتك */}
        <div
          aria-hidden
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-navy text-3xl font-extrabold text-gold-light ring-4 ring-gold/30"
        >
          {book.author.charAt(0)}
        </div>
        <h2 className="mb-1 text-2xl font-extrabold text-navy md:text-3xl">
          مين اللي بيبيعلك؟
        </h2>
        <p className="mb-5 text-lg font-bold text-gold-dark">
          أنا {book.author}، مؤلف الكتاب
        </p>

        {BIO && <p className="mb-6 leading-loose text-ink/80">{BIO}</p>}

        <div className="mb-6 rounded-2xl border border-gold/30 bg-ivory p-5 text-right">
          <p className="font-bold text-navy">🤝 وعدي ليك</p>
          <p className="mt-1 text-sm leading-loose text-ink/75">
            بنفسي براجع كل عملية دفع. ولو حصلت أي مشكلة، في الدفع أو التحميل،
            كلمني مباشرة وهرد عليك وأحلّها معاك.
          </p>
        </div>

        {contacts.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {contacts.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={
                    'rounded-xl px-5 py-2.5 font-bold transition ' +
                    (c.primary
                      ? 'bg-navy text-ivory hover:bg-navy-light'
                      : 'border-2 border-navy text-navy hover:bg-navy hover:text-ivory')
                  }
                >
                  {c.icon} {c.label}
                </a>
              ))}
            </div>
            {(PHONE || EMAIL) && (
              <p dir="ltr" className="mt-4 text-sm text-ink/60">
                {PHONE && <span>{PHONE.replace('+20', '(+20) ')}</span>}
                {PHONE && EMAIL && <span> · </span>}
                {EMAIL && <span>{EMAIL}</span>}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
