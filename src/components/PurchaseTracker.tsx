'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/lib/pixel';

// يطلق حدث Purchase في Meta Pixel مرة واحدة عند فتح صفحة النجاح.
// لو اتبعت onceKey بنمنع تكرار الحدث لنفس الطلب لو العميل فتح الصفحة تاني.
export function PurchaseTracker({
  value,
  onceKey,
}: {
  value: number;
  onceKey?: string;
}) {
  useEffect(() => {
    if (onceKey) {
      try {
        const k = `purchase_tracked_${onceKey}`;
        if (localStorage.getItem(k)) return;
        localStorage.setItem(k, '1');
      } catch {
        /* لو التخزين مش متاح نكمّل ونبعت الحدث */
      }
    }
    trackPixel('Purchase', {
      value,
      currency: 'EGP',
      content_name: 'كيف تتغيّر للأفضل',
    });
  }, [value, onceKey]);

  return null;
}
