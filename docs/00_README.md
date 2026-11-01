# Capstone OS — Master Engineering Specification

> نظام ويب Premium لإدارة مشروع التخرج من اختيار الفكرة وحتى المناقشة النهائية.

## الهدف
هذه الحزمة هي المرجع التنفيذي الوحيد للمشروع. يجب أن يتمكن فريق تطوير أو Codex/Claude Code من بناء النظام دون اختراع منطق أعمال أو هوية تصميم من عنده.

## مبادئ المنتج
1. ليس Trello Clone؛ بل **Graduation Project Operating System**.
2. Core functionality لا يعتمد على AI.
3. كل قرار، مهمة، ملف، ملاحظة مشرف، Risk وSubmission يجب أن يكون قابلًا للتتبع Auditably.
4. Mobile-first responsive مع تجربة Desktop قوية لإدارة المشروع.
5. دعم عربي/إنجليزي وRTL/LTR من البداية.
6. Accessibility وSecurity وObservability جزء من Definition of Done.
7. Modular Monolith أولًا؛ لا Microservices بلا حاجة مثبتة.

## الأدوار
- Student
- Team Leader
- Supervisor
- Department Admin (Phase 2)
- System Admin

## الوحدات الرئيسية
Dashboard, Team, Tasks, Sprints, Roadmap, Milestones, Meetings, Supervisor Feedback, Documents, Decisions, Risks, Issues, Project Health, Contribution Analytics, Notifications, Activity Timeline, Submissions, Defense Mode, Settings, Admin.

## ترتيب قراءة الوثائق
ابدأ بـ 01→07 لفهم المنتج والمعمارية، ثم 08→22 للمنطق، 23→27 للواجهة، 28→34 للهندسة التشغيلية، 35→39 للتنفيذ والإطلاق.

## Definition of Done العامة
- Acceptance criteria منفذة.
- Tests ناجحة.
- لا Critical security findings.
- كل action حساس في Audit Log.
- Empty/loading/error/success states موجودة.
- Keyboard navigation وRTL صالحان.
- لا console errors أو unhandled promise rejections.
- لا hard-coded secrets.
- Documentation محدثة مع التنفيذ.
