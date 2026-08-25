'use client';

import { useEffect } from 'react';
import { trackPixel } from '@/lib/pixel';

// يطلق حدث Purchase في Meta Pixel مرة واحدة عند فتح صفحة النجاح.
export function PurchaseTracker({ value }: { value: number }) {
  useEffect(() => {
    trackPixel('Purchase', {
      value,
      currency: 'EGP',
      content_name: 'كيف تتغيّر للأفضل',
    });
  }, [value]);

  return null;
}
