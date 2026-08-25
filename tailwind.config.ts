import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ألوان الهوية الفعلية للكتاب (من ملف الغلاف): كحلي داكن + ذهبي
        navy: {
          DEFAULT: '#12212e',
          light: '#1d3a4a',
          mid: '#234a5e',
          dark: '#0c1720',
        },
        gold: {
          DEFAULT: '#b07d1a',
          light: '#e8c079',
          dark: '#8a6214',
        },
        // ورق كريمي
        ivory: '#fdfbf7',
        ink: '#20313d',
        // ألوان المراحل الأربعة (نفس ألوان الغلاف)
        stage: {
          mind: '#2d5f8a', // اعرف عقلك
          self: '#1f7a5c', // اعرف نفسك والناس
          emotions: '#8a4b6b', // اعرف مشاعرك
          money: '#a86a1f', // اعرف فلوسك
        },
      },
      fontFamily: {
        // العناوين: Tajawal (نفس خط اسم الغلاف) — المتن: Almarai
        sans: ['var(--font-almarai)', 'system-ui', 'sans-serif'],
        display: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
