import Link from 'next/link';
import { PurchaseTracker } from '@/components/PurchaseTracker';
import { PRICE_EGP, book } from '@/lib/book-data';
import { signDownloadToken } from '@/lib/token';

export const metadata = {
  title: 'تم الدفع — ' + book.title,
  robots: { index: false, follow: false },
};

// صفحة بعد رجوع المستخدم من Kashier.
// Kashier بيضيف ?paymentStatus=SUCCESS/FAILED للرابط. ملاحظة: قيمة
// paymentStatus من الـ query غير موثّقة تشفيريًا — التأكيد الآمن يتم عبر
// الـ webhook. للسكافولد ده كافٍ، وللتشديد راجع README (اربط عرض الرابط
// بتأكيد الـ webhook + قاعدة بيانات).
export default function SuccessPage({
  searchParams,
}: {
  searchParams: { paymentStatus?: string };
}) {
  const paid = searchParams.paymentStatus === 'SUCCESS';
  const base = process.env.BOOK_DOWNLOAD_URL || '/api/download';
  // لو التحميل داخلي (endpoint بتاعنا) نرفق توكن موقّع؛ لو رابط خارجي نسيبه زي ما هو.
  const downloadUrl =
    paid && base.startsWith('/api/download')
      ? `${base}?token=${signDownloadToken()}`
      : base;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-navy/10 bg-white p-8 text-center shadow-xl">
        {paid ? (
          <>
            <PurchaseTracker value={PRICE_EGP} />
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              ✅
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-navy">
              تم الدفع بنجاح!
            </h1>
            <p className="mb-6 leading-loose text-ink/75">
              مبروك 🎉 دلوقتي تقدر تحمّل «{book.title}» وتبدأ رحلتك. أرسلنا لك
              الرابط كمان على إيميلك.
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block w-full rounded-xl bg-gold px-6 py-4 text-lg font-bold text-navy-dark transition hover:bg-gold-light"
            >
              ⬇️ حمّل الكتاب الآن
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
              ⚠️
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-navy">
              لم تكتمل عملية الدفع
            </h1>
            <p className="mb-6 leading-loose text-ink/75">
              معلش، الدفع ماتمّش. ماتقلقش، مفيش أي مبلغ اتخصم. جرّب تاني.
            </p>
            <Link
              href="/#pricing"
              className="mb-4 inline-block w-full rounded-xl bg-navy px-6 py-4 text-lg font-bold text-ivory transition hover:bg-navy-light"
            >
              حاول الدفع تاني
            </Link>
          </>
        )}

        <Link
          href="/"
          className="text-sm text-ink/50 underline transition hover:text-navy"
        >
          الرجوع للصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}
