# صفحة هبوط — كتاب «كيف تتغيّر للأفضل» (عمر خالد)

صفحة هبوط Mobile-first لبيع كتاب إلكتروني، مبنية على **Next.js (App Router) + TypeScript + Tailwind CSS**، مع دعم كامل للعربية (RTL)، تكامل دفع **Paymob**، تتبّع **Meta Pixel**، وشات مساعد مجاني بـ **Groq** (أو Gemini).

---

## 🎨 لوحة الألوان والخطوط (هوية الكتاب الفعلية)

مأخوذة من ملفات تصميم الكتاب لتبقى الصفحة والكتاب قطعة واحدة:

- كحلي داكن `#12212e` / كحلي أفتح `#1d3a4a` · ذهبي `#b07d1a` / ذهبي فاتح `#e8c079` · كريمي `#fdfbf7`
- ألوان المراحل الأربعة: عقلك `#2d5f8a` · نفسك والناس `#1f7a5c` · مشاعرك `#8a4b6b` · فلوسك `#a86a1f`
- الخطوط: **Tajawal** للعناوين + **Almarai** للمتن (نفس خطوط الكتاب).

كلها معرّفة في `tailwind.config.ts` و`globals.css`.

---

## 🚀 التشغيل محليًا

```bash
cd landing
npm install
cp .env.local.example .env.local   # ثم املأ القيم
npm run dev
```

افتح http://localhost:3000

> الصفحة بتشتغل حتى لو المفاتيح فاضية — الشات وبوابة الدفع بيرجّعوا رسالة "غير مُهيّأ" بدل ما يكسروا الصفحة، فتقدر تشوف التصميم فورًا.

---

## 🔑 المتغيرات (`.env.local`)

كل المفاتيح موجودة مع شرحها في `.env.local.example`. باختصار:

| المتغير | لإيه | منين تجيبه |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | تتبّع الزوار/التحويلات | Meta Events Manager |
| `GROQ_API_KEY` | الشات المساعد المجاني ✅ | **مجاني** من console.groq.com/keys (بيشتغل عالميًا) |
| `GROQ_MODEL` | موديل الشات (اختياري) | افتراضي `llama-3.3-70b-versatile` |
| `GEMINI_API_KEY` | بديل للشات (اختياري) | ⚠️ طبقته المجانية مش متاحة في كل الدول |
| `PAYMOB_API_KEY` | مصادقة Paymob | Paymob > Settings > Account Info |
| `PAYMOB_CARD_INTEGRATION_ID` | تكامل الكارت | Paymob > Developers > Payment Integrations |
| `PAYMOB_WALLET_INTEGRATION_ID` | تكامل المحفظة | نفس المكان |
| `PAYMOB_IFRAME_ID` | صفحة الدفع | Paymob > Developers > iFrames |
| `PAYMOB_HMAC_SECRET` | التحقق من الـ webhook | Paymob > Settings > Account Info |
| `NEXT_PUBLIC_PRICE_EGP` | السعر الحالي | 49 |
| `NEXT_PUBLIC_ORIGINAL_PRICE_EGP` | السعر المشطوب | 99 |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع | مثلاً https://yourdomain.com |
| `BOOK_DOWNLOAD_URL` | رابط تحميل الكتاب بعد الدفع | Google Drive / رابط PDF |

---

## 💳 إعداد Paymob (خطوة بخطوة)

1. سجّل حساب واعمل **Payment Integrations** للكارت والمحفظة، وخُد الـ Integration IDs.
2. اعمل **iFrame** وخُد الـ iFrame ID.
3. في إعدادات كل Integration، ظبط روابط الرجوع (Transaction response callbacks):
   - **Redirect / Response URL** (المستخدم بيرجع هنا):
     `https://yourdomain.com/success`
   - **Processed / Webhook URL** (تأكيد سيرفر لسيرفر):
     `https://yourdomain.com/api/paymob/webhook`
4. خُد الـ **HMAC secret** وحطّه في `.env.local`.

**تدفّق الدفع في الكود:** المستخدم يضغط شراء → `POST /api/paymob/initiate` (auth → order → payment key → iframe URL) → تحويل لصفحة Paymob → بعد الدفع يرجع لـ `/success`، و Paymob يبعت تأكيد موثّق بالـ HMAC لـ `/api/paymob/webhook`.

> **المحفظة:** الكود بيستخدم نفس الـ iframe للكارت والمحفظة (الـ iframe بيعرض الطريقة حسب الـ integration). لو عايز تدفّق محفظة مباشر بدون iframe (بجمع رقم الموبايل) عدّل `src/app/api/paymob/initiate/route.ts` لاستخدام `/acceptance/payments/pay`.

---

## 📦 تسليم الكتاب (مهم للإنتاج)

السكافولد الحالي:
- **الكتاب نفسه متحزّم جوّه المشروع** في `book/book.pdf`، وبيتقدّم للتحميل عبر `/api/download` (باسم «كيف-تتغير-للأفضل.pdf»).
- الـ webhook **بيتحقق من صحة الدفع بالـ HMAC** ويسجّله في اللوج.
- صفحة `/success` بتعرض زر تحميل بيوديه على `BOOK_DOWNLOAD_URL` (المضبوط على `/api/download`).

> ملاحظة: حاليًا رابط التحميل مش مربوط بتأكيد الدفع (أي حد يوصل لـ `/api/download` يقدر يحمّل). لو هترفع الريبو على GitHub عام، الكتاب هيبقى ظاهر — خلّي الريبو private، أو انقل الحماية لتوكن دفع مؤكَّد (تحت). ولو استخدمت رابط Google Drive خارجي بدل الملف المحزّم، خلّي صلاحية الرابط "بالرابط فقط".

للتشديد قبل الإطلاق (موصى به):
1. أضف **قاعدة بيانات** (مثلاً Supabase/Postgres): خزّن الطلب الناجح من الـ webhook.
2. أضف **خدمة إيميل** (Resend/SendGrid): ابعت رابط تحميل خاص لكل عميل بعد نجاح الـ webhook.
3. اربط عرض الرابط في `/success` بتأكيد فعلي من قاعدة البيانات بدل الاعتماد على `?success=true` (لأنها قابلة للتلاعب من المستخدم).

الأماكن المعلّمة بـ `TODO` في `src/app/api/paymob/webhook/route.ts` هي نقطة البداية.

---

## 📖 تعديل المحتوى

- **معلومات الكتاب والمراحل والأسعار:** `src/lib/book-data.ts`
- **الفصل المجاني:** `src/lib/chapter.ts` (استبدل النص النموذجي بفصلك الحقيقي)
- **غلاف الكتاب:** الغلاف الحقيقي مستخرج من ملف الكتاب في `public/book-cover.png`. لتحديثه: استبدل الملف (أو غيّر المسار في `src/components/BookCover.tsx`).
- **الأسئلة الشائعة:** `src/components/FAQ.tsx`

الشات المساعد بياخد سياقه تلقائيًا من `book-data.ts`، وبيرد فقط في نطاق الكتاب (مايردش على حاجة برّه).

---

## 🎟️ الكوبونات (تحميل مجاني)

كوبون بنسبة **100%** بيخلّي صاحبه ينزّل الكتاب على طول من غير دفع. كل كوبون **صالح مرة واحدة افتراضيًا** (وتقدر تحدّد العدد).

**الإعداد (مرة واحدة):** في `.env.local` حط:
- `ADMIN_PASSWORD` = أي باسورد قوي (بيحمي صفحة الأدمن).
- `DOWNLOAD_TOKEN_SECRET` = نص عشوائي طويل (اتولّد لك واحد جاهز).

**عمل كوبون:** افتح `/admin` → دخول بالباسورد → «اعمل كوبون جديد» (سيب الكود فاضي عشان يتولّد تلقائي، أو اكتب كود بنفسك) → حدّد «صالح كام مرة» (1 = مرة واحدة). الجدول بيوريك كل كوبون صالح كام مرة كمان.

**الاستخدام:** الزائر بيكتب الكود في صندوق «معاك كوبون؟» في الصفحة → لو صالح، الكتاب بينزل فورًا.

**الأمان:** التحميل (`/api/download`) بقى محمي بتوكن موقّع — مفيش تحميل من غير دفع ناجح أو كوبون صالح.

> ⚠️ **مهم للنشر على Vercel:** الكوبونات مخزّنة في ملف محلي (`.data/coupons.json`)، وده **مش بيفضل** على Vercel (نظام ملفات مؤقت). قبل ما تنشر على Vercel، بدّل التخزين في `src/lib/coupons.ts` بمخزن دائم زي **Upstash Redis** أو **Vercel KV** (كله في ملف واحد). على سيرفر دائم (VPS) الملف المحلي بيشتغل عادي. قوللي أوصّلك Upstash لو هتنشر على Vercel.

---

## 🌐 النشر

انشر على **Vercel** (الأنسب لـ Next.js):
1. ارفع الكود على GitHub.
2. اربطه بـ Vercel، وحط نفس متغيرات `.env.local` في Environment Variables.
3. حدّث `NEXT_PUBLIC_SITE_URL` وروابط Paymob (success + webhook) بالدومين الحقيقي.

```bash
npm run build   # للتأكد إن كل حاجة تمام قبل النشر
```

---

## 🗂 هيكل المشروع

```
src/
├── app/
│   ├── layout.tsx            # RTL + الخط العربي + Meta Pixel
│   ├── page.tsx              # تجميع الأقسام
│   ├── globals.css
│   ├── success/page.tsx      # صفحة بعد الدفع
│   └── api/
│       ├── chat/route.ts             # شات Groq/Gemini المجاني (نطاق الكتاب فقط)
│       └── paymob/
│           ├── initiate/route.ts     # بدء الدفع
│           └── webhook/route.ts       # تأكيد الدفع (HMAC)
├── components/               # الأقسام والعناصر (Hero, Pricing, ChatWidget…)
└── lib/
    ├── book-data.ts          # مصدر معلومات الكتاب
    ├── chapter.ts            # الفصل المجاني
    └── pixel.ts              # أحداث Meta Pixel
```
