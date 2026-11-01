# Capstone OS — Implementation Decisions (ADRs & Technical Notes)

هذا السجل يوثق القرارات الهندسية المتخذة أثناء بناء Capstone OS وفق متطلبات `CAPSTONE_OS_MASTER_SPEC.md` ومجلد `/docs`.

---

## DEC-0001: Modular Monolith مع Next.js 16 App Router و Node 22
- **السياق**: المواصفات (docs/06 و docs/07) تشترط Modular Monolith مع Next.js App Router و React 19 و TypeScript Strict.
- **القرار**: استخدام Next.js 16.4 مع Server Actions و Route Handlers تحت `/api/v1` ومكتبات Domain Services منفصلة تمامًا داخل `src/server/services`.
- **الأثر**: سهولة التطوير والفحص الموحد، منع الـ microservices overhead، والالتزام الصارم بـ Single Source of Truth للـ Business Logic.

---

## DEC-0002: قاعدة البيانات PostgreSQL 18 مع Prisma 7 و Custom SQL Migrations
- **السياق**: يلزم وجود UUIDs، timestamptz، triggers لمنع التعديل على الجداول الـ append-only (AuditLog, ActivityEvent, HealthSnapshot, DecisionRevision, SubmissionArtifacts)، وفهارس Trigram للبحث السريع، و Check constraints لضمان مجموع أوزان صحة المشروع = 100 وضمان سلامة البيانات.
- **القرار**: دمج Prisma ORM 7 كـ Schema Definition و Query Engine مع ملفات Migration SQL مخصصة تتضمن Triggers و GIN Indexes و Checks غير المتاحة بشكل أصيل في Prisma schema.
- **الأثر**: ضمان Referential Integrity وحماية Audit Trail على مستوى محرك قاعدة البيانات.

---

## DEC-0003: دعم اللغة والتوجيه (i18n & RTL)
- **السياق**: النظام ثنائي اللغة (عربية كـ First-class للمستخدمين في الشرق الأوسط + إنجليزية للمصطلحات الأكاديمية وواجهات اللجان)، مع دعم كامل لـ RTL و LTR.
- **القرار**: استخدام نظام ترجمة موثوق متوافق مع Next.js 16 مع Context Provider و Dictionary محلي لـ `ar` و `en`، ودعم اتجاه `dir="rtl"` أو `dir="ltr"` تلقائيًا على مستوى جذر التطبيق، واستخدام Tailwind Logical Properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
- **الأثر**: واجهة موحدة، انعدام التعارضات في المحاذاة بين العربية والإنجليزية.

---

## DEC-0004: محرك الصحة (Project Health Engine) الحسابي الحتمي
- **السياق**: المتطلبات (docs/18 و Master Spec) تمنع استخدام الذكاء الاصطناعي كصندوق أسود لحساب صحة المشروع وتفرض معادلة شفافة قابلة للتفسير بنسبة 0–100 بناءً على 6 محاور: Milestones (30%), Tasks (20%), Supervisor Feedback (15%), Risks & Issues (15%), Documentation & Submission Readiness (10%), Team Workload Balance (10%).
- **القرار**: بناء `ProjectHealthService` في `src/server/services/health.ts` يقوم بحساب النقاط بدقة رياضية، ويرفق مصفوفة `drivers` توضح للمستخدم بالتحديد أسباب الخصم أو التحذيرات (مثل: 3 مهام متأخرة، ملاحظتان حرجتان للمشرف لم تحلا).
- **الأثر**: دقة وشفافية كاملة وفق معايير الجودة الأكاديمية.

---

## DEC-0005: فصل استيراد الـ Enums في المكونات Client Components عن عميل Prisma
- **السياق**: استيراد الـ Enums من ملف البرميل المركزي `src/generated/prisma/index.ts` داخل مكونات المتصفح (`"use client"`) يتسبب في قيام Turbopack بتتبع عميل Prisma الخاص بـ Node.js (`node:module`, `node:fs`) مما يؤدي إلى فشل التجميع في المتصفح.
- **القرار**: استيراد كافة الـ Enums في المكونات و Server Actions من `@/generated/prisma/enums` مباشرة والمصممة لتكون خالية من أي تبعيات خاصة ببيئة Node.js.
- **الأثر**: بناء سريع، انعدام تسريب أي كود خادم للعميل، واجتياز Next.js Turbopack build بنجاح تام.

---

## DEC-0006: حساب التسلسل التلقائي للمهام والقرارات برقم تسلسلي متزامن
- **السياق**: توليد أرقام المهام والقرارات (مثل TASK-1, TASK-2) عبر حقل `taskSequence` في جدول المشروع قد يتعارض مع بيانات مسبقة البذر (Seeded Data) إذا كان الرقم التسلسلي أقل من الأرقام الموجودة بالفعل في جدول المهام.
- **القرار**: حساب الرقم التالي ديناميكيًا داخل العملية التبادلية `tx`:
  `nextNumber = Math.max(proj.taskSequence, currentMaxInProject) + 1`
  وتحديث `taskSequence` بالقيمة الأحدث.
- **الأثر**: منع أخطاء تعارض المفاتيح الفريدة `tasks_project_id_number_key` نهائيًا.

---

## DEC-0007: عزل بيئة الاختبار عن الإنتاج عبر قاعدة بيانات اختبارية مخصصة
- **السياق**: تشغيل اختبارات التكامل (Integration Tests) ضد نفس قاعدة بيانات التطوير يؤدي إلى تلوث بيانات السيناريو الأكاديمي المسبق البذر أو التأثير على سجلات التدقيق اللحظية.
- **القرار**: إنشاء قاعدة بيانات منفصلة `capstone_os_test` وتطبيق كافة الـ Triggers والفهارس والبذور عليها تلقائيًا وتوجيه `TEST_DATABASE_URL` إليها أثناء تشغيل Vitest.
- **الأثر**: بيئة اختبار معزولة 100%، تمكين اختبارات التراجع والـ IDOR دون المساس ببيانات التشغيل.

---

## DEC-0008: التحقق الصارم متعدد المستويات عبر `pnpm verify`
- **السياق**: ضمان بقاء النظام Production-Ready بشكل مستمر وخالٍ من أي Prototype Code أو أخطاء صامتة.
- **القرار**: إعداد خط أنابيب فحص كامل (`pnpm verify`) ينفذ بالتتابع:
  1. `pnpm typecheck` (فحص تايب سكريبت الصارم - 0 أخطاء).
  2. `pnpm lint` (فحص جودة الكود بلينتر ESLint 9 Flat Config - 0 تحذيرات).
  3. `pnpm i18n:check` (التحقق من تزامن ومطابقة قواميس العربية والإنجليزية بنسبة 100%).
  4. `pnpm test:all` (16 اختبار تغطي الوحدة، التكامل، التشفير، عزل الـ IDOR، والتجميد).
  5. `pnpm build` (بناء إنتاج Next.js كامل وتوليد كافة المسارات الـ 30+).
- **الأثر**: ضمان الموثوقية الهندسية الكاملة وجاهزية الإطلاق الفوري.
