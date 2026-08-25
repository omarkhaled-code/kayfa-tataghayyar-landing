import { Reveal } from './Reveal';

// ==========================================================================
//  ⚠️ مهم: دي آراء *نموذجية (placeholder)* للتصميم فقط.
//     استبدلها بآراء حقيقية من قرّاء فعليين قبل ما تنشر الصفحة —
//     ممنوع تنشر آراء متألّفة. عدّل المصفوفة تحت بس.
// ==========================================================================
const testimonials = [
  {
    name: 'قارئ مبدئي',
    text: 'حطّ هنا رأي حقيقي من قارئ — إزاي الكتاب ساعده وإيه اللي طبّقه فعلاً.',
    stars: 5,
  },
  {
    name: 'قارئة مبدئية',
    text: 'رأي تاني حقيقي — يفضّل يذكر مرحلة محددة استفاد منها (عقلك/فلوسك/…).',
    stars: 5,
  },
  {
    name: 'قارئ مبدئي',
    text: 'رأي قصير وصادق بيبني ثقة. الآراء الحقيقية بترفع المبيعات أكتر من أي كلام تاني.',
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 className="mb-10 text-center text-2xl font-extrabold text-navy md:text-3xl">
            ناس قرَت الكتاب بتقول إيه
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-navy/10 bg-ivory p-6">
                <div className="mb-3 text-gold" aria-label={`${t.stars} من 5`}>
                  {'★'.repeat(t.stars)}
                  <span className="text-gold/30">{'★'.repeat(5 - t.stars)}</span>
                </div>
                <blockquote className="flex-1 leading-relaxed text-ink/80">
                  «{t.text}»
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-ivory">
                    {t.name.charAt(0)}
                  </span>
                  <span className="font-bold text-navy">{t.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
