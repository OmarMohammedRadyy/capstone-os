"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectRole } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  updateProjectSettingsAction,
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  archiveProjectAction,
} from "@/app/actions/project-actions";
import {
  Settings,
  Users,
  Sliders,
  AlertTriangle,
  UserPlus,
  Trash2,
  CheckCircle2,
  Copy,
  Shield,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { LandingSplashStudio } from "@/features/experience/components/landing-splash-studio";
import { RolesPermissionsControlPanel } from "@/components/settings/roles-permissions-control-panel";

interface MemberItem {
  id: string;
  userId: string;
  role: ProjectRole;
  responsibilityTitle: string | null;
  capacityPoints: number;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectData {
  id: string;
  slug: string;
  title: string;
  code: string;
  abstract: string | null;
  academicYear: string;
  department: string;
  timezone: string;
  locale: string;
  supervisorId?: string | null;
  weightSchedule: number;
  weightTasks: number;
  weightFeedback: number;
  weightRisk: number;
  weightReadiness: number;
  weightWorkload: number;
}

export function ProjectSettingsView({
  project,
  members,
  userRole,
  invites = [],
  auditLogs = [],
  candidateSupervisors = [],
  currentUser,
}: {
  project: ProjectData;
  members: any[];
  userRole: string;
  invites?: any[];
  auditLogs?: any[];
  candidateSupervisors?: any[];
  currentUser?: any;
}) {
  const router = useRouter();
  const isLeader = userRole === "TEAM_LEADER" || userRole === "SYSTEM_ADMIN";
  const [activeTab, setActiveTab] = useState<"general" | "team" | "health" | "studio" | "danger">("general");
  const [loading, setLoading] = useState(false);

  // General Form State
  const [title, setTitle] = useState(project.title);
  const [abstract, setAbstract] = useState(project.abstract || "");
  const [academicYear, setAcademicYear] = useState(project.academicYear);
  const [department, setDepartment] = useState(project.department);

  // Health Weights State
  const [wSchedule, setWSchedule] = useState(project.weightSchedule);
  const [wTasks, setWTasks] = useState(project.weightTasks);
  const [wFeedback, setWFeedback] = useState(project.weightFeedback);
  const [wRisk, setWRisk] = useState(project.weightRisk);
  const [wReadiness, setWReadiness] = useState(project.weightReadiness);
  const [wWorkload, setWWorkload] = useState(project.weightWorkload);

  // Member Management State
  const [memberList, setMemberList] = useState<MemberItem[]>(members);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.STUDENT);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const totalWeights = wSchedule + wTasks + wFeedback + wRisk + wReadiness + wWorkload;

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProjectSettingsAction(project.id, project.slug, {
        title,
        abstract,
        academicYear,
        department,
      });
      if (res.success) {
        toast.success("تم تحديث البيانات العامة للمشروع بنجاح");
      } else {
        toast.error(res.error || "فشل تحديث البيانات");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWeights(e: React.FormEvent) {
    e.preventDefault();
    if (totalWeights !== 100) {
      toast.error(`مجموع الأوزان يجب أن يكون 100% تمامًا (المجموع الحالي: ${totalWeights}%)`);
      return;
    }

    setLoading(true);
    try {
      const res = await updateProjectSettingsAction(project.id, project.slug, {
        weightSchedule: wSchedule,
        weightTasks: wTasks,
        weightFeedback: wFeedback,
        weightRisk: wRisk,
        weightReadiness: wReadiness,
        weightWorkload: wWorkload,
      });
      if (res.success) {
        toast.success("تم حفظ وضبط أوزان محرك صحة المشروع (Health Engine Weights)");
      } else {
        toast.error(res.error || "فشل حفظ الأوزان");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ الأوزان");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await inviteMemberAction(
        project.id,
        project.slug,
        inviteEmail.trim() || null,
        inviteRole
      );
      if (res.success && res.token) {
        setInviteToken(res.token);
        toast.success("تم توليد رابط الدعوة الرسمي بنجاح");
      } else {
        toast.error(res.error || "فشل إنشاء الدعوة");
      }
    } catch {
      toast.error("حدث خطأ أثناء إنشاء الدعوة");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(targetUserId: string) {
    if (!confirm("هل أنت متأكد من رغبتك في إزالة هذا العضو؟ سيتم الاحتفاظ بسجل مساهماته التاريخية."))
      return;

    setLoading(true);
    try {
      const res = await removeMemberAction(project.id, project.slug, targetUserId);
      if (res.success) {
        setMemberList((prev) => prev.filter((m) => m.userId !== targetUserId));
        toast.success("تم إلغاء تفعيل عضوية الطالب بنجاح");
      } else {
        toast.error(res.error || "فشل إزالة العضو");
      }
    } catch {
      toast.error("حدث خطأ أثناء إزالة العضو");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchiveProject() {
    if (
      !confirm(
        "تنبيه هام: أرشفة المشروع ستجعله للقراءة فقط وتخفيه من لوحة العمل النشطة. هل ترغب بالاستمرار؟"
      )
    )
      return;

    setLoading(true);
    try {
      const res = await archiveProjectAction(project.id, project.slug);
      if (res.success) {
        toast.success("تمت أرشفة المشروع بنجاح");
        router.push("/app/projects");
      } else {
        toast.error(res.error || "فشل أرشفة المشروع");
      }
    } catch {
      toast.error("حدث خطأ أثناء أرشفة المشروع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Settings className="h-4 w-4" />
          البيانات العامة (General)
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
            activeTab === "team"
              ? "border-[#C9A13C] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Shield className="h-4 w-4 text-[#C9A13C]" />
          الأدوار والصلاحيات والحوكمة ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
            activeTab === "health"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Sliders className="h-4 w-4" />
          أوزان محرك الصحة (Health Weights)
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
            activeTab === "studio"
              ? "border-[#C9A13C] text-[var(--ink)]"
              : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          <Sparkles className="h-4 w-4 text-[#C9A13C]" />
          الواجهة واستوديو العرض (Landing &amp; Splash Studio)
        </button>

        <button
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t border-b-2 transition-colors ${
            activeTab === "danger"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-[var(--ink-secondary)] hover:text-rose-600"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          منطقة الخطر (Danger Zone)
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === "general" && (
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-bold text-[var(--ink)]">
              بيانات وميثاق المشروع الأكاديمي
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs max-w-2xl">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">اسم المشروع *</label>
                <Input
                  required
                  disabled={!isLeader}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">العام الأكاديمي *</label>
                  <Input
                    required
                    disabled={!isLeader}
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">القسم الأكاديمي *</label>
                  <Input
                    required
                    disabled={!isLeader}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">الملخص والأهداف (Abstract)</label>
                <Textarea
                  rows={4}
                  disabled={!isLeader}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                />
              </div>

              {isLeader && (
                <Button type="submit" size="sm" disabled={loading} className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  حفظ التعديلات
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Roles, Permissions & Team Governance Matrix */}
      {activeTab === "team" && (
        <RolesPermissionsControlPanel
          projectId={project.id}
          projectSlug={project.slug}
          members={members as any}
          invites={invites as any}
          auditLogs={auditLogs as any}
          candidateSupervisors={candidateSupervisors as any}
          currentSupervisorId={project.supervisorId}
          currentUser={
            currentUser || {
              id: "",
              name: "",
              email: "",
              systemRole: "USER" as any,
              projectRole: userRole as any,
            }
          }
        />
      )}

      {/* Tab 3: Health Weights */}
      {activeTab === "health" && (
        <Card>
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[var(--ink)]">
                  أوزان أبعاد محرك الصحة الستة (Project Health Formula)
                </CardTitle>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  يجب أن يكون مجموع الأوزان 100% تمامًا وفق قيد التحقق CHECK constraint في قاعدة البيانات.
                </p>
              </div>

              <Badge
                variant={totalWeights === 100 ? "success" : "destructive"}
                className="text-xs px-2.5 py-1"
              >
                المجموع الحالي: {totalWeights}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSaveWeights} className="space-y-4 max-w-xl text-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">الالتزام بالجدول الزمني (Schedule Adherence):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wSchedule}
                      onChange={(e) => setWSchedule(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">إنجاز المهام وسرعة التنفيذ (Tasks Completion):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wTasks}
                      onChange={(e) => setWTasks(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">معالجة ملاحظات المشرف (Supervisor Feedback):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wFeedback}
                      onChange={(e) => setWFeedback(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">التحكم بالمخاطر والمشاكل (Risk & Issues):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wRisk}
                      onChange={(e) => setWRisk(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">جاهزية التسليمات والوثائق (Submission Readiness):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wReadiness}
                      onChange={(e) => setWReadiness(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[var(--ink)]">اتزان أعباء العمل بين الأعضاء (Workload Balance):</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={wWorkload}
                      onChange={(e) => setWWorkload(Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              {isLeader && (
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || totalWeights !== 100}
                  className="flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  حفظ وضبط معادلة الصحة
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Appearance & Experience — Landing & Splash Studio */}
      {activeTab === "studio" && (
        <LandingSplashStudio projectSlug={project.slug} />
      )}

      {/* Tab 5: Danger Zone */}
      {activeTab === "danger" && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              أرشفة المشروع الأكاديمي (Archive Project)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <p className="text-[var(--ink-secondary)] leading-relaxed">
              عند أرشفة المشروع، ستصبح كافة السجلات، المهام، الوثائق، وقرارات ADR في حالة قراءة فقط (Read-Only). لن يتمكن أي عضو من تعديل البيانات أو إضافة تسليمات جديدة، مع بقاء كافة البصمات وسجلات التدقيق محفوظة بدقة.
            </p>

            {isLeader ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={handleArchiveProject}
              >
                أرشفة هذا المشروع نهائيًا
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs">
                إجراء محصور بمتصدر الفريق أو إدارة النظام
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">دعوة عضو جديد للمشروع</DialogTitle>
          </DialogHeader>

          {inviteToken ? (
            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>تم إنشاء رابط الدعوة بنجاح. أرسل هذا الرابط للطالب للانضمام:</span>
              </div>

              <div className="p-2.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
                <span>{`${window.location.origin}/invite/${inviteToken}`}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteToken}`);
                    toast.success("تم نسخ الرابط للحافظة");
                  }}
                  className="h-7 px-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setInviteDialogOpen(false)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateInvite}>
              <div className="space-y-3 py-3 text-xs">
                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    البريد الجامعي للطالب (اختياري لقفل الدعوة)
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@example.edu"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">الدور المطلوب *</label>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                  >
                    <option value={ProjectRole.STUDENT}>طالب (Student)</option>
                    <option value={ProjectRole.SUPERVISOR}>مشرف أكاديمي (Supervisor)</option>
                    <option value={ProjectRole.DEPARTMENT_ADMIN}>إدارة القسم (Department Admin)</option>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" size="sm" onClick={() => setInviteDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  توليد رابط الدعوة
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
