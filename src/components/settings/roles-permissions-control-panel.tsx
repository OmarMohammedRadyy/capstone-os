"use client";

import React, { useState, useMemo } from "react";
import { ProjectRole, SystemRole } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  updateMemberDetailsAction,
  assignProjectSupervisorAction,
  transferLeadershipAction,
  revokeProjectInviteAction,
  inviteMemberAction,
  inviteMemberWithCredentialsAction,
  removeMemberAction,
  updateUserSystemRoleAction,
} from "@/app/actions/project-actions";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
  Key,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Sliders,
  Sparkles,
  History,
  Copy,
  Trash2,
  RefreshCw,
  Search,
  Check,
  Minus,
  HelpCircle,
  ArrowRightLeft,
  Briefcase,
  Layers,
  FileCheck2,
  AlertTriangle,
  Scale,
  Zap,
  ExternalLink,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export interface MemberItem {
  id: string;
  userId: string;
  role: ProjectRole;
  responsibilityTitle: string | null;
  capacityPoints: number | null;
  active: boolean;
  joinedAt: Date | string;
  leftAt: Date | string | null;
  user: {
    id: string;
    name: string;
    email: string;
    systemRole: SystemRole;
  };
}

export interface InviteItem {
  id: string;
  projectId: string;
  email: string | null;
  role: ProjectRole;
  tokenHash: string;
  expiresAt: Date | string;
  maxUses: number;
  useCount: number;
  revokedAt: Date | string | null;
  createdAt: Date | string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: Date | string;
  before: any;
  after: any;
  metadata: any;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CandidateSupervisor {
  id: string;
  name: string;
  email: string;
  systemRole: SystemRole;
}

interface RolesPermissionsControlPanelProps {
  projectId: string;
  projectSlug: string;
  members: MemberItem[];
  invites?: InviteItem[];
  auditLogs?: AuditLogItem[];
  candidateSupervisors?: CandidateSupervisor[];
  currentSupervisorId?: string | null;
  currentUser: {
    id: string;
    name: string;
    email: string;
    systemRole: SystemRole;
    projectRole: ProjectRole | null;
  };
}

type PermissionScope = "FULL" | "CONDITIONAL" | "VIEW" | "NONE";

interface PermissionRule {
  id: string;
  category: "tasks" | "milestones" | "feedback" | "submissions" | "governance" | "adr_risk";
  categoryLabelAr: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  serverCheck: string;
  academicRationaleAr: string;
  matrix: {
    [ProjectRole.STUDENT]: { scope: PermissionScope; noteAr: string };
    [ProjectRole.TEAM_LEADER]: { scope: PermissionScope; noteAr: string };
    [ProjectRole.SUPERVISOR]: { scope: PermissionScope; noteAr: string };
    [ProjectRole.DEPARTMENT_ADMIN]: { scope: PermissionScope; noteAr: string };
    SYSTEM_ADMIN: { scope: PermissionScope; noteAr: string };
  };
}

const PERMISSION_RULES: PermissionRule[] = [
  {
    id: "tasks_create",
    category: "tasks",
    categoryLabelAr: "المهام ومراحل التنفيذ",
    titleAr: "إنشاء مهام جديدة في السبرنت والباكلوغ",
    titleEn: "Create Tasks",
    descriptionAr: "إمكانية تفكيك مخرجات المشروع وإضافة مهام تنفيذية وتحديد أوزانها ونقاط التقدير.",
    serverCheck: "canCreateTask(user, role)",
    academicRationaleAr: "يمنح للطلاب والمتصدر لتحفيز المبادرة الذاتية في التخطيط، ويحجب عن المشرف لضمان استقلالية عمل الفريق.",
    matrix: {
      STUDENT: { scope: "FULL", noteAr: "متاح لجميع أعضاء الفريق لبناء مهامهم" },
      TEAM_LEADER: { scope: "FULL", noteAr: "صلاحية كاملة لتخطيط وتوزيع المهام" },
      SUPERVISOR: { scope: "VIEW", noteAr: "للاطلاع والمتابعة الأكاديمية فقط دون تدخل بالتنفيذ" },
      DEPARTMENT_ADMIN: { scope: "VIEW", noteAr: "للاطلاع على سير تقدم الأقسام" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية جذرية لكافة العمليات" },
    },
  },
  {
    id: "tasks_edit",
    category: "tasks",
    categoryLabelAr: "المهام ومراحل التنفيذ",
    titleAr: "تعديل المهام وحالتها ونقلها بين المراحل",
    titleEn: "Edit & Update Tasks",
    descriptionAr: "تحديث نسبة الإنجاز، تعديل التفاصيل، ونقل المهمة إلى قيد المراجعة أو مكتملة.",
    serverCheck: "canEditTask(user, role, isAssignee)",
    academicRationaleAr: "الطالب يعدل فقط المهام المسندة إليه شخصياً لضمان المساءلة الفردية، بينما المتصدر يملك التحكم الكامل.",
    matrix: {
      STUDENT: { scope: "CONDITIONAL", noteAr: "فقط للمهام المسندة إليه شخصياً (isAssignee)" },
      TEAM_LEADER: { scope: "FULL", noteAr: "تعديل وإعادة توجيه أي مهمة في المشروع" },
      SUPERVISOR: { scope: "VIEW", noteAr: "متابعة تدفق المهام عبر لوحة كانبان" },
      DEPARTMENT_ADMIN: { scope: "VIEW", noteAr: "تدقيق تقدم الإنجاز" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "تعديل مباشر لأي مهمة" },
    },
  },
  {
    id: "tasks_delete",
    category: "tasks",
    categoryLabelAr: "المهام ومراحل التنفيذ",
    titleAr: "حذف المهام وإلغاؤها من السبرنت",
    titleEn: "Delete Tasks",
    descriptionAr: "إزالة المهمة نهائياً من قاعدة بيانات المشروع وتعديل موازين الجهد.",
    serverCheck: "canDeleteTask(user, role)",
    academicRationaleAr: "محصور بمتصدر الفريق لمنع التلاعب بسجل المهام أو الحذف العشوائي من قِبل الطلاب المنفذين.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "محظور منعاً لفقدان البيانات أو التهرب من المسؤولية" },
      TEAM_LEADER: { scope: "FULL", noteAr: "يملك سلطة هندسة خطة العمل والتنظيف" },
      SUPERVISOR: { scope: "NONE", noteAr: "غير متاح لتجنب تشويه جهود الفريق" },
      DEPARTMENT_ADMIN: { scope: "NONE", noteAr: "لا يتدخل بحذف المهام التنفيذية" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "حذف استثنائي لأغراض الصيانة" },
    },
  },
  {
    id: "milestones_approve",
    category: "milestones",
    categoryLabelAr: "المحطات ونقاط التقييم (Milestones)",
    titleAr: "اعتماد المحطات والمراحل الأكاديمية (Stage Gates)",
    titleEn: "Approve / Reject Milestones",
    descriptionAr: "التوقيع الأكاديمي الرقمي على إتمام مرحلة كاملة والانتقال للمرحلة التالية.",
    serverCheck: "canApproveMilestone(user, role)",
    academicRationaleAr: "سلطة سيادية حصرية للمشرف الأكاديمي ولجنة القسم لضمان استيفاء المعايير العلمية قبل الانتقال للمرحلة التالية.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "لا يملك الطالب اعتماد مخرجاته بنفسه" },
      TEAM_LEADER: { scope: "NONE", noteAr: "يقدم طلب الاعتماد فقط ولا يعتمده" },
      SUPERVISOR: { scope: "FULL", noteAr: "السلطة الرسمية الأساسية لاعتماد بوابات المراحل" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "اعتماد مؤسسي في حال غياب المشرف أو التدقيق" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "اعتماد إداري عند الطوارئ" },
    },
  },
  {
    id: "milestones_request",
    category: "milestones",
    categoryLabelAr: "المحطات ونقاط التقييم (Milestones)",
    titleAr: "تقديم طلب مراجعة واعتماد المحطة",
    titleEn: "Request Milestone Approval",
    descriptionAr: "إرسال إشعار رسمي للمشرف بأن متطلبات المحطة اكتملت وجاهزة للتقييم الأكاديمي.",
    serverCheck: "canRequestMilestoneApproval(user, role)",
    academicRationaleAr: "يمنح للفريق والطلاب لإعلان جاهزية المرحلة وربطها بالأدلة والوثائق المرفقة.",
    matrix: {
      STUDENT: { scope: "FULL", noteAr: "متاح لطلب الاعتماد عند جاهزية المخرجات" },
      TEAM_LEADER: { scope: "FULL", noteAr: "التقديم الرسمي المعتمد للمحطة" },
      SUPERVISOR: { scope: "NONE", noteAr: "المشرف يستقبل الطلب ولا يقدمه لنفسه" },
      DEPARTMENT_ADMIN: { scope: "NONE", noteAr: "متابعة التدفق" },
      SYSTEM_ADMIN: { scope: "VIEW", noteAr: "مراقبة الإشعارات" },
    },
  },
  {
    id: "feedback_add",
    category: "feedback",
    categoryLabelAr: "الملاحظات والتوجيه الأكاديمي (Feedback)",
    titleAr: "تدوين ملاحظات وتوجيهات الإشراف الأكاديمي الرسمية",
    titleEn: "Add Formal Supervisor Feedback",
    descriptionAr: "رصد توجيهات أكاديمية ملزمة، تصنيف شدتها (حرجة / مهمة / تحسين)، وربطها بالمهام.",
    serverCheck: "canAddSupervisorFeedback(user, role)",
    academicRationaleAr: "أداة التقييم المستمر للمشرف الأكاديمي لمتابعة جودة الكود، المعمارية، وتقرير التخرج.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "الطالب يتلقى الملاحظات ولا يحرر ملاحظات إشرافية" },
      TEAM_LEADER: { scope: "NONE", noteAr: "الملاحظات الإشرافية حكر على الكادر الأكاديمي" },
      SUPERVISOR: { scope: "FULL", noteAr: "المصدر الأكاديمي الرئيسي للتوجيه والتقييم" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "إضافة ملاحظات وتوصيات لجنة المشاريع" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية شاملة" },
    },
  },
  {
    id: "feedback_resolve",
    category: "feedback",
    categoryLabelAr: "الملاحظات والتوجيه الأكاديمي (Feedback)",
    titleAr: "معالجة الملاحظات وتقديم أدلة التصحيح (Remediation)",
    titleEn: "Resolve Feedback & Submit Proof",
    descriptionAr: "توثيق التعديلات التي قام بها الفريق، وإرفاق روابط الكود أو المستندات المصححة.",
    serverCheck: "canResolveFeedback(user, role)",
    academicRationaleAr: "مسؤولية الفريق الطلابي لإثبات التفاعل مع الملاحظات واستيفائها قبل المناقشة.",
    matrix: {
      STUDENT: { scope: "FULL", noteAr: "يقوم بمعالجة الملاحظات الموجهة لعمله" },
      TEAM_LEADER: { scope: "FULL", noteAr: "إدارة إغلاق الملاحظات وتوزيع أعباء التصحيح" },
      SUPERVISOR: { scope: "VIEW", noteAr: "ينتظر تقديم أدلة التصحيح من الطلاب" },
      DEPARTMENT_ADMIN: { scope: "VIEW", noteAr: "متابعة مؤشر الاستجابة للتوجيهات" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية شاملة" },
    },
  },
  {
    id: "feedback_verify",
    category: "feedback",
    categoryLabelAr: "الملاحظات والتوجيه الأكاديمي (Feedback)",
    titleAr: "التحقق النهائي وإغلاق الملاحظة (Verification & Sign-off)",
    titleEn: "Verify Remediation & Close Feedback",
    descriptionAr: "التأكد من أن التصحيح استوفى الملاحظة فعلياً وإغلاق البند الأكاديمي نهائياً.",
    serverCheck: "canVerifyFeedback(user, role)",
    academicRationaleAr: "يمنع إغلاق أي ملاحظة إشرافية ذاتياً من الطلاب دون تحقق وتوقيع المشرف الأكاديمي.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "محظور تماماً؛ لا يجوز للطالب اعتماد تصحيحه بنفسه" },
      TEAM_LEADER: { scope: "NONE", noteAr: "محظور؛ التحقق حق أكاديمي للمشرف فقط" },
      SUPERVISOR: { scope: "FULL", noteAr: "السلطة الوحيدة للتحقق وإغلاق الملاحظة" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "التحقق في إطار مراجعات الجودة المؤسسية" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية شاملة" },
    },
  },
  {
    id: "submissions_freeze",
    category: "submissions",
    categoryLabelAr: "التسليمات وحزم المشروع (Submissions)",
    titleAr: "تجميد نسخة التسليم للأرشفة والتقييم (Freeze Submission)",
    titleEn: "Freeze Submission Version",
    descriptionAr: "قفل الوثائق والكود لمنع أي تعديل إضافي بعد موعد التسليم النهائي للتقييم.",
    serverCheck: "canFreezeSubmission(user, role)",
    academicRationaleAr: "إجراء حاسم لمنع التلاعب بالتسليمات المتأخرة، بيد متصدر الفريق أو إدارة القسم.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "تجميد الحزمة قرار تنظيمي يخص قيادة الفريق" },
      TEAM_LEADER: { scope: "FULL", noteAr: "قفل النسخة بعد استيفاء جميع المتطلبات" },
      SUPERVISOR: { scope: "VIEW", noteAr: "يستلم النسخة المجمدة لمراجعتها ومنح الدرجة" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "سلطة قفل التسليمات للدفعة بأكملها" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية قفل وفك تجميد استثنائية" },
    },
  },
  {
    id: "adr_risk_manage",
    category: "adr_risk",
    categoryLabelAr: "القرارات المعمارية وسجل المخاطر (ADR & Risk)",
    titleAr: "توثيق القرارات المعمارية ADR وإدارة مصفوفة المخاطر",
    titleEn: "Manage Architecture Decisions & Risks",
    descriptionAr: "تسجيل المفاضلات التقنية (Trade-offs)، البدائل المدروسة، وتحليل احتمالية وأثر المخاطر.",
    serverCheck: "canManageDecisions / canManageRisks",
    academicRationaleAr: "ممارسة هندسية أساسية متاحة لجميع أعضاء الفريق لترسيخ التفكير النقدي وتوثيق المنطق الهندسي.",
    matrix: {
      STUDENT: { scope: "FULL", noteAr: "متاح لتوثيق القرارات ورصد المخاطر المكتشفة" },
      TEAM_LEADER: { scope: "FULL", noteAr: "إقرار القرارات المعمارية ومتابعة خطط التخفيف" },
      SUPERVISOR: { scope: "VIEW", noteAr: "مراجعة نضج التفكير الهندسي للفريق" },
      DEPARTMENT_ADMIN: { scope: "VIEW", noteAr: "تقييم التزام المشروع بالمعايير الهندسية" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية شاملة" },
    },
  },
  {
    id: "governance_members",
    category: "governance",
    categoryLabelAr: "حوكمة الفريق والصلاحيات (Team Governance)",
    titleAr: "إدارة أعضاء الفريق، المسؤوليات، ونقاط السعة",
    titleEn: "Manage Team Members & Governance",
    descriptionAr: "توزيع الأدوار، تحديد المسمى الوظيفي والمسؤوليات، وتعديل نقاط السعة الأسبوعية.",
    serverCheck: "canManageMembers(user, role)",
    academicRationaleAr: "يمنح لمتصدر الفريق لتنظيم مهام فريقه أو لإدارة القسم عند تسوية النزاعات.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "لا يتدخل بتعديل صلاحيات أو سعة زملائه" },
      TEAM_LEADER: { scope: "FULL", noteAr: "إدارة توزيع الأعباء والمسؤوليات داخل الفريق" },
      SUPERVISOR: { scope: "VIEW", noteAr: "الاطلاع على توزيع المسؤوليات لمطابقتها في المناقشة" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "التدخل الحوكمي وإعادة هيكلة الفرق" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "التحكم الشامل في أي مشروع" },
    },
  },
  {
    id: "governance_settings",
    category: "governance",
    categoryLabelAr: "حوكمة الفريق والصلاحيات (Team Governance)",
    titleAr: "تعديل ميثاق المشروع وأوزان محرك الصحة (Health Weights)",
    titleEn: "Project Charter & Health Engine Formula",
    descriptionAr: "تعديل بيانات المشروع الرسمية وأوزان معادلة التقييم الستة المشروطة بـ 100%.",
    serverCheck: "canManageProjectSettings(user, role)",
    academicRationaleAr: "قرارات استراتيجية تخص قيادة المشروع أو إدارة القسم فقط لضمان سلامة حسابات الأداء.",
    matrix: {
      STUDENT: { scope: "NONE", noteAr: "محظور لحماية معادلة الصحة والميثاق" },
      TEAM_LEADER: { scope: "FULL", noteAr: "صياغة الميثاق وضبط أوزان المحرك بالتوافق مع القسم" },
      SUPERVISOR: { scope: "VIEW", noteAr: "التدقيق والتأكد من ملاءمة الأوزان الأكاديمية" },
      DEPARTMENT_ADMIN: { scope: "FULL", noteAr: "فرض أوزان موحدة على مستوى القسم" },
      SYSTEM_ADMIN: { scope: "FULL", noteAr: "صلاحية شاملة" },
    },
  },
];

export function RolesPermissionsControlPanel({
  projectId,
  projectSlug,
  members: initialMembers,
  invites: initialInvites = [],
  auditLogs: initialAuditLogs = [],
  candidateSupervisors = [],
  currentSupervisorId,
  currentUser,
}: RolesPermissionsControlPanelProps) {
  // Navigation inside Governance Panel
  const [activeSubTab, setActiveSubTab] = useState<
    "matrix" | "simulator" | "members" | "invites" | "audit"
  >("matrix");

  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [invites, setInvites] = useState<InviteItem[]>(initialInvites);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [supervisorId, setSupervisorId] = useState<string | null>(currentSupervisorId || null);

  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [matrixFilterCategory, setMatrixFilterCategory] = useState<string>("all");
  const [selectedRuleDetail, setSelectedRuleDetail] = useState<PermissionRule | null>(null);

  // Simulator State
  const [simulatorRole, setSimulatorRole] = useState<ProjectRole | "SYSTEM_ADMIN">(
    currentUser.projectRole || ProjectRole.STUDENT
  );
  const [simulatorSelectedMemberId, setSimulatorSelectedMemberId] = useState<string>("");

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [editRole, setEditRole] = useState<ProjectRole>(ProjectRole.STUDENT);
  const [editTitle, setEditTitle] = useState("");
  const [editCapacity, setEditCapacity] = useState<number>(30);
  const [editActive, setEditActive] = useState(true);

  // Promote / Transfer Leadership Modal State
  const [transferTargetMember, setTransferTargetMember] = useState<MemberItem | null>(null);
  const [demoteSelfOnTransfer, setDemoteSelfOnTransfer] = useState(true);

  // Assign Supervisor Modal State
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
  const [selectedSupervisorUserId, setSelectedSupervisorUserId] = useState<string>(
    supervisorId || ""
  );

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePassword, setInvitePassword] = useState("Capstone#2026!");
  const [inviteResponsibility, setInviteResponsibility] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.STUDENT);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
    isNewAccount: boolean;
  } | null>(null);

  // System Role Edit Modal State (System Admin only)
  const [editingSystemRoleUser, setEditingSystemRoleUser] = useState<MemberItem | null>(null);
  const [targetSystemRole, setTargetSystemRole] = useState<SystemRole>(SystemRole.USER);

  const isLeaderOrAdmin =
    currentUser.projectRole === ProjectRole.TEAM_LEADER ||
    currentUser.systemRole === SystemRole.SYSTEM_ADMIN ||
    currentUser.systemRole === SystemRole.DEPARTMENT_ADMIN;

  const isSystemAdmin = currentUser.systemRole === SystemRole.SYSTEM_ADMIN;

  // Key Statistics
  const activeMembersCount = useMemo(() => members.filter((m) => m.active).length, [members]);
  const totalCapacity = useMemo(
    () =>
      members
        .filter((m) => m.active)
        .reduce((sum, m) => sum + (m.capacityPoints || 0), 0),
    [members]
  );
  const leaderMember = useMemo(
    () => members.find((m) => m.role === ProjectRole.TEAM_LEADER && m.active),
    [members]
  );
  const supervisorMember = useMemo(
    () => members.find((m) => m.role === ProjectRole.SUPERVISOR && m.active),
    [members]
  );

  // Handlers
  async function handleSaveMemberDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;

    setLoading(true);
    try {
      const res = await updateMemberDetailsAction(projectId, projectSlug, editingMember.userId, {
        role: editRole,
        responsibilityTitle: editTitle,
        capacityPoints: editCapacity,
        active: editActive,
      });

      if (res.success && res.member) {
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === editingMember.userId
              ? {
                  ...m,
                  role: editRole,
                  responsibilityTitle: editTitle || null,
                  capacityPoints: editCapacity,
                  active: editActive,
                }
              : m
          )
        );
        toast.success(`تم تحديث بيانات وصلاحيات (${editingMember.user.name}) بنجاح`);
        setEditingMember(null);
      } else {
        toast.error(res.error || "فشل تحديث بيانات العضو");
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل الصلاحيات");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMemberActive(m: MemberItem) {
    if (m.role === ProjectRole.TEAM_LEADER && m.active) {
      toast.error("لا يمكن تجميد متصدر الفريق النشط مباشرة. يرجى نقل القيادة أولاً.");
      return;
    }

    const nextActive = !m.active;
    const actionLabel = nextActive ? "تنشيط" : "تجميد";

    setLoading(true);
    try {
      const res = await updateMemberDetailsAction(projectId, projectSlug, m.userId, {
        active: nextActive,
      });
      if (res.success) {
        setMembers((prev) =>
          prev.map((item) =>
            item.userId === m.userId ? { ...item, active: nextActive } : item
          )
        );
        toast.success(`تم ${actionLabel} عضوية (${m.user.name}) بنجاح`);
      } else {
        toast.error(res.error || `فشل ${actionLabel} العضوية`);
      }
    } catch {
      toast.error("حدث خطأ أثناء تغيير حالة العضوية");
    } finally {
      setLoading(false);
    }
  }

  async function handleExecuteTransferLeadership() {
    if (!transferTargetMember) return;

    setLoading(true);
    try {
      const res = await transferLeadershipAction(
        projectId,
        projectSlug,
        transferTargetMember.userId,
        demoteSelfOnTransfer
      );

      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.userId === transferTargetMember.userId) {
              return { ...m, role: ProjectRole.TEAM_LEADER };
            }
            if (demoteSelfOnTransfer && m.userId === currentUser.id) {
              return { ...m, role: ProjectRole.STUDENT };
            }
            return m;
          })
        );
        toast.success(`تمت ترقية (${transferTargetMember.user.name}) لمتصدر الفريق بنجاح`);
        setTransferTargetMember(null);
      } else {
        toast.error(res.error || "فشل نقل تصدر الفريق");
      }
    } catch {
      toast.error("حدث خطأ أثناء نقل القيادة");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignSupervisor() {
    if (!selectedSupervisorUserId) {
      toast.error("يرجى اختيار المشرف الأكاديمي أولاً");
      return;
    }

    setLoading(true);
    try {
      const res = await assignProjectSupervisorAction(
        projectId,
        projectSlug,
        selectedSupervisorUserId
      );

      if (res.success) {
        setSupervisorId(selectedSupervisorUserId);
        // Update membership list if target is in it
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === selectedSupervisorUserId
              ? { ...m, role: ProjectRole.SUPERVISOR, active: true }
              : m
          )
        );
        toast.success("تم تعيين واعتماد المشرف الأكاديمي للمشروع بنجاح");
        setSupervisorModalOpen(false);
      } else {
        toast.error(res.error || "فشل تعيين المشرف الأكاديمي");
      }
    } catch {
      toast.error("حدث خطأ أثناء تعيين المشرف");
    } finally {
      setLoading(false);
    }
  }

  function openInviteDialog() {
    setGeneratedInviteToken(null);
    setGeneratedCredentials(null);
    setInviteEmail("");
    setInviteName("");
    setInvitePassword(`Cap#${Math.floor(1000 + Math.random() * 9000)}!`);
    setInviteResponsibility("");
    setInviteRole(ProjectRole.STUDENT);
    setShowPasswordInModal(false);
    setInviteModalOpen(true);
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صالح");
      return;
    }
    setLoading(true);
    try {
      const res = await inviteMemberWithCredentialsAction(projectId, projectSlug, {
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        password: invitePassword.trim() || undefined,
        role: inviteRole,
        responsibilityTitle: inviteResponsibility.trim() || undefined,
      });

      if (res.success) {
        setGeneratedInviteToken(res.token);
        setGeneratedCredentials(res.credentials);
        setInvites((prev) => [res.invite as any, ...prev]);
        toast.success(
          res.credentials.isNewAccount
            ? `تم إنشاء الحساب الأكاديمي بنجاح وتوليد بيانات الدخول لـ (${res.credentials.email})`
            : `تم تحديث بيانات الدخول وتوليد رابط الدعوة لـ (${res.credentials.email})`
        );
      } else {
        toast.error(res.error || "فشل إنشاء الدعوة وتوليد بيانات الدخول");
      }
    } catch {
      toast.error("حدث خطأ أثناء إنشاء الدعوة");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeInvite(inviteId: string) {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء وتجميد هذا الرابط؟")) return;

    setLoading(true);
    try {
      const res = await revokeProjectInviteAction(projectId, projectSlug, inviteId);
      if (res.success) {
        setInvites((prev) =>
          prev.map((inv) => (inv.id === inviteId ? { ...inv, revokedAt: new Date() } : inv))
        );
        toast.success("تم إلغاء رابط الدعوة بنجاح");
      } else {
        toast.error(res.error || "فشل إلغاء الدعوة");
      }
    } catch {
      toast.error("حدث خطأ أثناء إلغاء الدعوة");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSystemRole() {
    if (!editingSystemRoleUser) return;
    setLoading(true);
    try {
      const res = await updateUserSystemRoleAction(
        editingSystemRoleUser.userId,
        targetSystemRole
      );
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === editingSystemRoleUser.userId
              ? { ...m, user: { ...m.user, systemRole: targetSystemRole } }
              : m
          )
        );
        toast.success(`تم تعديل الدور النظامي للمستخدم (${editingSystemRoleUser.user.name})`);
        setEditingSystemRoleUser(null);
      } else {
        toast.error(res.error || "فشل تعديل الدور النظامي");
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل الدور النظامي");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(targetUserId: string, name: string) {
    if (
      !confirm(
        `تنبيه: سيتم إلغاء تفعيل عضوية الطالب (${name}) مع الاحتفاظ بكافة مساهماته التاريخية في مهام ومراحل المشروع. هل تريد الاستمرار؟`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await removeMemberAction(projectId, projectSlug, targetUserId);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.userId === targetUserId ? { ...m, active: false } : m))
        );
        toast.success(`تم إلغاء تفعيل عضوية (${name}) بنجاح`);
      } else {
        toast.error(res.error || "فشل إزالة العضو");
      }
    } catch {
      toast.error("حدث خطأ أثناء إزالة العضو");
    } finally {
      setLoading(false);
    }
  }

  // Filtered permission rules
  const filteredRules = useMemo(() => {
    if (matrixFilterCategory === "all") return PERMISSION_RULES;
    return PERMISSION_RULES.filter((r) => r.category === matrixFilterCategory);
  }, [matrixFilterCategory]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Top Governance Executive Header ── */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface-muted)] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-[#C9A13C]/10 text-[#C9A13C] border border-[#C9A13C]/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  لوحة تحكم الأدوار والصلاحيات والحوكمة الأكاديمية
                  <Badge variant="outline" className="text-[10px] border-[#C9A13C]/30 text-[#C9A13C]">
                    Enterprise Matrix
                  </Badge>
                </h2>
                <p className="text-xs text-[var(--ink-secondary)]">
                  التحكم الدقيق في صلاحيات المشروع، توزيع المسؤوليات، تعيين المشرف الأكاديمي، ومصفوفة الحوكمة الحصرية
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isLeaderOrAdmin && (
              <>
                <Button
                  size="sm"
                  onClick={openInviteDialog}
                  className="text-xs flex items-center gap-1.5 bg-[#C9A13C] hover:bg-[#b08c32] text-black font-semibold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  دعوة عضو جديد
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSupervisorUserId(supervisorId || "");
                    setSupervisorModalOpen(true);
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                  {supervisorMember ? "تعديل المشرف الأكاديمي" : "تعيين مشرف أكاديمي"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-[var(--border)]">
          <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/60">
            <div className="text-[11px] text-[var(--ink-secondary)] flex items-center justify-between">
              <span>إجمالي الفريق</span>
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-[var(--ink)] mt-1">
              {activeMembersCount} <span className="text-xs font-normal text-[var(--ink-secondary)]">/ {members.length} نشط</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/60">
            <div className="text-[11px] text-[var(--ink-secondary)] flex items-center justify-between">
              <span>متصدر الفريق</span>
              <Crown className="h-3.5 w-3.5 text-[#C9A13C]" />
            </div>
            <div className="text-xs font-bold text-[var(--ink)] mt-1.5 truncate">
              {leaderMember ? leaderMember.user.name : "غير محدد"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/60">
            <div className="text-[11px] text-[var(--ink-secondary)] flex items-center justify-between">
              <span>المشرف الأكاديمي</span>
              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div className="text-xs font-bold text-[var(--ink)] mt-1.5 truncate">
              {supervisorMember ? supervisorMember.user.name : "بانتظار التعيين"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/60">
            <div className="text-[11px] text-[var(--ink-secondary)] flex items-center justify-between">
              <span>إجمالي نقاط السعة</span>
              <Scale className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-[var(--ink)] mt-1">
              {totalCapacity} <span className="text-[10px] font-normal text-[var(--ink-secondary)]">نقطة جهد/أسبوع</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/60">
            <div className="text-[11px] text-[var(--ink-secondary)] flex items-center justify-between">
              <span>الدعوات النشطة</span>
              <Key className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-lg font-bold text-[var(--ink)] mt-1">
              {invites.filter((i) => !i.revokedAt && new Date(i.expiresAt) > new Date()).length}{" "}
              <span className="text-[10px] font-normal text-[var(--ink-secondary)]">روابط صالحة</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab("matrix")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "matrix"
              ? "border-[#C9A13C] text-[var(--ink)] bg-[var(--surface)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Layers className="h-4 w-4 text-[#C9A13C]" />
          مصفوفة الصلاحيات والحوكمة (Matrix)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("simulator")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "simulator"
              ? "border-blue-500 text-[var(--ink)] bg-[var(--surface)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Zap className="h-4 w-4 text-blue-500" />
          محاكي وفاحص الصلاحيات (Role Simulator)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("members")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "members"
              ? "border-emerald-500 text-[var(--ink)] bg-[var(--surface)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Users className="h-4 w-4 text-emerald-500" />
          إدارة أعضاء الفريق والمسؤوليات ({members.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("invites")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "invites"
              ? "border-amber-500 text-[var(--ink)] bg-[var(--surface)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Key className="h-4 w-4 text-amber-500" />
          إدارة الدعوات والروابط ({invites.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "audit"
              ? "border-indigo-500 text-[var(--ink)] bg-[var(--surface)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <History className="h-4 w-4 text-indigo-500" />
          سجل تدقيق الحوكمة ({auditLogs.length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: DYNAMIC PERMISSION MATRIX
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "matrix" && (
        <div className="space-y-4">
          {/* Filter Bar & Legend */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[var(--ink)]">تصفية المجال:</span>
              {[
                { id: "all", label: "كافة الصلاحيات" },
                { id: "tasks", label: "المهام والسبرنت" },
                { id: "milestones", label: "المحطات والاعتمادات" },
                { id: "feedback", label: "التوجيه الأكاديمي" },
                { id: "submissions", label: "التسليمات والقفل" },
                { id: "adr_risk", label: "المخاطر والقرارات" },
                { id: "governance", label: "حوكمة الفريق" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMatrixFilterCategory(c.id)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    matrixFilterCategory === c.id
                      ? "bg-[var(--ink)] text-[var(--surface)] font-bold"
                      : "bg-[var(--surface-muted)] text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Scope Legend */}
            <div className="flex items-center gap-2 text-[10px] text-[var(--ink-secondary)] flex-wrap">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> مسموح بالكامل
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> مشروط بقيود
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> للاطلاع فقط
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> محظور تماماً
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink)]">
                  <th className="p-3 font-bold w-1/3 min-w-[240px]">القدرة والصلاحية التشغيلية</th>
                  <th className="p-3 font-bold text-center min-w-[110px]">
                    <div className="flex items-center justify-center gap-1">
                      <span>طالب</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">STUDENT</Badge>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-center min-w-[120px] bg-[#C9A13C]/5 text-[#C9A13C]">
                    <div className="flex items-center justify-center gap-1">
                      <Crown className="h-3 w-3" />
                      <span>متصدر الفريق</span>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-center min-w-[120px] bg-indigo-500/5 text-indigo-500">
                    <div className="flex items-center justify-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>المشرف الأكاديمي</span>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-center min-w-[120px] bg-amber-500/5 text-amber-600">
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>إدارة القسم</span>
                    </div>
                  </th>
                  <th className="p-3 font-bold text-center min-w-[110px] bg-purple-500/5 text-purple-600">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>مدير النظام</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRuleDetail(rule)}
                    className="hover:bg-[var(--surface-muted)]/60 cursor-pointer transition-colors group"
                  >
                    <td className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-[var(--ink)] group-hover:text-[#C9A13C] transition-colors">
                            {rule.titleAr}
                          </div>
                          <div className="text-[11px] text-[var(--ink-secondary)] mt-0.5 line-clamp-1">
                            {rule.descriptionAr}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {rule.categoryLabelAr}
                        </Badge>
                      </div>
                    </td>

                    {/* Student */}
                    <td className="p-3 text-center">
                      <ScopeBadge scope={rule.matrix.STUDENT.scope} note={rule.matrix.STUDENT.noteAr} />
                    </td>

                    {/* Team Leader */}
                    <td className="p-3 text-center bg-[#C9A13C]/5">
                      <ScopeBadge scope={rule.matrix.TEAM_LEADER.scope} note={rule.matrix.TEAM_LEADER.noteAr} />
                    </td>

                    {/* Supervisor */}
                    <td className="p-3 text-center bg-indigo-500/5">
                      <ScopeBadge scope={rule.matrix.SUPERVISOR.scope} note={rule.matrix.SUPERVISOR.noteAr} />
                    </td>

                    {/* Department Admin */}
                    <td className="p-3 text-center bg-amber-500/5">
                      <ScopeBadge scope={rule.matrix.DEPARTMENT_ADMIN.scope} note={rule.matrix.DEPARTMENT_ADMIN.noteAr} />
                    </td>

                    {/* System Admin */}
                    <td className="p-3 text-center bg-purple-500/5">
                      <ScopeBadge scope={rule.matrix.SYSTEM_ADMIN.scope} note={rule.matrix.SYSTEM_ADMIN.noteAr} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-[var(--ink-secondary)] text-center">
            💡 انقر على أي سطر في المصفوفة لعرض المبرر الأكاديمي، كود التحقق في الباك إند، والقاعدة المنفذة بدقة.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: ROLE SIMULATOR & POLICY INSPECTOR
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "simulator" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    محاكي وفاحص الصلاحيات المباشر (Role Capability Simulator)
                  </CardTitle>
                  <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                    اختر دوراً أو عضواً محدداً لمحاكاة تجربة استخدامه والتحقق مما يمكنه وما لا يمكنه فعله الآن
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={simulatorRole}
                    onChange={(e) => {
                      setSimulatorRole(e.target.value as any);
                      setSimulatorSelectedMemberId("");
                    }}
                    className="text-xs"
                  >
                    <option value={ProjectRole.STUDENT}>طالب (Student)</option>
                    <option value={ProjectRole.TEAM_LEADER}>متصدر الفريق (Team Leader)</option>
                    <option value={ProjectRole.SUPERVISOR}>المشرف الأكاديمي (Supervisor)</option>
                    <option value={ProjectRole.DEPARTMENT_ADMIN}>إدارة القسم (Department Admin)</option>
                    <option value="SYSTEM_ADMIN">مدير النظام (System Admin)</option>
                  </Select>

                  {members.length > 0 && (
                    <Select
                      value={simulatorSelectedMemberId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        setSimulatorSelectedMemberId(mId);
                        if (mId) {
                          const target = members.find((m) => m.id === mId);
                          if (target) setSimulatorRole(target.role);
                        }
                      }}
                      className="text-xs"
                    >
                      <option value="">-- أو اختر عضواً بالاسم --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.user.name} ({m.role})
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-5 text-xs">
              {/* Role Profile Banner */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--ink)]">
                      الملف الأكاديمي للدور: {getRoleArabicName(simulatorRole)}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {simulatorRole}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] max-w-2xl leading-relaxed">
                    {getRoleDescriptionAr(simulatorRole)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[var(--ink-secondary)]">نطاق الحوكمة:</span>
                  <Badge
                    variant={
                      simulatorRole === "SYSTEM_ADMIN" || simulatorRole === ProjectRole.DEPARTMENT_ADMIN
                        ? "destructive"
                        : simulatorRole === ProjectRole.SUPERVISOR
                        ? "secondary"
                        : "default"
                    }
                  >
                    {simulatorRole === "SYSTEM_ADMIN"
                      ? "إشراف جذري شامل"
                      : simulatorRole === ProjectRole.DEPARTMENT_ADMIN
                      ? "رقابة قسم أكاديمي"
                      : simulatorRole === ProjectRole.SUPERVISOR
                      ? "اعتماد أكاديمي سيادي"
                      : simulatorRole === ProjectRole.TEAM_LEADER
                      ? "قيادة تنفيذية للمشروع"
                      : "تنفيذ مهام وتطوير"}
                  </Badge>
                </div>
              </div>

              {/* Live Questions & Simulation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PERMISSION_RULES.map((rule) => {
                  const roleMatrixItem =
                    simulatorRole === "SYSTEM_ADMIN"
                      ? rule.matrix.SYSTEM_ADMIN
                      : rule.matrix[simulatorRole as ProjectRole];

                  const isAllowed = roleMatrixItem.scope === "FULL";
                  const isConditional = roleMatrixItem.scope === "CONDITIONAL";
                  const isViewOnly = roleMatrixItem.scope === "VIEW";
                  const isForbidden = roleMatrixItem.scope === "NONE";

                  return (
                    <div
                      key={rule.id}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0">
                        {isAllowed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {isConditional && <AlertCircle className="h-4 w-4 text-blue-500" />}
                        {isViewOnly && <Eye className="h-4 w-4 text-slate-400" />}
                        {isForbidden && <XCircle className="h-4 w-4 text-rose-500" />}
                      </div>

                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[var(--ink)]">{rule.titleAr}</span>
                          <ScopeBadge scope={roleMatrixItem.scope} note="" />
                        </div>
                        <p className="text-[11px] text-[var(--ink-secondary)] leading-relaxed">
                          {roleMatrixItem.noteAr}
                        </p>
                        <div className="text-[10px] text-[var(--ink-secondary)]/70 font-mono mt-1 pt-1 border-t border-[var(--border)]/40">
                          {rule.serverCheck}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 3: MEMBERS & CAPACITY GOVERNANCE
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">
                أعضاء الفريق ومسؤولياتهم المعتمدة
              </h3>
              <p className="text-xs text-[var(--ink-secondary)]">
                تعديل الأدوار، صياغة المسميات الوظيفية الأكاديمية، وإدارة موازين سعة العمل (Capacity)
              </p>
            </div>

            {isLeaderOrAdmin && (
              <Button
                size="sm"
                onClick={openInviteDialog}
                className="text-xs flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                دعوة عضو جديد
              </Button>
            )}
          </div>

          {/* Members Table */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {members.map((m) => {
                const isLeader = m.role === ProjectRole.TEAM_LEADER;
                const isSupervisor = m.role === ProjectRole.SUPERVISOR;
                const isDeptAdmin = m.role === ProjectRole.DEPARTMENT_ADMIN;

                return (
                  <div
                    key={m.id}
                    className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-colors ${
                      !m.active ? "bg-rose-500/5 opacity-70" : "hover:bg-[var(--surface-muted)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={m.user.name} className="h-10 w-10 text-xs shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[var(--ink)]">
                            {m.user.name}
                          </span>

                          {/* Project Role Badge */}
                          <Badge
                            className={
                              isLeader
                                ? "bg-[#C9A13C]/15 text-[#C9A13C] border-[#C9A13C]/30 text-[10px]"
                                : isSupervisor
                                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px]"
                                : isDeptAdmin
                                ? "bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]"
                                : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]"
                            }
                          >
                            {isLeader && <Crown className="h-2.5 w-2.5 ml-1" />}
                            {isSupervisor && <GraduationCap className="h-2.5 w-2.5 ml-1" />}
                            {getRoleArabicName(m.role)}
                          </Badge>

                          {/* System Role Badge */}
                          {m.user.systemRole !== SystemRole.USER && (
                            <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-500/30">
                              نظام: {m.user.systemRole}
                            </Badge>
                          )}

                          {/* Active / Inactive Badge */}
                          {!m.active && (
                            <Badge variant="destructive" className="text-[9px]">
                              عضوية معلقة / مجمدة
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[var(--ink-secondary)] flex-wrap">
                          <span className="font-medium text-[var(--ink)]">
                            {m.responsibilityTitle || "عضو فريق التنفيذ والتطوير"}
                          </span>
                          <span>•</span>
                          <span>{m.user.email}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Scale className="h-3 w-3" />
                            السعة: {m.capacityPoints ?? 30} نقطة/أسبوع
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Controls & Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                      {isLeaderOrAdmin && (
                        <>
                          {/* Edit Details */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMember(m);
                              setEditRole(m.role);
                              setEditTitle(m.responsibilityTitle || "");
                              setEditCapacity(m.capacityPoints ?? 30);
                              setEditActive(m.active);
                            }}
                            className="text-xs h-8 px-2.5 flex items-center gap-1"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            تعديل الصلاحية والمسؤولية
                          </Button>

                          {/* Promote to Leader (if not already leader) */}
                          {!isLeader && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTransferTargetMember(m);
                                setDemoteSelfOnTransfer(true);
                              }}
                              className="text-xs h-8 px-2 text-[#C9A13C] hover:bg-[#C9A13C]/10 border-[#C9A13C]/30 flex items-center gap-1"
                              title="ترقية لمتصدر الفريق"
                            >
                              <Crown className="h-3.5 w-3.5" />
                              ترقية لمتصدر
                            </Button>
                          )}

                          {/* Assign as Supervisor */}
                          {!isSupervisor && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSupervisorUserId(m.userId);
                                setSupervisorModalOpen(true);
                              }}
                              className="text-xs h-8 px-2 text-indigo-500 hover:bg-indigo-500/10 border-indigo-500/30 flex items-center gap-1"
                              title="تعيين كمشرف أكاديمي للمشروع"
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Toggle Active / Deactivate */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleMemberActive(m)}
                            disabled={loading || (isLeader && m.active)}
                            className={`text-xs h-8 px-2 ${
                              m.active
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            }`}
                            title={m.active ? "تجميد العضوية" : "إعادة التفعيل"}
                          >
                            {m.active ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </Button>

                          {/* Remove Member */}
                          {!isLeader && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(m.userId, m.user.name)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 h-8 w-8 p-0"
                              title="إلغاء التفعيل والأرشفة"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </>
                      )}

                      {/* System Role Editor (System Admin only) */}
                      {isSystemAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSystemRoleUser(m);
                            setTargetSystemRole(m.user.systemRole);
                          }}
                          className="text-purple-600 hover:text-purple-700 text-xs h-8 px-2"
                          title="تعديل الدور النظامي للمستخدم (System Admin)"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 4: ACADEMIC INVITES & TOKEN ENGINE
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "invites" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">
                روابط الدعوات الأكاديمية المصرحة
              </h3>
              <p className="text-xs text-[var(--ink-secondary)]">
                توليد ومتابعة روابط الانضمام المشفرة بآلية SHA-256 والمقيدة بالصلاحية
              </p>
            </div>

            {isLeaderOrAdmin && (
              <Button
                size="sm"
                onClick={openInviteDialog}
                className="text-xs flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                توليد رابط دعوة جديد
              </Button>
            )}
          </div>

          {invites.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--ink-secondary)]">
              لا توجد روابط دعوة سارية حالياً. يمكنك توليد رابط دعوة لطالب أو مشرف عبر زر &quot;توليد رابط دعوة جديد&quot;.
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink)]">
                    <th className="p-3 font-bold">الدور المخصص</th>
                    <th className="p-3 font-bold">البريد المقيد</th>
                    <th className="p-3 font-bold">تاريخ الانتهاء</th>
                    <th className="p-3 font-bold">الحالة</th>
                    <th className="p-3 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {invites.map((inv) => {
                    const isExpired = new Date(inv.expiresAt) < new Date();
                    const isRevoked = Boolean(inv.revokedAt);
                    const isUsed = inv.useCount >= inv.maxUses;
                    const isValid = !isExpired && !isRevoked && !isUsed;

                    return (
                      <tr key={inv.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {getRoleArabicName(inv.role)}
                          </Badge>
                        </td>
                        <td className="p-3 text-[var(--ink)]">
                          {inv.email || <span className="text-[var(--ink-secondary)]">رابط مفتوح (غير مقيد ببريد محدد)</span>}
                        </td>
                        <td className="p-3 text-[var(--ink-secondary)]">
                          {new Date(inv.expiresAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-3">
                          {isValid && (
                            <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                              صالح للاستخدام
                            </Badge>
                          )}
                          {isRevoked && (
                            <Badge variant="destructive" className="text-[10px]">
                              ملغى / مجمد
                            </Badge>
                          )}
                          {!isRevoked && isExpired && (
                            <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-500/30">
                              منتهي الصلاحية
                            </Badge>
                          )}
                          {!isRevoked && !isExpired && isUsed && (
                            <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/30">
                              تم الانضمام به
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isValid && isLeaderOrAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="text-rose-600 hover:text-rose-700 h-7 text-[11px]"
                            >
                              إلغاء وتجميد الرابط
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 5: GOVERNANCE AUDIT TRAIL
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--ink)]">
              سجل التدقيق الإداري وتغييرات الحوكمة (Audit Trail)
            </h3>
            <p className="text-xs text-[var(--ink-secondary)]">
              سجل تدقيق غير قابل للتعديل يوثق كافة التعديلات على الأدوار والصلاحيات وتعيينات الإشراف
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--ink-secondary)]">
              لا توجد سجلات تدقيق سابقة في هذا المشروع.
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1.5 rounded-md bg-[var(--surface-muted)] text-[var(--ink)] mt-0.5">
                      <History className="h-3.5 w-3.5" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--ink)]">
                          {log.actor?.name || "النظام الأكاديمي"}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--ink-secondary)]">
                        {getAuditActionDescriptionAr(log.action, log.before, log.after, log.metadata)}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--ink-secondary)] shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleString("ar-EG")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT MEMBER DETAILS & CAPACITY
      ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(editingMember)}
        onOpenChange={(open) => !open && setEditingMember(null)}
      >
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-[#C9A13C]" />
              تعديل الصلاحية والمسؤولية: {editingMember?.user.name}
            </DialogTitle>
          </DialogHeader>

          {editingMember && (
            <form onSubmit={handleSaveMemberDetails} className="space-y-4 text-xs py-2">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">
                  الدور في المشروع الأكاديمي *
                </label>
                <Select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as ProjectRole)}
                >
                  <option value={ProjectRole.STUDENT}>طالب (Student)</option>
                  <option value={ProjectRole.TEAM_LEADER}>متصدر الفريق (Team Leader)</option>
                  <option value={ProjectRole.SUPERVISOR}>مشرف أكاديمي (Supervisor)</option>
                  <option value={ProjectRole.DEPARTMENT_ADMIN}>إدارة القسم (Department Admin)</option>
                </Select>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">
                  المسمى والمسؤولية الأكاديمية (Responsibility Title)
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="مثال: Lead Architect & Backend Developer"
                  maxLength={60}
                />
                <span className="text-[10px] text-[var(--ink-secondary)] mt-0.5 block">
                  يظهر المسمى في لوحة الشرف وتقارير المناقشة النهائية
                </span>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">
                  نقاط السعة الأسبوعية (Capacity Points)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(Number(e.target.value))}
                />
                <span className="text-[10px] text-[var(--ink-secondary)] mt-0.5 block">
                  تُستخدم في معادلة اتزان أعباء العمل Workload Balance في محرك صحة المشروع
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
                <div>
                  <span className="font-bold text-[var(--ink)] block">حالة العضوية</span>
                  <span className="text-[11px] text-[var(--ink-secondary)]">
                    {editActive ? "عضو نشط ومخول بالعمل" : "عضوية معلقة مؤقتاً"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditActive(!editActive)}
                  className={`text-xs ${editActive ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {editActive ? "نشط (Active)" : "معلق (Suspended)"}
                </Button>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  إلغاء
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="bg-[#C9A13C] hover:bg-[#b08c32] text-black font-semibold">
                  حفظ وضبط الصلاحيات
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: TRANSFER LEADERSHIP / PROMOTE TO TEAM LEADER
      ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(transferTargetMember)}
        onOpenChange={(open) => !open && setTransferTargetMember(null)}
      >
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-[#C9A13C]">
              <Crown className="h-4 w-4" />
              تأكيد ترقية ونقل قيادة الفريق الأكاديمي
            </DialogTitle>
          </DialogHeader>

          {transferTargetMember && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  إجراء حوكمي عالي التأثير
                </div>
                <p>
                  أنت على وشك ترقية الطالب <strong>({transferTargetMember.user.name})</strong> ليصبح
                  &quot;متصدر الفريق (Team Leader)&quot;. سيكتسب الصلاحيات الكاملة لإدارة المهام، إعدادات المشروع، وتجميد النسخ.
                </p>
              </div>

              {currentUser.projectRole === ProjectRole.TEAM_LEADER && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
                  <div>
                    <span className="font-bold text-[var(--ink)] block">تحويل دورك الحالي إلى طالب</span>
                    <span className="text-[11px] text-[var(--ink-secondary)]">
                      التنازل عن القيادة والتحول لعضو فريق تنفيذ اعتيادي
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={demoteSelfOnTransfer}
                    onChange={(e) => setDemoteSelfOnTransfer(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />
                </div>
              )}

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTransferTargetMember(null)}
                >
                  إلغاء الترقية
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={handleExecuteTransferLeadership}
                  className="bg-[#C9A13C] hover:bg-[#b08c32] text-black font-semibold"
                >
                  تأكيد واعتماد الترقية
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ASSIGN / REASSIGN PROJECT SUPERVISOR
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={supervisorModalOpen} onOpenChange={setSupervisorModalOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-indigo-500">
              <GraduationCap className="h-4 w-4" />
              تعيين واعتماد المشرف الأكاديمي للمشروع
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <p className="text-[var(--ink-secondary)] leading-relaxed">
              المشرف الأكاديمي هو الجهة الحصرية المخولة باعتماد محطات المشروع (Milestones)، رصد ملاحظات التوجيه الأكاديمي، والتحقق من التزام الطلاب بالمعايير الهندسية.
            </p>

            <div>
              <label className="block text-[var(--ink)] font-medium mb-1">
                اختر المشرف الأكاديمي من الكادر المعتمد *
              </label>
              <Select
                value={selectedSupervisorUserId}
                onChange={(e) => setSelectedSupervisorUserId(e.target.value)}
              >
                <option value="">-- اختر عضو هيئة التدريس --</option>
                {/* Candidates from props */}
                {candidateSupervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    د. {s.name} ({s.email}) {s.systemRole !== "USER" ? `• ${s.systemRole}` : ""}
                  </option>
                ))}
                {/* Also existing members */}
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name} ({m.user.email}) • {m.role}
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSupervisorModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={loading || !selectedSupervisorUserId}
                onClick={handleAssignSupervisor}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                حفظ وتعيين المشرف
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: GENERATE ACADEMIC INVITE WITH CREDENTIALS
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#C9A13C]" />
              {generatedCredentials
                ? "بطاقة بيانات الدخول ورابط الدعوة المعتمد"
                : "إنشاء دعوة رسمية وتوليد بيانات الدخول"}
            </DialogTitle>
          </DialogHeader>

          {generatedInviteToken && generatedCredentials ? (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  {generatedCredentials.isNewAccount
                    ? "تم إنشاء الحساب الأكاديمي بنجاح وتوليد كلمة المرور ورابط الدخول المباشر:"
                    : "تم تحديث كلمة المرور وربط الحساب بالدعوة بنجاح:"}
                </span>
              </div>

              {/* Official Credentials Box */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                  <span className="font-bold text-[var(--ink)]">بطاقة بيانات الدخول (Login Credentials)</span>
                  <Badge variant="gold" className="text-[10px]">
                    {getRoleArabicName(inviteRole)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[var(--ink-secondary)] block">اسم العضو:</span>
                    <span className="font-bold text-[var(--ink)]">{generatedCredentials.name}</span>
                  </div>

                  <div>
                    <span className="text-[var(--ink-secondary)] block">الدور المخصص:</span>
                    <span className="font-bold text-[var(--ink)]">{getRoleArabicName(inviteRole)}</span>
                  </div>

                  <div className="sm:col-span-2 p-2 rounded bg-[var(--surface)] border border-[var(--border)]/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--ink-secondary)] block">البريد الجامعي للدخول:</span>
                      <span className="font-mono font-bold text-[var(--ink)] select-all">{generatedCredentials.email}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentials.email);
                        toast.success("تم نسخ البريد الإلكتروني");
                      }}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="sm:col-span-2 p-2 rounded bg-[var(--surface)] border border-[var(--border)]/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--ink-secondary)] block">كلمة المرور المؤقتة:</span>
                      <span className="font-mono font-bold text-[var(--ink)] select-all">
                        {showPasswordInModal ? generatedCredentials.password : "••••••••••••"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                        className="h-7 px-2"
                        title={showPasswordInModal ? "إخفاء" : "إظهار"}
                      >
                        {showPasswordInModal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCredentials.password);
                          toast.success("تم نسخ كلمة المرور");
                        }}
                        className="h-7 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Direct Link */}
                <div className="pt-2 border-t border-[var(--border)]/60 space-y-1.5">
                  <span className="text-[10px] text-[var(--ink-secondary)] block font-semibold">
                    رابط الدعوة المباشر (يتضمن التوكن والبيانات المشفرة):
                  </span>
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
                    <span className="line-clamp-1">{`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${generatedInviteToken}#email=${encodeURIComponent(generatedCredentials.email)}&pwd=${encodeURIComponent(generatedCredentials.password)}`}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          const fullUrl = `${window.location.origin}/invite/${generatedInviteToken}#email=${encodeURIComponent(generatedCredentials.email)}&pwd=${encodeURIComponent(generatedCredentials.password)}`;
                          navigator.clipboard.writeText(fullUrl);
                          toast.success("تم نسخ الرابط المباشر للحافظة");
                        }
                      }}
                      className="h-7 px-2 shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Master Copy Button */}
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const fullUrl = `${window.location.origin}/invite/${generatedInviteToken}#email=${encodeURIComponent(generatedCredentials.email)}&pwd=${encodeURIComponent(generatedCredentials.password)}`;
                      const messageTemplate = `🎓 دعوة رسمية للانضمام لمشروع تخرج
📌 الدور المخصص: ${getRoleArabicName(inviteRole)}
👤 اسم العضو: ${generatedCredentials.name}
✉️ البريد الإلكتروني: ${generatedCredentials.email}
🔑 كلمة المرور المؤقتة: ${generatedCredentials.password}
🔗 رابط الدخول والانضمام المباشر:
${fullUrl}

(يمكنك النقر مباشرة على الرابط أعلاه لتسجيل الدخول التلقائي وقبول الدعوة بنقرة واحدة)`;

                      navigator.clipboard.writeText(messageTemplate);
                      toast.success("تم نسخ رسالة الدعوة وبيانات الدخول كاملة بنجاح!");
                    }
                  }}
                  className="w-full h-10 text-xs font-bold bg-[#C9A13C] hover:bg-[#b08c32] text-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  نسخ رسالة الدعوة وبيانات الدخول كاملة (WhatsApp / Email)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const fullUrl = `${window.location.origin}/invite/${generatedInviteToken}#email=${encodeURIComponent(generatedCredentials.email)}&pwd=${encodeURIComponent(generatedCredentials.password)}`;
                      window.open(fullUrl, "_blank");
                    }
                  }}
                  className="w-full h-9 text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                  فتح الرابط واختباره في نافذة جديدة
                </Button>
              </div>

              <DialogFooter className="pt-2">
                <Button size="sm" onClick={() => setInviteModalOpen(false)}>
                  تم الانتهاء
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateInvite} className="space-y-3.5 py-2 text-xs">
              <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200 text-[11px] leading-relaxed">
                يقوم النظام بإنشاء حساب رسمي فورياً للطالب/المشرف بكلمة المرور المحددة، ويرسلها في بطاقة الدعوة لتسهيل تسجيل دخوله فور استلام الرابط.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    البريد الجامعي للعضو *
                  </label>
                  <Input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    اسم العضو (اختياري)
                  </label>
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="مثال: م. سيف الدين خالد"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    الدور المخصص عند الانضمام *
                  </label>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                  >
                    <option value={ProjectRole.STUDENT}>طالب (Student)</option>
                    <option value={ProjectRole.SUPERVISOR}>مشرف أكاديمي (Supervisor)</option>
                    <option value={ProjectRole.DEPARTMENT_ADMIN}>إدارة القسم (Department Admin)</option>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    المسمى والمسؤولية الأكاديمية (اختياري)
                  </label>
                  <Input
                    value={inviteResponsibility}
                    onChange={(e) => setInviteResponsibility(e.target.value)}
                    placeholder="مثال: Frontend & UI/UX Specialist"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[var(--ink)] font-medium">
                      كلمة المرور الابتدائية للحساب *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const words = ["Cap", "Arch", "Grad", "Sva", "Sprint", "Code"];
                        const word = words[Math.floor(Math.random() * words.length)];
                        const num = Math.floor(1000 + Math.random() * 9000);
                        setInvitePassword(`${word}#${num}!`);
                        toast.success("تم توليد كلمة مرور عشوائية جديدة");
                      }}
                      className="text-[10px] text-[#C9A13C] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      توليد كلمة مرور أخرى
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showPasswordInModal ? "text" : "password"}
                      required
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      className="font-mono pr-2.5 pl-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                    >
                      {showPasswordInModal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--ink-secondary)] mt-0.5 block">
                    يمكنك كتابة أي كلمة مرور تريدها أو ترك الكلمة المولدة تلقائياً
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-[#C9A13C] hover:bg-[#b08c32] text-black font-semibold flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  إنشاء الحساب وتوليد بطاقة الدعوة
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PERMISSION RULE DETAIL & RATIONALE VIEWER
      ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedRuleDetail)}
        onOpenChange={(open) => !open && setSelectedRuleDetail(null)}
      >
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C9A13C]" />
              تفاصيل القاعدة والحوكمة الأكاديمية
            </DialogTitle>
          </DialogHeader>

          {selectedRuleDetail && (
            <div className="space-y-4 py-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--ink)]">
                    {selectedRuleDetail.titleAr}
                  </span>
                  <Badge variant="outline" className="text-[9px]">
                    {selectedRuleDetail.categoryLabelAr}
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] mt-1">
                  {selectedRuleDetail.descriptionAr}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                <span className="font-bold text-[var(--ink)] block">المبرر الأكاديمي والهندسي:</span>
                <p className="text-[11px] text-[var(--ink-secondary)] leading-relaxed">
                  {selectedRuleDetail.academicRationaleAr}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] space-y-1 font-mono text-[11px]">
                <span className="font-bold text-[var(--ink)] block font-sans">
                  الدالة المنفذة في الباك إند (Server Action Check):
                </span>
                <span className="text-indigo-500 font-semibold">{selectedRuleDetail.serverCheck}</span>
                <span className="text-[10px] text-[var(--ink-secondary)] block font-sans mt-0.5">
                  الموقع البرمجي: src/server/auth/permissions.ts
                </span>
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setSelectedRuleDetail(null)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT SYSTEM ROLE (SYSTEM ADMIN ONLY)
      ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(editingSystemRoleUser)}
        onOpenChange={(open) => !open && setEditingSystemRoleUser(null)}
      >
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-purple-600">
              <Shield className="h-4 w-4" />
              تعديل الدور النظامي: {editingSystemRoleUser?.user.name}
            </DialogTitle>
          </DialogHeader>

          {editingSystemRoleUser && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 text-purple-900 dark:text-purple-300 text-[11px]">
                تعديل الدور النظامي يغير صلاحيات المستخدم عبر كافة مشاريع الجامعة والنظام الأكاديمي ككل.
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">
                  الدور النظامي العام (System Role) *
                </label>
                <Select
                  value={targetSystemRole}
                  onChange={(e) => setTargetSystemRole(e.target.value as SystemRole)}
                >
                  <option value={SystemRole.USER}>مستخدم اعتيادي (USER)</option>
                  <option value={SystemRole.DEPARTMENT_ADMIN}>إدارة القسم الأكاديمي (DEPARTMENT_ADMIN)</option>
                  <option value={SystemRole.SYSTEM_ADMIN}>مدير النظام الشامل (SYSTEM_ADMIN)</option>
                </Select>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSystemRoleUser(null)}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={handleSaveSystemRole}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  حفظ الدور النظامي
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Subcomponent: Scope Badge
function ScopeBadge({ scope, note }: { scope: PermissionScope; note: string }) {
  if (scope === "FULL") {
    return (
      <span
        title={note}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
      >
        <Check className="h-2.5 w-2.5" />
        مسموح
      </span>
    );
  }
  if (scope === "CONDITIONAL") {
    return (
      <span
        title={note}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
      >
        <Sliders className="h-2.5 w-2.5" />
        مشروط
      </span>
    );
  }
  if (scope === "VIEW") {
    return (
      <span
        title={note}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--surface-muted)] text-[var(--ink-secondary)] border border-[var(--border)]"
      >
        <Eye className="h-2.5 w-2.5" />
        اطلاع
      </span>
    );
  }
  return (
    <span
      title={note}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
    >
      <Minus className="h-2.5 w-2.5" />
      محظور
    </span>
  );
}

// Helpers
function getRoleArabicName(role: ProjectRole | "SYSTEM_ADMIN"): string {
  switch (role) {
    case ProjectRole.STUDENT:
      return "طالب (Student)";
    case ProjectRole.TEAM_LEADER:
      return "متصدر الفريق (Team Leader)";
    case ProjectRole.SUPERVISOR:
      return "المشرف الأكاديمي (Supervisor)";
    case ProjectRole.DEPARTMENT_ADMIN:
      return "إدارة القسم (Department Admin)";
    case "SYSTEM_ADMIN":
      return "مدير النظام (System Admin)";
    default:
      return role;
  }
}

function getRoleDescriptionAr(role: ProjectRole | "SYSTEM_ADMIN"): string {
  switch (role) {
    case ProjectRole.STUDENT:
      return "عضو فريق التنفيذ والتطوير. مسؤول عن إنجاز المهام المسندة إليه، تسجيل القرارات المعمارية ADR، معالجة ملاحظات المشرف، وتقديم أدلة التصحيح.";
    case ProjectRole.TEAM_LEADER:
      return "متصدر وقائد الفريق الطلابي. يملك الصلاحية الكاملة لتوزيع المهام، إدارة السبرنتات، دعوة الأعضاء، ميثاق المشروع، وتجميد النسخ الرسمية للتسليم.";
    case ProjectRole.SUPERVISOR:
      return "المشرف الأكاديمي الرسمي للمشروع. يملك السلطة السيادية لاعتماد بوابات المراحل (Milestones)، رصد ملاحظات التوجيه الأكاديمي، والتحقق من التصحيحات.";
    case ProjectRole.DEPARTMENT_ADMIN:
      return "مندوب لجنة مشاريع التخرج أو رئيس القسم. يملك رقابة عليا على كافة مشاريع القسم، التدخل الحوكمي، التدقيق، واعتماد التسليمات.";
    case "SYSTEM_ADMIN":
      return "مدير المنصة الشامل. يملك الصلاحية الجذرية (Root) لتعديل أي قيد، صيانة المشاريع المؤرشفة، وتعديل الأدوار النظامية لكافة المستخدمين.";
    default:
      return "";
  }
}

function getAuditActionDescriptionAr(action: string, before: any, after: any, metadata: any): string {
  switch (action) {
    case "PROJECT_MEMBER_UPDATED":
      return `تم تعديل بيانات العضو (الدور: ${after?.role || "-"}، المسمى: ${after?.responsibilityTitle || "-"}، السعة: ${after?.capacityPoints || "-"}، النشاط: ${after?.active ? "نشط" : "معلق"})`;
    case "PROJECT_MEMBER_REMOVED":
      return "تم إلغاء تفعيل عضوية الطالب مع الحفاظ على الأرشيف التاريخي لمساهماته";
    case "PROJECT_INVITE_CREATED":
      return `تم توليد رابط دعوة رسمي جديد للدور (${metadata?.role || "طالب"})`;
    case "PROJECT_INVITE_REVOKED":
      return "تم إلغاء وتجميد رابط الدعوة الرسمي";
    case "PROJECT_INVITE_ACCEPTED":
      return "تم قبول الدعوة بنجاح وتفعيل عضوية جديدة في الفريق";
    case "PROJECT_SUPERVISOR_ASSIGNED":
      return `تم تعيين واعتماد المشرف الأكاديمي للمشروع: (${metadata?.supervisorName || "-"})`;
    case "PROJECT_LEADERSHIP_TRANSFERRED":
      return "تم نقل وتأكيد ترقية متصدر الفريق بنجاح";
    case "PROJECT_SETTINGS_UPDATED":
      return "تم تحديث البيانات العامة أو أوزان معادلة صحة المشروع";
    case "USER_SYSTEM_ROLE_UPDATED":
      return `تم تعديل الدور النظامي للمستخدم (${before?.systemRole} -> ${after?.systemRole})`;
    default:
      return action;
  }
}

