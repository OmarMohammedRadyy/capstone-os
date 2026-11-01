# Codex / Claude Code — Master Build Command

أنت المسؤول الهندسي الكامل عن بناء **Capstone OS** اعتمادًا على مجلد `/docs` هذا بوصفه المصدر الرسمي للحقيقة.

## مهمتك
استكشف المستودع كاملًا أولًا، اقرأ كل ملفات `/docs` بالترتيب، ثم أنشئ خطة تنفيذ داخل `docs/IMPLEMENTATION_STATUS.md` قبل تعديل الكود. بعد ذلك نفّذ النظام Production-grade مرحلة بمرحلة حتى يطابق المواصفات، مع الحفاظ على قابلية التشغيل بعد كل دفعة تغييرات.

## قواعد صارمة
1. لا تختصر المتطلبات ولا تستبدلها بـ mock UI.
2. لا تغير منطق الأعمال المحدد إلا إذا وجدت تعارضًا تقنيًا حقيقيًا؛ عندها أنشئ ADR يوضح المشكلة والقرار.
3. استخدم Modular Monolith وحدود domains المحددة.
4. Authorization دائمًا server-side.
5. كل input خارجي validated.
6. لا أسرار hard-coded ولا بيانات production في seed.
7. نفذ Arabic RTL + English LTR من البداية.
8. الهوية المرئية تتبع `23_UI_UX_MASTER_SPEC_PREMIUM.md` و`24_DESIGN_SYSTEM_TOKENS_COMPONENTS.md` حرفيًا؛ لا تضف gradients/AI clichés/emoji icons.
9. كل شاشة لها Loading, Empty, Error, Success, Disabled states.
10. كل workflow حرج له unit/integration/E2E tests المناسبة.
11. لا تستخدم package غير ضروري. أي dependency محوري جديد يحتاج سببًا في ADR أو implementation log.
12. لا تعتمد على RC/experimental package في core إلا بقرار موثق وبديل.
13. راجع accessibility وkeyboard وresponsive وRTL أثناء التنفيذ وليس في النهاية فقط.
14. حدّث `IMPLEMENTATION_STATUS.md` بعد كل feature: Done / Partial / Blocked + tests + files changed.

## ترتيب التنفيذ الإلزامي
Foundation → Auth/RBAC → Workspace/Team → Tasks/Sprints → Roadmap/Milestones → Meetings/Feedback → Documents → Decisions/Risks/Issues → Activity/Notifications/Search → Health/Contribution → Submissions → Defense → Admin phase-2 boundaries → Hardening.

## قبل اعتبار المشروع مكتملًا
- شغّل typecheck, lint, unit, integration, E2E, production build.
- أصلح الأخطاء الفعلية ولا تعطل قواعد lint/test لتجاوزها.
- اختبر IDOR عبر مشروعين مختلفين.
- اختبر upload/version/freeze submission.
- اختبر mobile 360px، desktop، Arabic RTL، English LTR، light/dark، keyboard navigation.
- نفّذ migration + seed من قاعدة فارغة.
- أنشئ `docs/FINAL_VERIFICATION_REPORT.md` يربط كل requirement بحالة التنفيذ والدليل.

## معيار الجودة النهائي
النتيجة يجب أن تبدو وتعمل كمنتج SaaS عالمي Premium جاهز للعرض على مستثمر/جامعة، لا كـ graduation CRUD demo ولا كواجهة مولدة آليًا.
