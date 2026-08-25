'use client';

import { useState } from 'react';
import { trackPixel } from '@/lib/pixel';
import { PRICE_EGP } from '@/lib/book-data';

type Method = 'card' | 'wallet';

interface BuyButtonProps {
  method?: Method;
  className?: string;
  children: React.ReactNode;
}

// يبدأ عملية دفع Kashier: يطلب من الـ API رابط صفحة الدفع، ثم يحوّل المستخدم.
export function BuyButton({
  method = 'card',
  className = '',
  children,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    // تتبّع بدء الدفع في Meta Pixel
    trackPixel('InitiateCheckout', {
      value: PRICE_EGP,
      currency: 'EGP',
      content_name: 'كيف تتغيّر للأفضل',
    });

    try {
      const res = await fetch('/api/kashier/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'تعذّر بدء عملية الدفع');
      }

      // تحويل المستخدم لصفحة الدفع (iframe الكارت أو رابط المحفظة)
      window.location.href = data.url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'حصل خطأ، حاول تاني بعد شوية.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold transition disabled:opacity-70 ' +
          className
        }
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            جاري التحويل للدفع…
          </>
        ) : (
          children
        )}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
