import { book } from '@/lib/book-data';

export function Stages() {
  return (
    <section id="stages" className="scroll-mt-20 bg-white py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-extrabold text-navy md:text-3xl">
            رحلتك في 4 مراحل
          </h2>
          <p className="text-ink/70">
            من العقل للفلوس — كل مرحلة بتبني على اللي قبلها.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {book.stages.map((stage, i) => (
            <div
              key={stage.key}
              className="group relative overflow-hidden rounded-2xl border border-navy/10 bg-ivory p-6 pt-7 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* شريط لون المرحلة أعلى الكرت — زي شرائط الغلاف */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ backgroundColor: stage.color }}
              />
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white transition group-hover:scale-105"
                style={{ backgroundColor: stage.color }}
              >
                <span>{stage.icon}</span>
              </div>
              <span
                className="mb-1 block text-sm font-bold"
                style={{ color: stage.color }}
              >
                المرحلة {i + 1}
              </span>
              <h3 className="mb-2 text-xl font-bold text-navy">
                {stage.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink/70">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
