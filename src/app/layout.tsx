import type { Metadata, Viewport } from 'next';
import { Tajawal, Almarai } from 'next/font/google';
import './globals.css';
import { MetaPixel } from '@/components/MetaPixel';
import { book } from '@/lib/book-data';

// نفس خطوط الكتاب: Tajawal للعناوين + Almarai للمتن.
// يُحمّلان عبر next/font (استضافة ذاتية = أسرع، بدون طلبات خارجية).
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: `${book.title} — ${book.author}`,
  description: book.tagline + '. ' + book.summary,
  openGraph: {
    title: `${book.title} — ${book.author}`,
    description: book.tagline,
    type: 'website',
    locale: 'ar_EG',
    images: [{ url: '/book-cover.png', width: 1692, height: 2512 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A5F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${almarai.variable}`}
    >
      <body className="font-sans">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
