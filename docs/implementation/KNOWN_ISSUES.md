# Capstone OS — Known Issues & Mitigations

هذا الملف يسجل المشكلات التقنية التي تم رصدها ومعالجتها أثناء التطوير والتحقق الهندسي.

| Issue ID | Severity | Description | Status | Mitigation / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **KI-001** | Low | Next.js 16 with React 19 build cache warnings on initial cold start | **RESOLVED** | تم ضبط `next.config.ts` والتبعيات الرسمية الصارمة مع استخدام Turbopack للتجميع. |
| **KI-002** | Medium | PostgreSQL port 5432 already occupied on host Windows machine | **RESOLVED** | تم تشغيل عنقود محلي مخصص ومعزول على المنفذ `5433` مع حفظ بيانات التشغيل في `.pgdata` وبيانات المرور الآمنة في `.pgpass.local`. |
| **KI-003** | High | Client components importing Prisma client barrel causing Turbopack browser chunk bundling error | **RESOLVED** | تم فصل استيرادات الـ Enums في المكونات Client Components لتكون حصراً من `@/generated/prisma/enums` الخالية من تبعيات Node.js. |
| **KI-004** | Medium | Task sequence counter collision during task creation on pre-seeded database | **RESOLVED** | تم تعديل خوارزمية إنشاء المهام لحساب القيمة القصوى الحالية ديناميكياً: `Math.max(proj.taskSequence, maxExisting) + 1`. |
| **KI-005** | Medium | Vitest test runner running against unmigrated test database | **RESOLVED** | تم تطبيق كافة هجرات وقواعد والـ triggers والبذور على قاعدة بيانات `capstone_os_test` وتمرير `TEST_DATABASE_URL` لعزل بيئة الفحص بالكامل. |

---
**الوضع الراهن**: لا توجد أي مشكلات نشطة أو معيقة للنظام (0 Active Blockers). النظام في حالة جاهزية كاملة للإنتاج (Production-Ready).
