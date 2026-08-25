import { Reveal } from './Reveal';

export function ProblemSolution() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center">
      <Reveal>
        <h2 className="mb-6 text-2xl font-extrabold text-navy md:text-3xl">
          المشكلة مش إنك مش عايز تتغيّر…
        </h2>
        <p className="mb-4 text-lg leading-loose text-ink/80">
          المشكلة إن المعرفة اللي محتاجها متبعثرة في عشرات الكتب، وكل كتاب
          بياخد منك أسابيع. وفي الآخر بتنسى أغلبه، وبترجع لنفس النقطة اللي
          بدأت منها.
        </p>
        <p className="text-lg leading-loose text-ink/80">
          «كيف تتغيّر للأفضل» بياخد{' '}
          <span className="font-bold text-navy">خلاصة أهم 14 كتاب</span> في
          تطوير الذات والمال، ويقدّمها لك مركّزة وقابلة للتطبيق، من غير حشو،
          ومقسّمة على 4 مراحل واضحة تمشي فيها خطوة خطوة.
        </p>
      </Reveal>
    </section>
  );
}
