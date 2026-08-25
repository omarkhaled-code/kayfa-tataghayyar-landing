const stats = [
  { num: '14', label: 'كتاب مُلخّص' },
  { num: '4', label: 'مراحل متدرّجة' },
  { num: '160', label: 'صفحة مركّزة' },
  { num: '∞', label: 'وصول مدى الحياة' },
];

// شريط أرقام سريع تحت الهيرو — بيدّي مصداقية في ثانية.
export function StatsBar() {
  return (
    <section className="bg-navy-dark text-ivory">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-gold-light md:text-4xl">
              {s.num}
            </div>
            <div className="mt-1 text-sm text-ivory/70">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
