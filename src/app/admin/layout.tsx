import type { Metadata } from 'next';

// صفحة الأدمن مش المفروض تتفهرس في محركات البحث.
export const metadata: Metadata = {
  title: 'لوحة الأدمن',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
