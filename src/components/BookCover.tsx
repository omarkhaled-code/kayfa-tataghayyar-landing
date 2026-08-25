import Image from 'next/image';
import { book } from '@/lib/book-data';

// الغلاف الحقيقي للكتاب (مستخرج من ملف الكتاب PDF) — public/book-cover.png
// نعرضه داخل حاوية بنسبة أقصر بشوية مع object-top، فيتقصّ أي هامش عند الأسفل.
export function BookCover({ className = '' }: { className?: string }) {
  return (
    <div className={'relative ' + className}>
      {/* توهج ذهبي خفيف خلف الكتاب */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 scale-95 rounded-2xl bg-gold/25 blur-2xl"
      />
      <div className="relative aspect-[1692/2470] w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
        <Image
          src="/book-cover.png"
          alt={`غلاف كتاب ${book.title} للمؤلف ${book.author}`}
          fill
          priority
          sizes="(max-width: 768px) 60vw, 320px"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
