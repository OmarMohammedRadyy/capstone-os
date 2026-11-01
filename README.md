# Capstone OS — Graduation Project Operating System (نظام تشغيل مشاريع التخرج الأكاديمية)

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%200%20errors-blue.svg)](https://www.typescriptlang.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-black.svg)](https://nextjs.org/)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18%20(Full%20ACID)-336791.svg)](https://www.postgresql.org/)
[![Prisma 7](https://img.shields.io/badge/Prisma-7.10%20(Adapter--pg)-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC.svg)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-Arabic%20RTL%20%2B%20English%20LTR-green.svg)](src/i18n/)
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen.svg)](tests/)

---

## 1. نظرة عامة (Overview)

**Capstone OS** هو نظام تشغيل أكاديمي وإداري متكامل مصمم لقيادة وحوكمة مشاريع التخرج الجامعية من مرحلة الفكرة وحتى جلسة المناقشة النهائية والتقييم الأكاديمي.

النظام مبني وفق فلسفة بصرية وهندسية صارمة:
- **Quiet Luxury × Editorial Productivity × Academic Command Center**: تصميم بصري ناضج، خيارات خطوط وطباعة راقية، بدون تدرجات لونية زاعقة، وبدون إيموجي أو عناصر طفولية.
- **Production-Ready End-to-End**: تطبيق حقيقي متصل بقاعدة بيانات PostgreSQL 18 ذات 54 جدولاً بعلاقات صارمة، قيود تحقق CHECK constraints، ومحفزات Triggers غير قابلة للتعديل أو الحذف (Append-only) لسجلات التدقيق واللقطات.
- **Deterministic Project Health Engine (0–100)**: خوارزمية قطعية لحساب صحة المشروع مستندة إلى 6 أبعاد هندسية حقيقية وتفسير ديناميكي للأسباب (Explainable Drivers).
- **Evidence-Based Contribution Analytics**: مقاييس مساهمة عادلة مبنية على المخرجات والنتائج المعتمدة، مع تنبيهات تركز المعرفة (Bus Factor) واتزان الأعباء دون مراقبة متطفلة.
- **Bilingual Arabic RTL & English LTR**: دعم أصيل للغة العربية من اليمين لليسار واللغة الإنجليزية من اليسار لليمين على مستوى جميع اللوحات، النماذج، والمسارات.

---

## 2. البنية المعمارية والتقنية (Architecture & Tech Stack)

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.4.3 (App Router & Turbopack) | Server Components, Server Actions, Route Handlers |
| **Language** | TypeScript 6.0 (Strict Mode) | `noImplicitAny: true`, zero `any` workarounds |
| **Database** | PostgreSQL 18 | Port 5433 (Local dev/prod isolation) with `pg_trgm` |
| **ORM & Driver** | Prisma 7.10.1 + `@prisma/adapter-pg` | Driver adapters architecture, 54 models |
| **Authentication** | Custom Secure Cookie Sessions | Native Argon2id hashing (`@node-rs/argon2`), SHA-256 tokens |
| **Authorization** | Project-Scoped RBAC | `SYSTEM_ADMIN`, `DEPARTMENT_ADMIN`, `TEAM_LEADER`, `SUPERVISOR`, `STUDENT` |
| **Design System** | Tailwind CSS 4 + Radix UI Primitives | Custom CSS tokens, Dark/Light modes, RTL context |
| **Icons** | Lucide React | Precision monochrome iconography |
| **Testing** | Vitest 5.0 + Playwright 1.64 | Unit, Integration, Isolation, and E2E suites |

---

## 3. الحسابات التجريبية المسبقة (Demo Accounts)

تم تهيئة قاعدة البيانات مسبقًا بسيناريو أكاديمي متكامل لمشروع **"Smart Campus Operations Platform (SCOP)"**. يمكنك تسجيل الدخول فورًا باستخدام الحسابات التالية:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Team Leader (طالب متصدر الفريق)** | `leader@example.edu` | `Capstone2026!` | إدارة المشروع، المهام، تجميد التسليمات، الإعدادات |
| **Academic Supervisor (المشرف الأكاديمي)** | `supervisor@example.edu` | `Capstone2026!` | توجيه الملاحظات، اعتماد المحطات، فك تجميد التسليمات |
| **UI Student (مهندس الواجهات)** | `sarah@example.edu` | `Capstone2026!` | مهام التصميم، الواجهات، وتوثيق التصميم |
| **Backend Student (مهندس البنية التحتية)** | `youssef@example.edu` | `Capstone2026!` | مهام الخادم، قواعد البيانات، والقرارات المعمارية ADRs |
| **System Administrator (مسؤول النظام)** | `admin@example.edu` | `Capstone2026!` | إدارة النظام، كافة المشاريع، سجلات التدقيق الشاملة |

---

## 4. التشغيل والإعداد السريع (Quickstart Guide)

### المتطلبات المسبقة:
- Node.js >= 22.0.0
- pnpm >= 10.0.0
- PostgreSQL 18 (يعمل على المنفذ 5433، أو قم بتعديل `DATABASE_URL` في ملف `.env`)

### خطوات التثبيت:

```bash
# 1. تثبيت الحزم والمكتبات
pnpm install

# 2. إعداد ملف البيئة
cp .env.example .env

# 3. توليد عميل بريزما
pnpm db:generate

# 4. تطبيق الهجرات وقواعد البيانات
pnpm db:deploy

# 5. ملء قاعدة البيانات بالبيانات الأكاديمية الواقعية
pnpm db:seed

# 6. تشغيل خادم التطوير
pnpm dev
```

التطبيق متاح الآن على: `http://localhost:3000`

---

## 5. حزمة الاختبارات وضمان الجودة (Verification Pipeline)

يتضمن المشروع حزمة تحقق شاملة تغطي كافة المستويات:

```bash
# تشغيل الفحص الكامل لكافة المتطلبات (Typecheck + Lint + i18n + Tests + Build)
pnpm verify

# فحص توافق الأنواع في تايب سكريبت (0 أخطاء إجبارية)
pnpm typecheck

# فحص جودة وتنسيق الكود بلينتر ESLint
pnpm lint

# فحص مطابقة وتزامن قواميس اللغتين العربية والإنجليزية (100% Key Parity)
pnpm i18n:check

# تشغيل اختبارات الوحدة واختبارات التكامل (16/16 Test Passed)
pnpm test:all

# تشغيل اختبارات واجهة المستخدم E2E عبر Playwright
pnpm test:e2e

# بناء حزمة الإنتاج التجميعية (Next.js Production Build)
pnpm build
```

---

## 6. مشغل المهام الخلفية (Background Worker Daemon)

يتضمن النظام Worker Daemon مستقل للمهام المجدولة وحسابات الدقة اليومية:
- إعادة حساب مؤشر صحة المشاريع اليومي وتوليد اللقطات (Health Snapshots)
- إرسال تنبيهات اقتراب المواعيد النهائية (Deadline Reminders قبل 48 ساعة)
- تطهير الجلسات المنتهية الصلاحية

```bash
# تشغيل العامل في الخلفية بشكل مستمر:
pnpm worker

# تشغيل دورة فحص واحدة والخروج (مفيد لبيئات CI/CD):
pnpm worker --once
```

---

## 7. ملخص الوحدات المنفذة (Implemented Modules)

1. **Academic Command Center & Overview (`/app/p/[slug]/overview`)**:
   - مؤشر الصحة الأكاديمية التفاعلي (Health Ring) مع سرد الأسباب.
   - كروت الإحصائيات الحية (المهام، ملاحظات المشرف، المخاطر المفتوحة، تسليمات الحزم).
   - مخطط مسار محطات المشروع (Milestones).
2. **Tasks & Agile Sprints (`/tasks`, `/sprints`, `/my-work`)**:
   - لوحة كانبان كاملة بدعم السحب والتصنيف (Kanban Board).
   - منع الحلقات التكرارية في التبعيات (Cycle Dependency Detection).
   - قوائم المراجعة والتحقق لكل مهمة (Checklist Items).
3. **Milestones & Roadmap (`/roadmap`, `/milestones`)**:
   - 10 مراحل تخرج قياسية مع إثباتات الإنجاز وموافقة المشرف الرسمية.
4. **Supervisor Feedback Inbox (`/feedback`)**:
   - دورة حياة كاملة: ملاحظة المشرف -> معالجة الطالب -> تحقق المشرف الرسمي -> إعادة فتح الملاحظة.
5. **Academic Meetings & Minutes (`/meetings`)**:
   - توثيق محاضر الاجتماعات، سجل الحضور، وتحويل بنود العمل إلى مهام بنقرة واحدة.
6. **Document Repository & Versioning (`/documents`)**:
   - أرقام إصدارات متسلسلة غير قابلة للتلاعب، بصمات SHA-256، والتحديد الرسمي للوثيقة.
7. **Architectural Decision Records ADRs (`/decisions`)**:
   - توثيق الخيارات الهندسية، سجل التعديلات غير القابل للحذف، وآلية الاستبدال (Superseding).
8. **Risk & Issues 5x5 Matrix (`/risks`)**:
   - مصفوفة احتمالية وتأثير (1–5) مع نسب التعرض وخطط الطوارئ.
9. **Contribution Analytics (`/analytics`)**:
   - قياس موضوعي مبني على المخرجات المعتمدة، تنبيهات الاعتمادية الفردية (Bus Factor Risk)، ومخطط أعباء الـ 14 يومًا.
10. **Submissions & Freeze Gate (`/submissions`)**:
    - التحقق الإلزامي من المخرجات، التجميد غير القابل للتعديل (Freeze Snapshot)، وفك التجميد بتفويض المشرف.
11. **Defense Command Center & Presentation Mode (`/defense`, `/defense/present`)**:
    - توزيع الدقائق لكل متحدث، خطة الطوارئ دون اتصال بالإنترنت، بنك أسئلة المناقشة المتوقعة، ووضع العرض النظيف للجنة التحكيم.
12. **Project Settings & Audit Timeline (`/settings`, `/activity`)**:
    - تخصيص أوزان أبعاد معادلة الصحة (مع قيد CHECK sum=100)، إدارة الأعضاء، وتدفق زمني غير قابل للحذف لكافة الأحداث.

---

## 8. الأمان والحوكمة (Security & Integrity)

- **عزل بيانات المشاريع (Project Data Isolation)**: تم فحص واختبار حماية الـ IDOR ضد أي محاولة لعضو مشروع بالوصول لبيانات مشروع آخر.
- **تأمين كلمات المرور**: تشفير Argon2id بمتطلبات ذاكرة 19MB وتكلفة زمنية تمنع هجمات القوة الغاشمة (Brute Force).
- **قفل الحسابات التلقائي**: قفل الحساب مؤقتًا لمدة 15 دقيقة بعد 5 محاولات تسجيل دخول خاطئة متتالية.
- **جلسات مشفرة**: كوكيز HTTP-Only مع توكنات عشوائية مشفرة بـ SHA-256 وتدوير دوري.
- **سجلات تدقيق غير قابلة للتعديل**: حماية على مستوى محرك قاعدة البيانات عبر Triggers تمنع أي `UPDATE` أو `DELETE` في جداول التدقيق واللقطات.

---

## 9. الترخيص (License)

هذا النظام مطور ومملوك للأغراض الأكاديمية وإدارة مشاريع التخرج وفق أعلى المعايير الهندسية والإنتاجية.
