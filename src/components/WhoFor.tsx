import { Reveal } from './Reveal';

const forYou = [
  'عايز تطوّر نفسك بس مش لاقي وقت تقرا عشرات الكتب',
  'بتبدأ كتب كتير وماتخلّصهاش',
  'عايز خلاصة عملية تقدر تطبّقها من بكرة',
  'مهتم تفهم نفسك، الناس، ومشاعرك، وتظبط فلوسك',
];

const notForYou = [
  'بتدوّر على حلول سحرية من غير مجهود',
  'مش مستعد تطبّق أي حاجة بتقراها',
];

export function WhoFor() {
  return (
    <section className="bg-ivory py-16">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal>
          <h2 className="mb-10 text-center text-2xl font-extrabold text-navy md:text-3xl">
            الكتاب ده ليك لو…
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-stage-self/30 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stage-self">
                <span>✅</span> مناسب ليك
              </h3>
              <ul className="space-y-3">
                {forYou.map((t) => (
                  <li key={t} className="flex gap-3 text-ink/80">
                    <span className="mt-1 shrink-0 text-stage-self">✓</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-navy/10 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink/60">
                <span>🚫</span> مش ليك لو
              </h3>
              <ul className="space-y-3">
                {notForYou.map((t) => (
                  <li key={t} className="flex gap-3 text-ink/70">
                    <span className="mt-1 shrink-0 text-ink/40">✕</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
