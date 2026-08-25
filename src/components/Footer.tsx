import { book } from '@/lib/book-data';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-dark py-10 text-center text-ivory/70">
      <div className="mx-auto max-w-4xl px-5">
        <p className="mb-2 text-lg font-bold text-ivory">{book.title}</p>
        <p className="mb-4 text-sm">تأليف: {book.author}</p>
        <p className="text-xs text-ivory/50">
          © {year} — جميع الحقوق محفوظة. الدفع آمن عبر Kashier.
        </p>
      </div>
    </footer>
  );
}
