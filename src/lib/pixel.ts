// ==========================================================================
//  مساعدات Meta Pixel — أحداث التتبع (client-side).
//  الـ Pixel نفسه بيتحمّل من مكوّن <MetaPixel />.
// ==========================================================================

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** تتبّع حدث قياسي في Meta Pixel (زي ViewContent, InitiateCheckout, Purchase). */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
}

/** حدث مخصّص (لو حبيت تتبّع حاجة مش قياسية زي فتح الفصل المجاني). */
export function trackPixelCustom(
  event: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params);
  }
}
