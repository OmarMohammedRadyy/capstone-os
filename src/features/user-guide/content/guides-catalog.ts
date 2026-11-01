import type {
  ContextualPageHint,
  GuideDefinition,
  WorkflowStageNode,
} from "../types/guide-types";

export const GUIDE_CATALOG_VERSION = 1;

/**
 * Interactive 5-Stage Visual Workflow Map inside User Guide Center (`دليل النظام`)
 * Teaches the macro lifecycle: Plan -> Execute -> Meet & Decide -> Review & Mitigate -> Submit & Defend
 */
export const WORKFLOW_STAGES: WorkflowStageNode[] = [
  {
    id: "stage-plan",
    number: 1,
    titleAr: "١. خطّط وقسّم المراحل",
    titleEn: "1. Plan & Structure",
    subtitleAr: "Roadmap • Milestones • Team",
    subtitleEn: "Roadmap • Milestones • Team",
    descriptionAr:
      "كل مشروع تخرج ناجح بيبدأ بتحديد المراحل الـ ١٠ الأساسية، وتعيين المحطات الكبرى (Milestones) ومواعيدها، وتوزيع الأدوار على الفريق بوضوح.",
    descriptionEn:
      "Define the academic phases, establish major deliverable milestones, and assign clear team responsibilities.",
    practicalRuleAr:
      "القاعدة الذهبية: اربط كل مرحلة بمحطة (Milestone) ليها تاريخ تسليم ومعيار قبول واضح قبل ما تبدأوا تكتبوا كود.",
    linkedGuideId: "roadmap-milestones",
    modules: [
      {
        nameAr: "خارطة الطريق (Roadmap)",
        nameEn: "Roadmap",
        route: "/roadmap",
        guideId: "roadmap-milestones",
        summaryAr: "متابعة المراحل الأكاديمية والمحطات الرئيسية واعتماد المشرف.",
      },
      {
        nameAr: "المحطات الرئيسية (Milestones)",
        nameEn: "Milestones",
        route: "/milestones",
        guideId: "roadmap-milestones",
        summaryAr: "إرفاق أدلة الإنجاز وطلب اعتماد المشرف على كل محطة.",
      },
      {
        nameAr: "الفريق والإعدادات (Settings)",
        nameEn: "Team & Settings",
        route: "/settings",
        guideId: "dashboard-command",
        summaryAr: "إضافة أعضاء الفريق وتحديد المسؤوليات وأوزان مؤشر الصحة.",
      },
    ],
  },
  {
    id: "stage-execute",
    number: 2,
    titleAr: "٢. نفّذ في دورات مركزة",
    titleEn: "2. Execute in Sprints",
    subtitleAr: "Tasks • Sprints • My Work",
    subtitleEn: "Tasks • Sprints • My Work",
    descriptionAr:
      "حوّل كل Milestone كبيرة لمهام صغيرة (Tasks) ليها مسؤول واحد وقائمة فحص (Checklist)، وجمّع شغل كل أسبوعين في Sprint ليها هدف واضح.",
    descriptionEn:
      "Break milestones into owned tasks with checklists and dependencies, grouped into focused short sprints.",
    practicalRuleAr:
      "القاعدة الذهبية: لو مهمة واقفة على حاجة تانية، حوّلها لـ Blocked واكتب السبب فورًا عشان قائد الفريق يتصرف بدري.",
    linkedGuideId: "tasks-workflow",
    modules: [
      {
        nameAr: "مهامي اليوم (My Work)",
        nameEn: "My Work",
        route: "/my-work",
        guideId: "my-work-daily",
        summaryAr: "كل اللي مطلوب منك النهارده في شاشة واحدة من غير تشتت.",
      },
      {
        nameAr: "لوحة المهام (Tasks & Kanban)",
        nameEn: "Tasks Board",
        route: "/tasks",
        guideId: "tasks-workflow",
        summaryAr: "إنشاء المهام، تحريك الحالات، وقوائم الفحص والاعتمادية.",
      },
      {
        nameAr: "الدورات التنفيذية (Sprints)",
        nameEn: "Sprints",
        route: "/sprints",
        guideId: "sprints-execution",
        summaryAr: "تجميع مهام الفترة الحالية في هدف محدد وقياس سرعة الإنجاز.",
      },
    ],
  },
  {
    id: "stage-meet",
    number: 3,
    titleAr: "٣. اجتمع ووثّق القرارات",
    titleEn: "3. Meet & Log Decisions",
    subtitleAr: "Meetings • Decisions (ADR) • Activity",
    subtitleEn: "Meetings • Decisions (ADR) • Activity",
    descriptionAr:
      "سجّل اجتماعات الفريق أو المشرف، وحوّل التكليفات (Action Items) لمهام فعلية بضغطة زر، ووثّق أي قرار هندسي مهم عشان محدش ينسى اخترتوا إيه وليه.",
    descriptionEn:
      "Record meeting minutes, convert action items directly into tasks, and document architectural decisions (ADRs).",
    practicalRuleAr:
      "القاعدة الذهبية: ماتخليش أي Action Item تفضل مجرد سطر في محضر الاجتماع — حوّلها لمهمة مرتبطة بمسؤول.",
    linkedGuideId: "meetings-workflow",
    modules: [
      {
        nameAr: "الاجتماعات والمحاضر (Meetings)",
        nameEn: "Meetings",
        route: "/meetings",
        guideId: "meetings-workflow",
        summaryAr: "جدولة الاجتماعات، كتابة المحضر، وتحويل التكليفات لمهام.",
      },
      {
        nameAr: "سجل القرارات (Decisions ADR)",
        nameEn: "Decisions Log",
        route: "/decisions",
        guideId: "decisions-log",
        summaryAr: "توثيق الخيارات التقنية، المميزات والعيوب، وسبب القرار النهائي.",
      },
      {
        nameAr: "سجل النشاط (Activity Stream)",
        nameEn: "Activity Feed",
        route: "/activity",
        guideId: "dashboard-command",
        summaryAr: "خط زمني شفاف لكل حركة وتحديث حصل في المشروع.",
      },
    ],
  },
  {
    id: "stage-review",
    number: 4,
    titleAr: "٤. راجع وعالج المخاطر",
    titleEn: "4. Review & Mitigate",
    subtitleAr: "Feedback • Documents • Risks • Health",
    subtitleEn: "Feedback • Documents • Risks • Health",
    descriptionAr:
      "تابع ملاحظات المشرف الأكاديمي لحد ما تتأكد، وارفع إصدارات الملفات ببصمة SHA-256، وراقب المخاطر ومؤشر صحة المشروع.",
    descriptionEn:
      "Resolve supervisor feedback with evidence, manage immutable document versions, and track project health & risks.",
    practicalRuleAr:
      "القاعدة الذهبية: أي ملاحظة من المشرف لازم يترد عليها برابط دليل (Evidence) قبل طلب التأكيد النهائي.",
    linkedGuideId: "supervisor-feedback",
    modules: [
      {
        nameAr: "ملاحظات المشرف (Supervisor Feedback)",
        nameEn: "Supervisor Feedback",
        route: "/feedback",
        guideId: "supervisor-feedback",
        summaryAr: "دورة معالجة ملاحظات المشرف من الفتح لحد التأكيد الرسمي.",
      },
      {
        nameAr: "المستندات والإصدارات (Documents)",
        nameEn: "Documents",
        route: "/documents",
        guideId: "documents-versioning",
        summaryAr: "حفظ تاريخ النسخ ومنع فوضى final-final-v3.",
      },
      {
        nameAr: "المخاطر والمشاكل (Risks & Issues)",
        nameEn: "Risks & Issues",
        route: "/risks",
        guideId: "risks-issues",
        summaryAr: "مصفوفة ٥×٥ للمخاطر المحتملة وحل المشاكل الحرجة.",
      },
      {
        nameAr: "التحليلات والمساهمة (Analytics)",
        nameEn: "Contribution Analytics",
        route: "/analytics",
        guideId: "project-health",
        summaryAr: "قياس مساهمة كل عضو بعدالة واكتشاف تركز المعرفة (Bus Factor).",
      },
    ],
  },
  {
    id: "stage-defend",
    number: 5,
    titleAr: "٥. سلّم واستعد للمناقشة",
    titleEn: "5. Submit & Defend",
    subtitleAr: "Submissions • Freeze • Defense Mode",
    subtitleEn: "Submissions • Freeze • Defense Mode",
    descriptionAr:
      "استوفِ متطلبات التسليم الإلزامية، وجمّد لقطة التسليم النهائية (Freeze Snapshot)، وجهّز تقسيم وقت العرض وبنك أسئلة اللجنة ليوم المناقشة.",
    descriptionEn:
      "Complete mandatory submission checklists, freeze cryptographic snapshots, and rehearse in Defense Mode.",
    practicalRuleAr:
      "القاعدة الذهبية: جمّد حزمة التسليم قبل الموعد بوقت كافي، واعمل بروفة كاملة باستخدام وضع العرض للجنة (Jury Present Mode).",
    linkedGuideId: "submissions-freeze",
    modules: [
      {
        nameAr: "التسليمات والتجميد (Submissions)",
        nameEn: "Submissions",
        route: "/submissions",
        guideId: "submissions-freeze",
        summaryAr: "قائمة فحص المتطلبات الإلزامية وتجميد لقطة التسليم SHA-256.",
      },
      {
        nameAr: "غرفة عمليات المناقشة (Defense Hub)",
        nameEn: "Defense Center",
        route: "/defense",
        guideId: "defense-readiness",
        summaryAr: "تقسيم فقرات المتحدثين، خطة الطوارئ، وبنك أسئلة اللجنة.",
      },
      {
        nameAr: "وضع العرض للجنة (Jury Present Mode)",
        nameEn: "Jury Present Mode",
        route: "/defense/present",
        guideId: "defense-readiness",
        summaryAr: "شاشة عرض نقية مخصصة ليوم المناقشة أمام لجنة التحكيم.",
      },
    ],
  },
];

/**
 * Contextual First-Visit Page Hints (Why -> What -> Action -> Next Step)
 */
export const CONTEXTUAL_PAGE_HINTS: ContextualPageHint[] = [
  {
    id: "hint-overview",
    route: "/overview",
    titleAr: "مركز القيادة اليومي للمشروع",
    titleEn: "Executive Command Center",
    whyAr: "عشان تعرف حالة المشروع كلها في ٥ ثواني من غير ما تلف بين الصفحات.",
    whyEn: "Understand overall project health and urgency in 5 seconds.",
    actionAr: "بص على مؤشر صحة المشروع، وأقرب Milestone، والخطوات الموصى بها.",
    actionEn: "Review the 6-dimension health score, next milestone, and priority actions.",
    nextStepAr: "ادخل على «مهامي» أو «خارطة الطريق» عشان تبدأ التنفيذ الفعلي.",
    nextStepEn: "Jump to My Work or Roadmap to act on the top priorities.",
    linkedGuideId: "dashboard-command",
  },
  {
    id: "hint-my-work",
    route: "/my-work",
    titleAr: "مساحة شغلك الشخصي النهارده",
    titleEn: "Your Personal Daily Focus",
    whyAr: "بتجمعلك المهام، ملاحظات المشرف، وتكليفات الاجتماعات المطلوبة منك إنت بس.",
    whyEn: "Filters out noise and shows only tasks, feedback, and action items assigned to you.",
    actionAr: "ابدأ بالمهام المتأخرة أو اللي معادها خلال ٧ أيام، وعلّم على بنود الـ Checklist.",
    actionEn: "Tackle overdue or due-soon tasks first and update their checklists.",
    nextStepAr: "لما تخلص مهمة، انقلها لـ In Review من لوحة المهام عشان تتراجع.",
    nextStepEn: "Move completed items to In Review on the Tasks board.",
    linkedGuideId: "my-work-daily",
  },
  {
    id: "hint-roadmap",
    route: "/roadmap",
    titleAr: "خارطة الطريق والمحطات الكبرى",
    titleEn: "Academic Roadmap & Milestones",
    whyAr: "بتقسم سنة التخرج لـ ١٠ مراحل واضحة ومحطات تسليم (Milestones) ليها مواعيد محددة.",
    whyEn: "Structures the academic year into 10 phases and verifiable milestones.",
    actionAr: "اضغط على أي Milestone عشان ترفق ملفات الإثبات (Evidence) أو تطلب اعتماد المشرف.",
    actionEn: "Click any milestone to attach deliverable evidence or request supervisor sign-off.",
    nextStepAr: "اربط المهام اليومية بالـ Milestone الجاية عشان نسبة الإنجاز تتحرك تلقائيًا.",
    nextStepEn: "Link tasks to the upcoming milestone to track completion.",
    linkedGuideId: "roadmap-milestones",
  },
  {
    id: "hint-milestones",
    route: "/milestones",
    titleAr: "محطات التسليم والاعتماد الأكاديمي",
    titleEn: "Deliverable Milestones & Approvals",
    whyAr: "الـ Milestone هي محطة كبيرة في المشروع (زي الـ Proposal أو الـ SRS)، مش مجرد مهمة صغيرة.",
    whyEn: "Milestones represent major academic checkpoints requiring supervisor approval.",
    actionAr: "راجع شروط القبول لكل محطة، وارفق روابط أو ملفات الإثبات قبل طلب الاعتماد.",
    actionEn: "Verify acceptance criteria and attach evidence before requesting approval.",
    nextStepAr: "بعد اعتماد المشرف، المحطة بتتسجل Completed وبترفع مؤشر صحة المشروع.",
    nextStepEn: "Once approved by the supervisor, the milestone boosts project health.",
    linkedGuideId: "roadmap-milestones",
  },
  {
    id: "hint-tasks",
    route: "/tasks",
    titleAr: "لوحة تنفيذ المهام (Kanban & Table)",
    titleEn: "Task Execution & Workflow Board",
    whyAr: "هنا الشغل الحقيقي بيتحرك من فكرة في الـ Backlog لحد ما يتراجع ويبقى Done.",
    whyEn: "Move work transparently from Backlog through In Progress, In Review, and Done.",
    actionAr: "اضغط على أي مهمة عشان يفتحلك الدرج الجانبي (Side Drawer) وتعدل الـ Checklist والتعليقات من غير ما تخرج من اللوحة.",
    actionEn: "Click any task card to open the side drawer for checklists and comments.",
    nextStepAr: "لو مهمة واقفة على حاجة، حوّلها لـ Blocked واكتب السبب عشان الفريق ينتبه.",
    nextStepEn: "Mark blocked tasks with a clear reason so the team can unblock them.",
    linkedGuideId: "tasks-workflow",
  },
  {
    id: "hint-sprints",
    route: "/sprints",
    titleAr: "الدورات التنفيذية القصيرة (Sprints)",
    titleEn: "Focused Sprint Iterations",
    whyAr: "بدل ما المشروع كله يبقى قايمة مهام طويلة، الـ Sprint بتركز الفريق على هدف أسبوعين بس.",
    whyEn: "Groups short-term tasks into a 2-week iteration with a clear academic goal.",
    actionAr: "تابع نسبة إنجاز الدورة الحالية، وقارن النقاط المنجزة بالسعة المخططة للفريق.",
    actionEn: "Monitor active sprint completion rate against planned team capacity.",
    nextStepAr: "حرك مهام الـ Sprint الحالية في لوحة المهام لحد ما توصل ١٠٠٪.",
    nextStepEn: "Complete active sprint tasks on the Kanban board.",
    linkedGuideId: "sprints-execution",
  },
  {
    id: "hint-meetings",
    route: "/meetings",
    titleAr: "سجل الاجتماعات وتحويل التكليفات",
    titleEn: "Meetings & Action Item Conversion",
    whyAr: "عشان الكلام اللي بيتقال في اجتماع المشرف أو الفريق مايتنسيش تاني يوم.",
    whyEn: "Ensures supervisor and team discussions turn into tracked tasks.",
    actionAr: "افتح أي اجتماع، ضيف الـ Action Items، واضغط «تحويل لمهمة» عشان تنزل في لوحة المهام فورًا.",
    actionEn: "Open a meeting, log action items, and convert them to tasks in one click.",
    nextStepAr: "تابع المهام الناتجة عن الاجتماع في صفحة «مهامي» أو «المهام».",
    nextStepEn: "Track converted tasks directly on the Tasks board.",
    linkedGuideId: "meetings-workflow",
  },
  {
    id: "hint-feedback",
    route: "/feedback",
    titleAr: "صندوق ملاحظات المشرف الأكاديمي",
    titleEn: "Supervisor Feedback Loop",
    whyAr: "بيضمن إن كل ملاحظة من المشرف ليها مسؤول وحالة واضحة وماتضيعش وسط رسائل الواتساب.",
    whyEn: "Tracks every supervisor remark from open to resolved and officially verified.",
    actionAr: "افتح الملاحظة، عالج المطلوب، واضغط «تسجيل الحل» مع إرفاق رابط الدليل.",
    actionEn: "Resolve open feedback with a resolution note and evidence link.",
    nextStepAr: "المشرف هيراجع الحل ويضغط Verify عشان تقفل الملاحظة رسميًا.",
    nextStepEn: "The supervisor verifies the resolution to close the loop.",
    linkedGuideId: "supervisor-feedback",
  },
  {
    id: "hint-documents",
    route: "/documents",
    titleAr: "مستودع المستندات وتاريخ الإصدارات",
    titleEn: "Document Repository & SHA-256 Versions",
    whyAr: "بيقضي على فوضى final-final-v3 ويحفظ كل إصدار ببصمة رقمية SHA-256 غير قابلة للتعديل.",
    whyEn: "Maintains an immutable version history with cryptographic SHA-256 checksums.",
    actionAr: "اضغط على أي مستند عشان تشوف جدول الإصدارات، أو ترفع إصدار جديد، أو تعلّمه كمستند رسمي (Official).",
    actionEn: "Inspect version history, upload a new version, or mark as Official.",
    nextStepAr: "المستندات الرسمية دي هتستخدمها في ربط متطلبات «التسليمات» النهائية.",
    nextStepEn: "Link official document versions to your formal Submissions.",
    linkedGuideId: "documents-versioning",
  },
  {
    id: "hint-decisions",
    route: "/decisions",
    titleAr: "سجل القرارات الهندسية والمعمارية (ADR)",
    titleEn: "Architecture Decision Records (ADR)",
    whyAr: "في المناقشة النهائية اللجنة دايمًا بتسأل: «اشمعنى اخترتوا التكنولوجيا دي؟» — هنا الإجابة موثقة.",
    whyEn: "Documents why technical choices were made, including pros, cons, and alternatives.",
    actionAr: "سجّل أي قرار مهم (اختيار قاعدة بيانات، معمارية، تغيير Scope) مع البدائل وسبب الاختيار.",
    actionEn: "Record key decisions along with considered options and rationale.",
    nextStepAr: "راجع سجل القرارات قبل المناقشة عشان الفريق كله يرد بنفس الحجة الهندسية.",
    nextStepEn: "Review ADRs before your final defense Q&A.",
    linkedGuideId: "decisions-log",
  },
  {
    id: "hint-risks",
    route: "/risks",
    titleAr: "مصفوفة المخاطر والمشاكل الفعلية",
    titleEn: "5×5 Risk Matrix & Active Issues",
    whyAr: "لو في حاجة ممكن تعطل المشروع قدام، سجّلها Risk بدري قبل ما تتحول لـ Issue تعطل الفريق.",
    whyEn: "Proactively mitigate high-exposure risks before they materialize into blockers.",
    actionAr: "حدد الاحتمالية والأثر (١ لـ ٥) وخطة الوقاية، ولو حصلت مشكلة فعلية سجّلها في تبويب المشاكل.",
    actionEn: "Score probability and impact (1–5) and document mitigation plans.",
    nextStepAr: "المخاطر العالية بتسمّع مباشرة في «محرك صحة المشروع» للتنبيه المبكر.",
    nextStepEn: "High-exposure risks automatically feed into the Project Health Engine.",
    linkedGuideId: "risks-issues",
  },
  {
    id: "hint-analytics",
    route: "/analytics",
    titleAr: "تحليلات المساهمة وتوزيع المعرفة",
    titleEn: "Fair Contribution & Bus Factor Analytics",
    whyAr: "بيقيس مجهود كل عضو بناءً على المخرجات الفعلية الموثقة، ويكشف لو جزء كامل معتمد على شخص واحد بس.",
    whyEn: "Evaluates verified deliverables and highlights single-point-of-failure knowledge risks.",
    actionAr: "راجع تنبيهات تركز المعرفة (Bus Factor) وتوزيع المهام القادمة على أعضاء الفريق.",
    actionEn: "Check Bus Factor warnings and upcoming 14-day workload balance.",
    nextStepAr: "لو في مجال معتمد على شخص واحد، أشرك عضو تاني معاه في المهام الجاية.",
    nextStepEn: "Pair a second team member on areas with Bus Factor warnings.",
    linkedGuideId: "project-health",
  },
  {
    id: "hint-submissions",
    route: "/submissions",
    titleAr: "بوابة التسليمات ولقطة التجميد",
    titleEn: "Deliverable Submissions & Freeze Snapshot",
    whyAr: "عشان تضمنوا إن مفيش بند إلزامي ناقص قبل التسليم، وتقفلوا نسخة موثقة ببصمة SHA-256.",
    whyEn: "Validates mandatory deliverables and creates an immutable freeze snapshot.",
    actionAr: "كمّل بنود قائمة المتطلبات الإلزامية لحد ما الجاهزية توصل ١٠٠٪، وبعدين اضغط «تجميد الحزمة».",
    actionEn: "Complete all mandatory checklist items to reach 100%, then click Freeze Package.",
    nextStepAr: "بعد تجميد التسليم النهائي، انتقل لـ «مركز المناقشة النهائية» لترتيب العرض.",
    nextStepEn: "Proceed to the Defense Hub to prepare your jury presentation.",
    linkedGuideId: "submissions-freeze",
  },
  {
    id: "hint-defense",
    route: "/defense",
    titleAr: "غرفة عمليات المناقشة النهائية",
    titleEn: "Final Defense Command Center",
    whyAr: "قبل المناقشة، الصفحة دي بتبقى مركز التحكم الأخير للفريق عشان مفيش تفصيلة تفوتكم يوم العرض.",
    whyEn: "Coordinates speaker timing, demo backup plans, field checklists, and expected jury Q&A.",
    actionAr: "قسّم وقت العرض بالدقائق على المتحدثين، راجع قائمة فحص التجهيزات، وضيف الأسئلة المتوقعة وإجاباتها.",
    actionEn: "Assign speaker durations, verify the readiness checklist, and rehearse Q&A.",
    nextStepAr: "اضغط على «وضع العرض للجنة» من الشريط الجانبي لفتح شاشة العرض النقية يوم المناقشة.",
    nextStepEn: "Launch Jury Present Mode for a distraction-free presentation view.",
    linkedGuideId: "defense-readiness",
  },
];

/**
 * Complete Catalog of 14 Deep-Linkable Interactive Guides
 */
export const GUIDES_CATALOG: GuideDefinition[] = [
  // 1. FULL WORKFLOW END-TO-END TOUR
  {
    id: "full-workflow",
    deepLink: "guide://full-workflow",
    version: 1,
    category: "core",
    categoryLabelAr: "البداية الأساسية",
    categoryLabelEn: "Core Onboarding",
    titleAr: "رحلة المشروع كاملة (من الفكرة للمناقشة)",
    titleEn: "Full Project Lifecycle Journey (End-to-End)",
    summaryAr:
      "أهم جولة في النظام: بتوريك في ٣ دقايق إزاي التخطيط، المهام، الاجتماعات، ملاحظات المشرف، والتسليمات بيشتغلوا كدورة عمل واحدة مترابطة.",
    summaryEn:
      "The flagship tour: understand how planning, tasks, meetings, feedback, and defense work together as one connected loop.",
    estimatedMinutes: 3,
    startRoute: "/overview",
    roles: "ALL",
    keywords: ["رحلة المشروع", "دورة العمل", "البداية", "الصورة الكبيرة", "workflow", "overview", "شامل"],
    steps: [
      {
        id: "fw-1-overview",
        route: "/overview",
        target: "overview-health-engine",
        categoryAr: "١ من ٧ • مركز القيادة",
        categoryEn: "1 of 7 • Command Center",
        titleAr: "البداية دايمًا من لوحة القيادة (Overview)",
        titleEn: "Start from the Executive Overview",
        contentAr:
          "دي الصفحة اللي هترجع لها طول الوقت. منها تعرف المشروع وصل لفين، وهل ماشيين على الجدول ولا في حاجة متأخرة محتاجة تدخل، من غير ما تغرق في التفاصيل.",
        contentEn:
          "This is your daily command center. In 5 seconds, it shows project health, active phase, next milestone, and urgent actions.",
        whyItMattersAr:
          "المؤشر ده بيجمع ٦ أبعاد حقيقية (الجدول، المهام، ملاحظات المشرف، المخاطر، جاهزية التسليم، وتوازن الفريق).",
        nextLogicalStepAr: "تعالى نشوف إزاي الخطة الكبيرة بتتحط في خارطة الطريق.",
        nextButtonLabelAr: "ورّيني خارطة الطريق ←",
        placement: "bottom",
      },
      {
        id: "fw-2-roadmap",
        route: "/roadmap",
        target: "roadmap-phases-rail",
        categoryAr: "٢ من ٧ • التخطيط والمحطات",
        categoryEn: "2 of 7 • Roadmap & Milestones",
        titleAr: "بنقسّم السنة لمراحل ومحطات (Milestones)",
        titleEn: "Structure the Year into Phases & Milestones",
        contentAr:
          "هنا خطة المشروع متقسمة لمراحل متتابعة، وتحتها محطات رئيسية (Milestones) زي تسليم الـ Proposal أو الـ SRS. كل محطة ليها ميعاد وملفات إثبات واعتماد رسمي من المشرف.",
        contentEn:
          "Your project is structured into sequential academic phases and milestones with clear acceptance criteria and supervisor sign-offs.",
        whyItMattersAr:
          "الـ Milestone بتخلي الفريق كله عارف إيه الهدف الكبير اللي بنجري عليه الشهر ده.",
        nextLogicalStepAr: "دلوقتي نشوف إزاي المحطة دي بتتكسّر لمهام يومية.",
        nextButtonLabelAr: "ورّيني لوحة المهام ←",
        placement: "bottom",
      },
      {
        id: "fw-3-tasks",
        route: "/tasks",
        target: "tasks-board-columns",
        categoryAr: "٣ من ٧ • التنفيذ اليومي",
        categoryEn: "3 of 7 • Task Execution",
        titleAr: "بنحوّل المحطات لمهام (Tasks) واضحة المسؤولية",
        titleEn: "Turn Milestones into Actionable Tasks",
        contentAr:
          "في لوحة المهام، كل مهمة ليها مسؤول، أولوية، وقائمة فحص (Checklist). المهمة بتتحرك من Backlog لـ In Progress، ولما تخلص بتروح In Review قبل ما تبقى Done.",
        contentEn:
          "Every task has clear assignees, priorities, checklists, and dependencies moving across Kanban stages.",
        whyItMattersAr:
          "لو ضغطت على أي مهمة، هيفتحلك درج جانبي سريع تعدل منه كل حاجة من غير ما تخرج من اللوحة.",
        nextLogicalStepAr: "طب لما نجتمع مع المشرف أو الفريق، إيه اللي بيحصل؟",
        nextButtonLabelAr: "ورّيني الاجتماعات ←",
        placement: "top",
      },
      {
        id: "fw-4-meetings",
        route: "/meetings",
        target: "meetings-grid",
        categoryAr: "٤ من ٧ • الاجتماعات والقرارات",
        categoryEn: "4 of 7 • Meetings & Action Items",
        titleAr: "مخرجات الاجتماعات بتتحول لمهام بضغطة زر",
        titleEn: "Convert Meeting Action Items into Tasks",
        contentAr:
          "لما تسجل محضر اجتماع هنا، أي تكليف (Action Item) تقدر تحوله لمهمة فعلية بضغطة واحدة، فيفضل مربوط بالاجتماع اللي طلع منه ومفيش حاجة تتنسي.",
        contentEn:
          "Log meeting agendas and minutes, then convert action items directly into formal tasks with full traceability.",
        whyItMattersAr:
          "دي الحلقة اللي بتربط الكلام النظري في الاجتماعات بالتنفيذ الفعلي على لوحة المهام.",
        nextLogicalStepAr: "تعالى نشوف إزاي بنتابع ملاحظات المشرف الأكاديمي.",
        nextButtonLabelAr: "ورّيني ملاحظات المشرف ←",
        placement: "top",
      },
      {
        id: "fw-5-feedback",
        route: "/feedback",
        target: "feedback-list",
        categoryAr: "٥ من ٧ • الإشراف الأكاديمي",
        categoryEn: "5 of 7 • Supervisor Feedback",
        titleAr: "ملاحظات المشرف ليها دورة حل وتأكيد رسمية",
        titleEn: "Structured Supervisor Feedback Resolution",
        contentAr:
          "أي ملاحظة من المشرف بتتسجل هنا بدرجة أهميتها. المسؤول عنها بيعالجها ويرفق رابط الدليل، فبتتحول لـ Awaiting Verification لحد ما المشرف يراجعها ويأكدها.",
        contentEn:
          "Supervisor feedback stays tracked until the team submits resolution evidence and the supervisor verifies it.",
        whyItMattersAr:
          "الملاحظات الحرجة (Blocking) بتأثر على مؤشر صحة المشروع لحد ما تتعالج.",
        nextLogicalStepAr: "وبعد ما نجهز ملفاتنا، إزاي بنسلّم رسميًا؟",
        nextButtonLabelAr: "ورّيني بوابة التسليمات ←",
        placement: "top",
      },
      {
        id: "fw-6-submissions",
        route: "/submissions",
        target: "submissions-checklist",
        categoryAr: "٦ من ٧ • التسليم والتجميد",
        categoryEn: "6 of 7 • Submissions & Freeze",
        titleAr: "بنجمّد لقطة التسليم ببصمة SHA-256",
        titleEn: "Freeze Immutable Deliverable Snapshots",
        contentAr:
          "قبل أي تسليم رسمي، بتراجع قائمة المتطلبات الإلزامية هنا، ولما تكتمل ١٠٠٪ بتضغط «تجميد الحزمة (Freeze Snapshot)» عشان توثق نسخة غير قابلة للتعديل من كل ملفاتكم.",
        contentEn:
          "Verify mandatory submission requirements and freeze an immutable cryptographic snapshot of your deliverables.",
        whyItMattersAr:
          "لقطة التجميد بتحمي الفريق وتثبت للمشرف والقسم إيه الملفات اللي اتسلمت بالظبط وفي أي ثانية.",
        nextLogicalStepAr: "أخيرًا: محطة يوم المناقشة النهائية.",
        nextButtonLabelAr: "ورّيني غرفة المناقشة ←",
        placement: "top",
      },
      {
        id: "fw-7-defense",
        route: "/defense",
        target: "defense-hero",
        categoryAr: "٧ من ٧ • يوم المناقشة",
        categoryEn: "7 of 7 • Final Defense",
        titleAr: "غرفة عمليات المناقشة النهائية (Defense Mode)",
        titleEn: "Final Defense Command Center",
        contentAr:
          "هنا بتوزعوا دقائق العرض على كل عضو، وتجهزوا سيناريو الـ Demo وخطة الطوارئ، وتكتبوا الأسئلة المتوقعة من اللجنة وإجاباتها النموذجية، وتفتحوا «وضع العرض للجنة» يوم المناقشة.",
        contentEn:
          "Coordinate speaker timing, rehearsal checklists, backup plans, and jury Q&A in one dedicated command center.",
        whyItMattersAr:
          "بتربط مجهود السنة كلها بعرض منظم وواثق قدام لجنة التحكيم.",
        nextLogicalStepAr: "كده إنت أخدت الصورة الكاملة لدورة العمل في SVA-DUATE!",
        placement: "bottom",
      },
    ],
  },

  // 2. DASHBOARD COMMAND TOUR
  {
    id: "dashboard-command",
    deepLink: "guide://dashboard-command",
    version: 1,
    category: "core",
    categoryLabelAr: "البداية الأساسية",
    categoryLabelEn: "Core Onboarding",
    titleAr: "فهم لوحة القيادة (مركز التحكم)",
    titleEn: "Understanding the Executive Dashboard",
    summaryAr:
      "اعرف إزاي تقرأ مؤشر صحة المشروع، وتراقب أقرب Milestone، وتنفذ الخطوات العاجلة في أقل من دقيقة.",
    summaryEn:
      "Learn how to read the 6-dimension health radar, monitor the next milestone, and act on priority recommendations.",
    estimatedMinutes: 2,
    startRoute: "/overview",
    roles: "ALL",
    keywords: ["dashboard", "overview", "لوحة القيادة", "نظرة عامة", "صحة المشروع", "مركز التحكم"],
    steps: [
      {
        id: "dc-1-pulse",
        route: "/overview",
        target: "overview-pulse-strip",
        categoryAr: "لوحة القيادة",
        categoryEn: "Dashboard",
        titleAr: "نبض المشروع في ٥ ثواني",
        titleEn: "5-Second Project Pulse",
        contentAr:
          "الشريط ده بيديك الملخص السريع: إنتو في أنهي مرحلة دلوقتي، فاضل كام يوم على أقرب Milestone، كام ملاحظة مشرف مفتوحة، وكام مهمة مطلوبة منك في الـ Sprint الحالية.",
        contentEn:
          "Get an instant pulse on the active phase, days remaining to the next milestone, open supervisor feedback, and your sprint tasks.",
        getDynamicContentAr: (m) =>
          `الشريط ده بيديك الملخص الفوري لمشروعك دلوقتي: عندك حاليًا ${m.myTasksCount} مهام نشطة مسندة ليك، و${m.openFeedbackCount} ملاحظات مشرف مفتوحة، ومؤشر الصحة العام ${m.healthScore}/100.`,
        placement: "bottom",
      },
      {
        id: "dc-2-milestone",
        route: "/overview",
        target: "overview-next-milestone",
        categoryAr: "لوحة القيادة",
        categoryEn: "Dashboard",
        titleAr: "أقرب محطة مهمة (Next Milestone)",
        titleEn: "Next Major Milestone",
        contentAr:
          "دي أقرب محطة كبيرة في المشروع. خلي عينك عليها دايمًا لأن معظم شغل الفريق في الفترة دي المفروض يتحرك ناحيتها عشان تتسلم في ميعادها.",
        contentEn:
          "Keep your eye on the nearest milestone—most of the team's current tasks should drive toward completing it on time.",
        placement: "bottom",
      },
      {
        id: "dc-3-health",
        route: "/overview",
        target: "overview-health-engine",
        categoryAr: "لوحة القيادة",
        categoryEn: "Dashboard",
        titleAr: "مؤشر صحة المشروع القابل للتفسير",
        titleEn: "Explainable 6-Dimension Health Engine",
        contentAr:
          "المؤشر ده بيلخّص حالة المشروع كلها، مش مجرد نسبة إنجاز. وتحت الرقم هتلاقي النظام بيقولك بالظبط إيه نقاط القوة وإيه التنبيهات اللي منزلّة المؤشر عشان تعالجها.",
        contentEn:
          "This score synthesizes schedule, tasks, feedback, risks, readiness, and workload—and explains the exact drivers below.",
        actionPromptAr: "تقدر تضغط على زر «تحديث مؤشر الصحة» فوق لإعادة حساب المؤشر فورًا لو حبيت.",
        waitForAction: "health.recomputed",
        successFeedbackAr: "تمام! المؤشر اتحسب من جديد بناءً على آخر بيانات المشروع.",
        placement: "top",
      },
      {
        id: "dc-4-actions",
        route: "/overview",
        target: "overview-priority-actions",
        categoryAr: "لوحة القيادة",
        categoryEn: "Dashboard",
        titleAr: "الخطوات التنفيذية الموصى بها",
        titleEn: "Priority Recommended Actions",
        contentAr:
          "بدل ما تسأل «أعمل إيه دلوقتي؟»، الجزء ده بيجمعلك أهم إجراءات عملية مرتبة حسب الأولوية، وكل خطوة بتوديك لصفحتها مباشرة.",
        contentEn:
          "Ranked action links that take you straight to the screen needing attention right now.",
        placement: "left",
      },
      {
        id: "dc-5-mywork",
        route: "/overview",
        target: "overview-my-work",
        categoryAr: "لوحة القيادة",
        categoryEn: "Dashboard",
        titleAr: "مهامك الشخصية ومواعيدك",
        titleEn: "Your Personal Work Queue",
        contentAr:
          "بدل ما تدور في المشروع كله، الجزء ده بيجمع كل اللي مطلوب منك إنت شخصيًا مع أقرب الاجتماعات المجدولة.",
        contentEn:
          "Shows the tasks assigned specifically to you alongside upcoming scheduled meetings.",
        placement: "top",
      },
    ],
  },

  // 3. MY WORK DAILY TOUR
  {
    id: "my-work-daily",
    deepLink: "guide://my-work-daily",
    version: 1,
    category: "core",
    categoryLabelAr: "البداية الأساسية",
    categoryLabelEn: "Core Onboarding",
    titleAr: "شغلك اليومي من غير تشتت (My Work)",
    titleEn: "Your Daily Execution Workspace (My Work)",
    summaryAr:
      "إزاي تتابع مهامك المسندة، تعالج ملاحظات المشرف اللي تخصك، وتخلص تكليفات الاجتماعات أول بأول.",
    summaryEn:
      "How to focus on your assigned tasks, personal supervisor feedback, and meeting action items.",
    estimatedMinutes: 1,
    startRoute: "/my-work",
    roles: ["STUDENT", "TEAM_LEADER", "USER"],
    keywords: ["مهامي", "شغلي", "اليومي", "my work", "today"],
    steps: [
      {
        id: "mw-1-kpis",
        route: "/my-work",
        target: "mywork-kpi-strip",
        categoryAr: "مهامي اليوم",
        categoryEn: "My Work",
        titleAr: "ملخص مسؤولياتك الشخصية",
        titleEn: "Your Personal Responsibility Strip",
        contentAr:
          "من هنا هتقدر تتابع كل اللي مطلوب منك النهارده من غير ما تلف بين أكتر من صفحة: إجمالي مهامك، المتأخر أو المعطل منها، اللي يستحق خلال أسبوع، وملاحظات المشرف اللي مستنية حلك.",
        contentEn:
          "See your active tasks, overdue/blocked items, tasks due within 7 days, and pending supervisor feedback at a glance.",
        placement: "bottom",
      },
      {
        id: "mw-2-tasks",
        route: "/my-work",
        target: "mywork-tasks-list",
        categoryAr: "مهامي اليوم",
        categoryEn: "My Work",
        titleAr: "قائمة مهامك مرتبة بالأولوية",
        titleEn: "Prioritized Assigned Tasks",
        contentAr:
          "كل مهمة هنا موضح جنبها هي تبع أنهي Sprint وأنهي Milestone، وكام بند خلص من الـ Checklist بتاعتها.",
        contentEn:
          "Each task card shows its linked sprint, milestone, priority badge, and checklist progress.",
        placement: "top",
      },
      {
        id: "mw-3-side",
        route: "/my-work",
        target: "mywork-feedback-side",
        categoryAr: "مهامي اليوم",
        categoryEn: "My Work",
        titleAr: "ملاحظات المشرف وتكليفات الاجتماعات",
        titleEn: "Supervisor Feedback & Meeting Actions",
        contentAr:
          "العمود الجانبي ده بيفكرك بأي ملاحظة من المشرف أو Action Item من اجتماع لسه مفتوحة باسمك عشان تقفلها قبل الاجتماع الجاي.",
        contentEn:
          "Keeps supervisor remarks and meeting action items assigned to you visible until resolved.",
        placement: "left",
      },
    ],
  },

  // 4. ROADMAP & MILESTONES TOUR
  {
    id: "roadmap-milestones",
    deepLink: "guide://roadmap-milestones",
    version: 1,
    category: "planning",
    categoryLabelAr: "التخطيط والتنفيذ",
    categoryLabelEn: "Planning & Execution",
    titleAr: "خارطة الطريق والمحطات (Roadmap & Milestones)",
    titleEn: "Roadmap, Phases & Milestone Approvals",
    summaryAr:
      "اعرف الفرق بين المهمة والـ Milestone، وإزاي ترفق أدلة الإنجاز وتاخد اعتماد المشرف الرسمي.",
    summaryEn:
      "Understand the difference between tasks and milestones, attach evidence, and request supervisor approval.",
    estimatedMinutes: 2,
    startRoute: "/roadmap",
    roles: "ALL",
    keywords: ["roadmap", "milestones", "خارطة الطريق", "المحطات", "اعتماد المشرف", "مراحل"],
    steps: [
      {
        id: "rm-1-rail",
        route: "/roadmap",
        target: "roadmap-phases-rail",
        categoryAr: "خارطة الطريق",
        categoryEn: "Roadmap",
        titleAr: "شريط المراحل الأكاديمية",
        titleEn: "Academic Phases Timeline Rail",
        contentAr:
          "الشريط ده بيوضح مراحل مشروع التخرج بالترتيب: إيه اللي خلص باللون الأخضر، وإيه المرحلة اللي شغالين فيها دلوقتي، وإيه المراحل الجاية.",
        contentEn:
          "Visualizes completed, active, and upcoming academic phases across your graduation year.",
        placement: "bottom",
      },
      {
        id: "rm-2-diff",
        route: "/roadmap",
        target: "roadmap-milestones-list",
        categoryAr: "خارطة الطريق",
        categoryEn: "Roadmap",
        titleAr: "الفرق بين المهمة والـ Milestone",
        titleEn: "Task vs. Milestone",
        contentAr:
          "المهمة (Task) حاجة بننجزها في أيام، لكن الـ Milestone محطة كبيرة في المشروع زي تسليم الـ Proposal أو الـ Architecture أو النسخة النهائية، وبتحتاج اعتماد من المشرف.",
        contentEn:
          "A Task is a unit of work; a Milestone is a major academic checkpoint requiring evidence and supervisor sign-off.",
        actionPromptAr: "جرّب تضغط على أي بطاقة Milestone قدامك عشان تفتح تفاصيلها وتشوف الأدلة المرفقة.",
        waitForAction: "milestone.selected",
        successFeedbackAr: "ممتاز! من نافذة المحطة دي تقدر ترفق رابط الدليل أو تطلب اعتماد المشرف.",
        placement: "top",
      },
      {
        id: "rm-3-approval",
        route: "/roadmap",
        target: "roadmap-milestones-list",
        categoryAr: "خارطة الطريق",
        categoryEn: "Roadmap",
        titleAr: "دورة اعتماد المحطة (Evidence → Approval)",
        titleEn: "Evidence & Supervisor Sign-Off",
        contentAr:
          "لما الفريق يخلص مهام المحطة ويرفق ملف الإثبات (Evidence)، قائد الفريق بيطلب الاعتماد، وساعتها المشرف بيراجع ويضغط Approve أو يطلب تعديلات واضحة.",
        contentEn:
          "Attach deliverable evidence, request approval, and let the supervisor officially approve or request changes.",
        placement: "top",
      },
    ],
  },

  // 5. TASKS WORKFLOW TOUR
  {
    id: "tasks-workflow",
    deepLink: "guide://tasks-workflow",
    version: 1,
    category: "planning",
    categoryLabelAr: "التخطيط والتنفيذ",
    categoryLabelEn: "Planning & Execution",
    titleAr: "إدارة المهام ودورة التنفيذ (Tasks & Kanban)",
    titleEn: "Task Management, Checklists & Kanban Flow",
    summaryAr:
      "اتعلم دورة حياة المهمة من الـ Backlog لـ Done، وإزاي تستخدم الدرج الجانبي والـ Checklist والتراجع الفوري.",
    summaryEn:
      "Master the task lifecycle from Backlog to Done, side-drawer checklists, dependencies, and instant undo.",
    estimatedMinutes: 2,
    startRoute: "/tasks",
    roles: "ALL",
    keywords: ["tasks", "kanban", "المهام", "كانبان", "checklist", "blocked", "إضافة مهمة"],
    steps: [
      {
        id: "tk-1-filters",
        route: "/tasks",
        target: "tasks-filter-bar",
        categoryAr: "إدارة المهام",
        categoryEn: "Tasks",
        titleAr: "تبديل العرض والتصفية السريعة",
        titleEn: "Board/Table Switch & Instant Filters",
        contentAr:
          "من الشريط ده تقدر تبدّل بين عرض اللوحة (Kanban Board) وعرض الجدول (Table)، أو تفلتر المهام باسم عضو معين أو حسب الأولوية والحالة.",
        contentEn:
          "Switch seamlessly between Kanban Board and Table views, or filter by assignee, priority, and status.",
        placement: "bottom",
      },
      {
        id: "tk-2-create",
        route: "/tasks",
        target: "tasks-create-btn",
        categoryAr: "إدارة المهام",
        categoryEn: "Tasks",
        titleAr: "إضافة مهمة جديدة للفريق",
        titleEn: "Creating a New Task",
        contentAr:
          "لما تضيف مهمة، حدد عنوانها، أولويتها (Critical / High / Medium / Low)، ومين المسؤول عنها، واربطها بالـ Sprint والـ Milestone المناسبة.",
        contentEn:
          "Define task title, priority, estimate points, due date, sprint, milestone, and assignees.",
        getDynamicContentAr: (m) =>
          m.tasksCount > 0
            ? `عندكم حاليًا ${m.tasksCount} مهمة مسجلة في المشروع. من الزر ده تقدر تضيف أي مهمة جديدة وتربطها بالـ Sprint أو الـ Milestone.`
            : "لسه مفيش مهام؟ من الزر ده تقدر تضيف أول مهمة للفريق وتحدد المسؤول عنها وموعدها.",
        actionPromptAr: "جرّب دلوقتي تضغط على زر «مهمة جديدة» أو تضغط على أي بطاقة مهمة في اللوحة.",
        waitForAction: "task.selected",
        successFeedbackAr: "تمام جدًا! كده فتحت تفاصيل المهمة بنجاح.",
        placement: "bottom",
      },
      {
        id: "tk-3-columns",
        route: "/tasks",
        target: "tasks-board-columns",
        categoryAr: "إدارة المهام",
        categoryEn: "Tasks",
        titleAr: "دورة حياة المهمة وحالة التعطيل (Blocked)",
        titleEn: "Task Lifecycle & Blocked Reason",
        contentAr:
          "المهمة بتمشي في خط واضح: Backlog ← Ready ← In Progress ← In Review ← Done. ولو المهمة واقفة على حاجة، حوّلها لـ Blocked وهيسألك النظام عن السبب عشان يتسجل بوضوح.",
        contentEn:
          "Move tasks across columns. Moving to Blocked prompts for a mandatory reason so blockers are never hidden.",
        whyItMattersAr:
          "لما تغير حالة أي مهمة، بيظهرلك إشعار فيه زر «تراجع (Undo)» لو غيرتها بالغلط.",
        placement: "top",
      },
    ],
  },

  // 6. SPRINTS EXECUTION TOUR
  {
    id: "sprints-execution",
    deepLink: "guide://sprints-execution",
    version: 1,
    category: "planning",
    categoryLabelAr: "التخطيط والتنفيذ",
    categoryLabelEn: "Planning & Execution",
    titleAr: "الدورات القصيرة (Sprints & Iterations)",
    titleEn: "Short-Term Sprint Execution",
    summaryAr:
      "إزاي تقسموا شغل المشروع لدورات قصيرة ليها هدف محدد وسعة واضحة.",
    summaryEn:
      "How to organize tasks into time-boxed sprints with clear goals and capacity tracking.",
    estimatedMinutes: 1,
    startRoute: "/sprints",
    roles: "ALL",
    keywords: ["sprints", "الدورات", "سبرينت", "سرعة الفريق", "capacity"],
    steps: [
      {
        id: "sp-1-active",
        route: "/sprints",
        target: "sprints-active-card",
        categoryAr: "الدورات التنفيذية",
        categoryEn: "Sprints",
        titleAr: "الدورة الحالية النشطة (Active Sprint)",
        titleEn: "Active Sprint Focus",
        contentAr:
          "الـ Sprint بتجمع شغل أسبوعين في هدف واضح ومحدد، بدل ما المشروع كله يبقى قايمة مهام مفتوحة. هنا بتشوف نسبة إنجاز الدورة الحالية والمهام الباقية فيها.",
        contentEn:
          "Focuses the team on a 2-week goal, showing completion percentage, planned capacity, and active sprint tasks.",
        placement: "bottom",
      },
    ],
  },

  // 7. MEETINGS WORKFLOW TOUR
  {
    id: "meetings-workflow",
    deepLink: "guide://meetings-workflow",
    version: 1,
    category: "academic",
    categoryLabelAr: "الإشراف والاجتماعات",
    categoryLabelEn: "Academic Supervision",
    titleAr: "الاجتماعات وتحويل التكليفات لمهام",
    titleEn: "Meetings, Minutes & Task Conversion",
    summaryAr:
      "إزاي تسجل محضر الاجتماع وتحوّل الـ Action Items لمهام فعلية مربوطة بمسؤول.",
    summaryEn:
      "Schedule meetings, record minutes, and convert action items into tracked tasks in one click.",
    estimatedMinutes: 2,
    startRoute: "/meetings",
    roles: "ALL",
    keywords: ["meetings", "الاجتماعات", "محضر", "action items", "تكليفات"],
    steps: [
      {
        id: "mt-1-create",
        route: "/meetings",
        target: "meetings-create-btn",
        categoryAr: "الاجتماعات",
        categoryEn: "Meetings",
        titleAr: "جدولة اجتماع فريق أو مشرف",
        titleEn: "Schedule Team or Supervisor Meetings",
        contentAr:
          "قبل الاجتماع، سجّله هنا وحدد نوعه (اجتماع مع المشرف أو اجتماع داخلي للفريق)، وميعاده، وجدول الأعمال (Agenda) عشان الكل يدخل مستعد.",
        contentEn:
          "Log upcoming supervisor or team meetings with a clear agenda, duration, and location.",
        placement: "bottom",
      },
      {
        id: "mt-2-convert",
        route: "/meetings",
        target: "meetings-grid",
        categoryAr: "الاجتماعات",
        categoryEn: "Meetings",
        titleAr: "حوّل الـ Action Items لمهام بضغطة واحدة",
        titleEn: "One-Click Action Item to Task Conversion",
        contentAr:
          "ماتخليش الـ Action Item تفضل مجرد جملة في محضر الاجتماع. افتح الاجتماع، ضيف التكليفات، واضغط «تحويل لمهمة» عشان تتسجل في لوحة المهام باسم المسؤول عنها.",
        contentEn:
          "Click any meeting card to view minutes, add action items, and convert them directly into formal tasks.",
        placement: "top",
      },
    ],
  },

  // 8. SUPERVISOR FEEDBACK TOUR
  {
    id: "supervisor-feedback",
    deepLink: "guide://supervisor-feedback",
    version: 1,
    category: "academic",
    categoryLabelAr: "الإشراف والاجتماعات",
    categoryLabelEn: "Academic Supervision",
    titleAr: "دورة ملاحظات المشرف الأكاديمي",
    titleEn: "Supervisor Feedback & Verification Workflow",
    summaryAr:
      "من لحظة تسجيل المشرف للملاحظة لحد معالجتها وإرفاق الدليل وتأكيد المشرف الرسمي.",
    summaryEn:
      "Follow the complete loop from supervisor remark to team resolution, evidence link, and verification.",
    estimatedMinutes: 2,
    startRoute: "/feedback",
    roles: "ALL",
    keywords: ["feedback", "ملاحظات المشرف", "تعديلات", "اعتماد", "verify"],
    steps: [
      {
        id: "fb-1-filters",
        route: "/feedback",
        target: "feedback-filter-bar",
        categoryAr: "ملاحظات المشرف",
        categoryEn: "Supervisor Feedback",
        titleAr: "فرز الملاحظات حسب الخطورة والحالة",
        titleEn: "Filter by Severity & Status",
        contentAr:
          "أي ملاحظة من المشرف لازم يبقى ليها مسؤول وحالة واضحة. الملاحظات اللي واخدة تصنيف BLOCKING معناها إنها حرجة ولازم تتعالج قبل التسليم الجاي.",
        contentEn:
          "Filter remarks by status or severity. BLOCKING feedback must be resolved before freezing a submission.",
        placement: "bottom",
      },
      {
        id: "fb-2-loop",
        route: "/feedback",
        target: "feedback-list",
        categoryAr: "ملاحظات المشرف",
        categoryEn: "Supervisor Feedback",
        titleAr: "دورة المعالجة وإرفاق الدليل (Resolve → Verify)",
        titleEn: "Resolution & Supervisor Verification",
        contentAr:
          "اضغط على أي ملاحظة عشان تشوف تفاصيلها. لما الفريق يخلص التعديل، بيكتب ملخص الحل ويرفق رابط الدليل، فبتتحول لـ Awaiting Verification لحد ما المشرف يأكدها.",
        contentEn:
          "Click any feedback card to submit a resolution note and evidence URL, moving it to Awaiting Verification.",
        actionPromptAr: "جرّب تضغط على أي بطاقة ملاحظة في القائمة لعرض تفاصيلها وسجل حالتها.",
        waitForAction: "feedback.selected",
        successFeedbackAr: "ممتاز! من هنا بتتم دورة الحل والتأكيد بين الفريق والمشرف.",
        placement: "top",
      },
    ],
  },

  // 9. DOCUMENTS & VERSIONING TOUR
  {
    id: "documents-versioning",
    deepLink: "guide://documents-versioning",
    version: 1,
    category: "governance",
    categoryLabelAr: "الوثائق والحوكمة",
    categoryLabelEn: "Documents & Governance",
    titleAr: "المستندات وإدارة الإصدارات (SHA-256)",
    titleEn: "Documents & Immutable Version History",
    summaryAr:
      "إزاي تنظم ملفات المشروع حسب التصنيف وتحفظ تاريخ كل النسخ ببصمة رقمية SHA-256.",
    summaryEn:
      "Organize deliverables by category, upload immutable versions, and mark official documents.",
    estimatedMinutes: 2,
    startRoute: "/documents",
    roles: "ALL",
    keywords: ["documents", "المستندات", "ملفات", "إصدارات", "versions", "sha256", "تقرير"],
    steps: [
      {
        id: "doc-1-cats",
        route: "/documents",
        target: "documents-categories",
        categoryAr: "المستندات والملفات",
        categoryEn: "Documents",
        titleAr: "تصنيفات هندسية وأكاديمية واضحة",
        titleEn: "Structured Academic Categories",
        contentAr:
          "كل ملف في المشروع بيتصنف بوضوح (Proposal, SRS, Architecture, Database, Report, Presentation) عشان توصل لأي ملف في ثانية.",
        contentEn:
          "Filter documents across standard academic categories from Proposal and SRS to Final Report.",
        placement: "bottom",
      },
      {
        id: "doc-2-versions",
        route: "/documents",
        target: "documents-grid",
        categoryAr: "المستندات والملفات",
        categoryEn: "Documents",
        titleAr: "وداعًا لفوضى final-final-v3",
        titleEn: "Immutable Version History & Official Badge",
        contentAr:
          "بدل ما يبقى عندكم ١٠ ملفات بأسماء ملخبطة، كل مستند هنا بيحتفظ بجدول إصداراته (v1, v2, v3) مع بصمة SHA-256، وتقدر تميّزه كـ «مستند رسمي (Official)».",
        contentEn:
          "Click any document to inspect its immutable version history, upload a new version, or toggle its Official badge.",
        actionPromptAr: "اضغط على أي مستند قدامك عشان تشوف جدول الإصدارات وبصمات SHA-256.",
        waitForAction: "document.selected",
        successFeedbackAr: "هايل! من النافذة دي تقدر ترفع إصدار جديد أو تعتمد المستند كملف رسمي.",
        placement: "top",
      },
    ],
  },

  // 10. DECISIONS LOG TOUR
  {
    id: "decisions-log",
    deepLink: "guide://decisions-log",
    version: 1,
    category: "governance",
    categoryLabelAr: "الوثائق والحوكمة",
    categoryLabelEn: "Documents & Governance",
    titleAr: "سجل القرارات الهندسية (Decisions / ADR)",
    titleEn: "Engineering Decisions Log (ADRs)",
    summaryAr:
      "توثيق القرارات التقنية والمعمارية والبدائل اللي درستوها عشان تكون مرجعكم وقت المناقشة.",
    summaryEn:
      "Document architectural decisions, options considered, and rationale with immutable revision history.",
    estimatedMinutes: 1,
    startRoute: "/decisions",
    roles: "ALL",
    keywords: ["decisions", "القرارات", "adr", "معمارية", "بدائل"],
    steps: [
      {
        id: "dec-1-why",
        route: "/decisions",
        target: "decisions-create-btn",
        categoryAr: "سجل القرارات",
        categoryEn: "Decisions Log",
        titleAr: "ليه بنسجل القرارات الهندسية؟",
        titleEn: "Why Record Engineering Decisions?",
        contentAr:
          "لو الفريق قرر يغير Technology أو قاعدة بيانات أو طريقة تنفيذ، سجّل القرار هنا وسببه والبدائل اللي قارنتوا بينها. بعد شهرين مش هتحتاجوا تفتكروا مين قال إيه وليه.",
        contentEn:
          "Record the context, alternatives, and rationale whenever your team makes an architectural or scope decision.",
        placement: "bottom",
      },
      {
        id: "dec-2-grid",
        route: "/decisions",
        target: "decisions-grid",
        categoryAr: "سجل القرارات",
        categoryEn: "Decisions Log",
        titleAr: "سجل المراجعات والبدائل المدروسة",
        titleEn: "Options & Immutable Revision Trail",
        contentAr:
          "اضغط على أي قرار عشان تشوف الخيارات اللي اتدرست (المميزات والعيوب) وسجل التعديلات التاريخي غير القابل للحذف.",
        contentEn:
          "Click any ADR card to view its pros/cons options and append-only revision history.",
        placement: "top",
      },
    ],
  },

  // 11. RISKS & ISSUES TOUR
  {
    id: "risks-issues",
    deepLink: "guide://risks-issues",
    version: 1,
    category: "governance",
    categoryLabelAr: "الوثائق والحوكمة",
    categoryLabelEn: "Documents & Governance",
    titleAr: "الفرق بين المخاطر والمشاكل (5×5 Matrix)",
    titleEn: "Risks vs. Issues & 5×5 Exposure Matrix",
    summaryAr:
      "إزاي تكتشف المخاطر المحتملة بدري وتحطلها خطة وقاية، وإزاي تتعامل مع المشاكل الحرجة.",
    summaryEn:
      "Distinguish potential risks from active issues and assess exposure on the 5×5 matrix.",
    estimatedMinutes: 2,
    startRoute: "/risks",
    roles: "ALL",
    keywords: ["risks", "issues", "المخاطر", "المشاكل", "مصفوفة", "blocker"],
    steps: [
      {
        id: "rk-1-tabs",
        route: "/risks",
        target: "risks-tabs",
        categoryAr: "المخاطر والمشاكل",
        categoryEn: "Risks & Issues",
        titleAr: "الفرق بين الـ Risk والـ Issue",
        titleEn: "Risk vs. Issue",
        contentAr:
          "الـ Risk هي حاجة متوقعة ممكن تحصل قدام (زي تأخر حساس IoT أو صعوبة API) فبنحطلها خطة وقاية، إنما الـ Issue هي مشكلة حصلت فعلًا ومعطلة الشغل دلوقتي.",
        contentEn:
          "A Risk is a potential future threat with a mitigation plan; an Issue is an active problem happening right now.",
        placement: "bottom",
      },
      {
        id: "rk-2-matrix",
        route: "/risks",
        target: "risks-matrix",
        categoryAr: "المخاطر والمشاكل",
        categoryEn: "Risks & Issues",
        titleAr: "مصفوفة التقييم ٥×٥ وخطط الاستجابة",
        titleEn: "5×5 Probability × Impact Matrix",
        contentAr:
          "كل خطر بيتقيم من ١ لـ ٥ في الاحتمالية والأثر. المخاطر اللي بتطلع فوق ١٥ بتظهر باللون الأحمر وبتنبه الفريق في مؤشر صحة المشروع عشان تتحركوا قبل ما تتفاقم.",
        contentEn:
          "Exposure equals Probability × Impact (out of 25). High-exposure risks automatically alert the Project Health Engine.",
        placement: "top",
      },
    ],
  },

  // 12. PROJECT HEALTH & ANALYTICS TOUR
  {
    id: "project-health",
    deepLink: "guide://project-health",
    version: 1,
    category: "governance",
    categoryLabelAr: "الوثائق والحوكمة",
    categoryLabelEn: "Documents & Governance",
    titleAr: "محرك صحة المشروع وتحليلات المساهمة",
    titleEn: "Project Health & Fair Contribution Analytics",
    summaryAr:
      "افهم إزاي النظام بيحسب مؤشر الصحة من ٦ أبعاد، وإزاي بيقيس مساهمة الفريق بعدالة ويكشف الـ Bus Factor.",
    summaryEn:
      "Understand the 6-dimension health algorithm, evidence-based contribution scoring, and Bus Factor warnings.",
    estimatedMinutes: 2,
    startRoute: "/analytics",
    roles: "ALL",
    keywords: ["analytics", "health", "التحليلات", "المساهمة", "bus factor", "صحة المشروع"],
    steps: [
      {
        id: "ph-1-kpis",
        route: "/analytics",
        target: "analytics-kpi-strip",
        categoryAr: "التحليلات والمساهمة",
        categoryEn: "Analytics",
        titleAr: "تقييم مبني على المخرجات الحقيقية مش الشكل",
        titleEn: "Evidence-Based Contribution Scoring",
        contentAr:
          "النظام هنا مش بيعد مين فتح الموقع كام ساعة؛ هو بيحسب المخرجات الموثقة فعلًا: مهام خلصت، إصدارات ملفات اترفعت، قرارات اتكتبت، وملاحظات مشرف اتعالجت.",
        contentEn:
          "Contribution is measured strictly by verified deliverables: completed tasks, document versions, ADRs, and resolved feedback.",
        placement: "bottom",
      },
      {
        id: "ph-2-busfactor",
        route: "/analytics",
        target: "analytics-bus-factor",
        categoryAr: "التحليلات والمساهمة",
        categoryEn: "Analytics",
        titleAr: "تنبيهات تركز المعرفة (Bus Factor Risk)",
        titleEn: "Bus Factor Knowledge Warnings",
        contentAr:
          "لو في مجال كامل في المشروع (زي الـ Database أو الـ IoT) كل مهامه خلصها شخص واحد بس، النظام بينبهكم هنا عشان تشاركوا عضو تاني معاه ومايبقاش المشروع في خطر لو العضو ده غاب يوم المناقشة.",
        contentEn:
          "Alerts the team when an entire technical area relies on a single person, helping you cross-train before defense day.",
        placement: "top",
      },
    ],
  },

  // 13. SUBMISSIONS & FREEZE TOUR
  {
    id: "submissions-freeze",
    deepLink: "guide://submissions-freeze",
    version: 1,
    category: "delivery",
    categoryLabelAr: "التسليم والمناقشة",
    categoryLabelEn: "Submission & Defense",
    titleAr: "التسليمات ولقطة التجميد (Freeze Snapshot)",
    titleEn: "Deliverable Submissions & Cryptographic Freeze",
    summaryAr:
      "دورة تجهيز حزمة التسليم، مراجعة البنود الإلزامية، وتوليد لقطة التجميد غير القابلة للتعديل.",
    summaryEn:
      "Prepare deliverable packages, verify mandatory requirements, and freeze immutable SHA-256 snapshots.",
    estimatedMinutes: 2,
    startRoute: "/submissions",
    roles: "ALL",
    keywords: ["submissions", "freeze", "التسليمات", "تجميد", "snapshot", "تسليم نهائي"],
    steps: [
      {
        id: "sub-1-header",
        route: "/submissions",
        target: "submissions-header",
        categoryAr: "بوابة التسليمات",
        categoryEn: "Submissions",
        titleAr: "إدارة حزم التسليم الرسمية",
        titleEn: "Official Deliverable Packages",
        contentAr:
          "هنا بتجهزوا كل تسليم رسمي مطلوب منكم طول السنة (زي تسليم الترم الأول أو التسليم النهائي للمناقشة) مع متابعة نسبة الجاهزية.",
        contentEn:
          "Select or create deliverable packages and monitor readiness percentage against the deadline.",
        placement: "bottom",
      },
      {
        id: "sub-2-checklist",
        route: "/submissions",
        target: "submissions-checklist",
        categoryAr: "بوابة التسليمات",
        categoryEn: "Submissions",
        titleAr: "قائمة المتطلبات الإلزامية (Mandatory Checklist)",
        titleEn: "Mandatory Deliverable Checklist",
        contentAr:
          "النظام مش بيسمح بتجميد التسليم غير لما كل البنود اللي واخدة شارة «إلزامي» تكتمل ١٠٠٪، عشان مفيش فريق ينسى يرفق التقرير أو العرض أو رابط الكود.",
        contentEn:
          "All mandatory requirements must be marked complete before the Freeze Snapshot button unlocks.",
        placement: "top",
      },
      {
        id: "sub-3-snapshots",
        route: "/submissions",
        target: "submissions-snapshots",
        categoryAr: "بوابة التسليمات",
        categoryEn: "Submissions",
        titleAr: "لقطة التجميد غير القابلة للتعديل (Freeze Snapshot)",
        titleEn: "Immutable Freeze Snapshots",
        contentAr:
          "أول ما قائد الفريق يضغط «تجميد الحزمة»، النظام بياخد Snapshot مختومة ببصمات SHA-256 لكل الملفات ويقفل التعديل. ولو احتجتوا تعديل ضروري، المشرف الأكاديمي بس هو اللي يقدر يفك التجميد بذكر السبب.",
        contentEn:
          "Freezing generates a numbered snapshot with SHA-256 checksums. Only the Academic Supervisor can authorize unfreezing.",
        placement: "top",
      },
    ],
  },

  // 14. DEFENSE READINESS TOUR
  {
    id: "defense-readiness",
    deepLink: "guide://defense-readiness",
    version: 1,
    category: "delivery",
    categoryLabelAr: "التسليم والمناقشة",
    categoryLabelEn: "Submission & Defense",
    titleAr: "غرفة عمليات المناقشة النهائية",
    titleEn: "Defense Readiness & Jury Presentation Mode",
    summaryAr:
      "إزاي ترتبوا فقرات المتحدثين بالدقيقة، وتجهزوا بنك أسئلة اللجنة، وتفتحوا شاشة العرض يوم المناقشة.",
    summaryEn:
      "Prepare speaker sections, rehearsal checklists, expected jury questions, and launch Jury Present Mode.",
    estimatedMinutes: 2,
    startRoute: "/defense",
    roles: "ALL",
    keywords: ["defense", "المناقشة", "عرض", "لجنة التحكيم", "الأسئلة", "present"],
    steps: [
      {
        id: "def-1-hero",
        route: "/defense",
        target: "defense-hero",
        categoryAr: "مركز المناقشة",
        categoryEn: "Defense Center",
        titleAr: "غرفة التحكم الأخيرة قبل يوم المناقشة",
        titleEn: "Final Defense Readiness Hero",
        contentAr:
          "قبل المناقشة، الصفحة دي بتبقى مركز التحكم الأخير للفريق: بتشوفوا منها نسبة جاهزية المناقشة، ومكان وميعاد اللجنة، وإجمالي دقائق العرض.",
        contentEn:
          "Track overall defense readiness percentage, venue, schedule, and total presentation duration.",
        placement: "bottom",
      },
      {
        id: "def-2-sections",
        route: "/defense",
        target: "defense-sections",
        categoryAr: "مركز المناقشة",
        categoryEn: "Defense Center",
        titleAr: "تقسيم وقت العرض وخطة الطوارئ للـ Demo",
        titleEn: "Speaker Sections & Demo Backup Plan",
        contentAr:
          "قسّموا العرض لفقرات واضحة وحددوا مين هيتكلم في كل فقرة وكام دقيقة بالظبط، وسجلوا سيناريو الـ Demo وخطة البديل (Backup Plan) لو الإنترنت فصل في القاعة.",
        contentEn:
          "Assign speaker segments in minutes and document your live demo script and offline fallback plan.",
        placement: "top",
      },
      {
        id: "def-3-questions",
        route: "/defense",
        target: "defense-questions",
        categoryAr: "مركز المناقشة",
        categoryEn: "Defense Center",
        titleAr: "بنك الأسئلة المتوقعة من لجنة التحكيم",
        titleEn: "Expected Jury Q&A Bank",
        contentAr:
          "كل سؤال صعب تتوقعوه من اللجنة سجلوه هنا، واكتبوا الإجابة الهندسية المختصرة ومين من الفريق مسؤول يرد عليه يوم المناقشة.",
        contentEn:
          "Prepare concise answers and assign a primary responder for every anticipated jury question.",
        placement: "top",
      },
    ],
  },
];

export const KEYBOARD_SHORTCUTS_GUIDE = [
  {
    keys: ["Ctrl", "K"],
    labelAr: "فتح لوحة الأوامر والبحث الشامل في المشروع",
    labelEn: "Open Global Command Palette & Project Search",
  },
  {
    keys: ["/"],
    labelAr: "بحث فوري سريع من أي شاشة",
    labelEn: "Quick search from any screen",
  },
  {
    keys: ["Esc"],
    labelAr: "إغلاق النوافذ أو إيقاف الجولة التعليمية مؤقتًا مع حفظ مكانك",
    labelEn: "Close dialogs or pause active tour (progress saved)",
  },
  {
    keys: ["←", "→"],
    labelAr: "التنقل بين خطوات الجولة التعليمية النشطة",
    labelEn: "Navigate between active guide steps",
  },
];

