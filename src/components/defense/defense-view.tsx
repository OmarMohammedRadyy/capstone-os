"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DefenseChecklistCategory, DefenseSectionStatus } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  updateDefensePlanAction,
  addDefenseSectionAction,
  toggleChecklistItemAction,
  addDefenseQuestionAction,
} from "@/app/actions/defense-actions";
import {
  Presentation,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  HelpCircle,
  Plus,
  ExternalLink,
  Laptop,
  Radio,
  FileText,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface DefenseSectionItem {
  id: string;
  order: number;
  title: string;
  durationMinutes: number;
  status: DefenseSectionStatus;
  notes: string | null;
  ownerId: string | null;
  owner?: { name: string } | null;
}

interface ChecklistItem {
  id: string;
  order: number;
  category: DefenseChecklistCategory;
  title: string;
  done: boolean;
  doneAt: Date | string | null;
}

interface DefenseQuestionItem {
  id: string;
  order: number;
  question: string;
  answerNotes: string | null;
  ownerId: string | null;
  owner?: { name: string } | null;
}

interface DefensePlanData {
  id: string;
  defenseAt: Date | string | null;
  location: string | null;
  durationMinutes: number;
  demoScript: string | null;
  backupPlan: string | null;
  buildUrl: string | null;
  sections: DefenseSectionItem[];
  checklist: ChecklistItem[];
  questions: DefenseQuestionItem[];
}

export function DefenseView({
  projectId,
  projectSlug,
  plan,
  teamMembers,
  readinessPct,
}: {
  projectId: string;
  projectSlug: string;
  plan: DefensePlanData;
  teamMembers: Array<{ userId: string; name: string }>;
  readinessPct: number;
}) {
  const [defensePlan, setDefensePlan] = useState<DefensePlanData>(plan);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);

  // Section form
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionMinutes, setNewSectionMinutes] = useState(3);
  const [newSectionOwner, setNewSectionOwner] = useState("");
  const [newSectionNotes, setNewSectionNotes] = useState("");

  // Question form
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionAnswer, setNewQuestionAnswer] = useState("");
  const [newQuestionOwner, setNewQuestionOwner] = useState("");

  // Edit plan form
  const [editDate, setEditDate] = useState(
    plan.defenseAt ? new Date(plan.defenseAt).toISOString().slice(0, 16) : ""
  );
  const [editLocation, setEditLocation] = useState(plan.location || "");
  const [editDemoScript, setEditDemoScript] = useState(plan.demoScript || "");
  const [editBackupPlan, setEditBackupPlan] = useState(plan.backupPlan || "");
  const [editBuildUrl, setEditBuildUrl] = useState(plan.buildUrl || "");

  const totalPresentationMinutes = defensePlan.sections.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );

  async function handleToggleChecklist(itemId: string, currentDone: boolean) {
    setLoading(true);
    try {
      const res = await toggleChecklistItemAction(itemId, !currentDone, projectSlug);
      if (res.success) {
        setDefensePlan((prev) => ({
          ...prev,
          checklist: prev.checklist.map((c) =>
            c.id === itemId ? { ...c, done: !currentDone } : c
          ),
        }));
        toast.success(currentDone ? "تم إلغاء تفعيل البند" : "تم استيفاء جاهزية البند");
      }
    } catch {
      toast.error("فشل تحديث البند");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setLoading(true);
    try {
      const res = await addDefenseSectionAction(
        projectId,
        projectSlug,
        newSectionTitle,
        newSectionOwner || null,
        Number(newSectionMinutes),
        newSectionNotes
      );
      if (res.success && res.section) {
        const ownerObj = teamMembers.find((m) => m.userId === newSectionOwner);
        setDefensePlan((prev) => ({
          ...prev,
          sections: [
            ...prev.sections,
            { ...res.section, owner: ownerObj ? { name: ownerObj.name } : null } as any,
          ],
        }));
        setSectionDialogOpen(false);
        setNewSectionTitle("");
        setNewSectionMinutes(3);
        setNewSectionNotes("");
        toast.success("تمت إضافة قسم العرض التقديمي وتحديد المتحدث");
      }
    } catch {
      toast.error("فشل إضافة القسم");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setLoading(true);
    try {
      const res = await addDefenseQuestionAction(
        projectId,
        projectSlug,
        newQuestionText,
        newQuestionAnswer,
        newQuestionOwner || null
      );
      if (res.success && res.question) {
        const ownerObj = teamMembers.find((m) => m.userId === newQuestionOwner);
        setDefensePlan((prev) => ({
          ...prev,
          questions: [
            ...prev.questions,
            { ...res.question, owner: ownerObj ? { name: ownerObj.name } : null } as any,
          ],
        }));
        setQuestionDialogOpen(false);
        setNewQuestionText("");
        setNewQuestionAnswer("");
        toast.success("تمت إضافة السؤال المتوقع والإجابة النموذجية");
      }
    } catch {
      toast.error("فشل حفظ السؤال");
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePlanDetails(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateDefensePlanAction(
        projectId,
        projectSlug,
        editDate || null,
        editLocation,
        editDemoScript,
        editBackupPlan,
        editBuildUrl
      );
      if (res.success) {
        setDefensePlan((prev) => ({
          ...prev,
          defenseAt: editDate || null,
          location: editLocation,
          demoScript: editDemoScript,
          backupPlan: editBackupPlan,
          buildUrl: editBuildUrl,
        }));
        setEditPlanDialogOpen(false);
        toast.success("تم تحديث خطة المناقشة وتجهيزات العرض");
      }
    } catch {
      toast.error("فشل تحديث الخطة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Readiness summary */}
      <div
        data-guide="defense-hero"
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)]">
            <Presentation className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--ink)]">
                خطة المناقشة والعرض التقديمي
              </h2>
              <Badge variant="outline" className="text-xs">
                نسبة الجاهزية: {readinessPct}%
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-secondary)] mt-1">
              {defensePlan.defenseAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(defensePlan.defenseAt)}
                </span>
              )}
              {defensePlan.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {defensePlan.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Laptop className="h-3.5 w-3.5" />
                وقت العرض الإجمالي: {totalPresentationMinutes} دقيقة
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditPlanDialogOpen(true)}
            className="text-xs"
          >
            تعديل بيانات المناقشة
          </Button>

          <Link href={`/app/p/${projectSlug}/defense/present`} target="_blank">
            <Button size="sm" className="bg-[var(--ink)] text-[var(--surface)] flex items-center gap-1.5 text-xs">
              <Tv className="h-3.5 w-3.5" />
              وضع العرض أمام اللجنة (Present Mode)
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timed Presentation Flow & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timed Presentation Sections */}
          <Card data-guide="defense-sections">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    توزيع محاور العرض والتوقيت لكل طالب (Speaker Sections)
                  </CardTitle>
                  <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                    الالتزام الدقيق بالوقت المخصص (15 دقيقة إجمالية) وتحديد مسؤولية كل متحدث
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSectionDialogOpen(true)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة محور
                </Button>
              </div>

              {/* Speaker duration visual bar */}
              {defensePlan.sections.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--surface-muted)]">
                    {defensePlan.sections.map((sec, idx) => {
                      const pct =
                        totalPresentationMinutes > 0
                          ? (sec.durationMinutes / totalPresentationMinutes) * 100
                          : 0;
                      const colors = [
                        "bg-[#163A24] dark:bg-[#34A866]",
                        "bg-[#C89B2C] dark:bg-[#DFB244]",
                        "bg-[#B4653A] dark:bg-[#D48256]",
                        "bg-[#276741] dark:bg-[#52BF80]",
                        "bg-[#4A544E] dark:bg-[#9BA8A0]",
                      ];
                      return (
                        <div
                          key={sec.id}
                          style={{ width: `${pct}%` }}
                          className={`${colors[idx % colors.length]} transition-all`}
                          title={`${sec.title} (${sec.durationMinutes} دقيقة)`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {defensePlan.sections.length === 0 ? (
                <p className="text-xs text-[var(--ink-secondary)] py-6 text-center">
                  لم يتم تقسيم محاور العرض التقديمي بعد. أضف المحاور وحدد المتحدثين ودقائق الإلقاء.
                </p>
              ) : (
                <div className="space-y-2">
                  {defensePlan.sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[var(--surface-muted)] text-[var(--ink)] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ink)]">{section.title}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {section.durationMinutes} دقائق
                            </Badge>
                          </div>
                          {section.notes && (
                            <p className="text-[11px] text-[var(--ink-secondary)] mt-1">
                              {section.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {section.owner?.name || "غير محدد"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expected Jury Questions & Prepared Answers */}
          <Card data-guide="defense-questions">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    بنك أسئلة المناقشة المتوقعة (Jury Q&A Bank)
                  </CardTitle>
                  <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                    الأسئلة العلمية والفنية المتوقعة من لجنة التحكيم مع نقاط الرد المجهزة
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuestionDialogOpen(true)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة سؤال
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {defensePlan.questions.length === 0 ? (
                <p className="text-xs text-[var(--ink-secondary)] py-6 text-center">
                  لا توجد أسئلة مسجلة. يمكنك توثيق الأسئلة المتوقعة وتحديد العضو المسؤول عن الإجابة.
                </p>
              ) : (
                <div className="space-y-3">
                  {defensePlan.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[var(--ink)] flex items-center gap-2">
                          <span className="text-[var(--ink-tertiary)] font-mono">#{idx + 1}</span>
                          <span>{q.question}</span>
                        </div>
                        {q.owner && (
                          <Badge variant="outline" className="text-[11px] shrink-0">
                            المسؤول: {q.owner.name}
                          </Badge>
                        )}
                      </div>
                      {q.answerNotes && (
                        <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--ink-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--ink)] block mb-1">
                            الرد المقترح:
                          </span>
                          {q.answerNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Checklist & Demo Contingency */}
        <div className="space-y-6">
          {/* Equipment & Materials Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[var(--ink)]">
                <CheckCircle2 className="h-4 w-4" />
                قائمة فحص الجاهزية (Defense Checklist)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              {defensePlan.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id, item.done)}
                  className={`p-2.5 rounded border transition-colors flex items-start gap-2.5 cursor-pointer text-xs ${
                    item.done
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--ink)]"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      item.done ? "text-emerald-600" : "text-[var(--ink-tertiary)]"
                    }`}
                  />
                  <div>
                    <span className={item.done ? "line-through opacity-80" : "font-medium"}>
                      {item.title}
                    </span>
                    <Badge variant="secondary" className="text-[9px] ms-2">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Offline Contingency & Demo Script */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[var(--ink)]">
                <Radio className="h-4 w-4" />
                خطة الطوارئ وسيناريو العرض الحي (Demo Plan)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[var(--ink)] block mb-1">
                  سيناريو التشغيل الحي (Walkthrough Script):
                </span>
                <p className="text-[var(--ink-secondary)] bg-[var(--surface-muted)] p-2.5 rounded border border-[var(--border)] leading-relaxed">
                  {defensePlan.demoScript || "لم يتم توثيق السيناريو التفصيلي بعد."}
                </p>
              </div>

              <div>
                <span className="font-semibold text-amber-600 block mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  خطة الطوارئ حال انقطاع الإنترنت (Offline Fallback):
                </span>
                <p className="text-[var(--ink-secondary)] bg-[var(--surface-muted)] p-2.5 rounded border border-[var(--border)] leading-relaxed">
                  {defensePlan.backupPlan || "تشغيل نسخة Docker محلية مع تسجيل فيديو بديل للشاشات."}
                </p>
              </div>

              {defensePlan.buildUrl && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <a
                    href={defensePlan.buildUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    رابط المنظومة الحية للعرض (Live URL)
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanDialogOpen} onOpenChange={setEditPlanDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSavePlanDetails}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                تعديل بيانات المناقشة وخطة الطوارئ
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">موعد المناقشة</label>
                <Input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">المكان / القاعة</label>
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="مثال: مدرج كلية الحاسبات 3B"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">رابط النسخة الحية</label>
                <Input
                  value={editBuildUrl}
                  onChange={(e) => setEditBuildUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">سيناريو العرض الحي (Demo Script)</label>
                <Textarea
                  rows={2}
                  value={editDemoScript}
                  onChange={(e) => setEditDemoScript(e.target.value)}
                  placeholder="الخطوات التسلسلية للعرض التوضيحي..."
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">خطة الطوارئ دون اتصال (Offline Backup Plan)</label>
                <Textarea
                  rows={2}
                  value={editBackupPlan}
                  onChange={(e) => setEditBackupPlan(e.target.value)}
                  placeholder="خطوات التشغيل المحلي في حال انقطاع الشبكة..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditPlanDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddSection}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">إضافة محور عرض تقديمي</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">عنوان المحور *</label>
                <Input
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="مثال: التصميم المعماري وقاعدة البيانات"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">المدة (بالدقائق) *</label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={newSectionMinutes}
                    onChange={(e) => setNewSectionMinutes(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[var(--ink)] font-medium mb-1">المتحدث المسؤول</label>
                  <Select
                    value={newSectionOwner}
                    onChange={(e) => setNewSectionOwner(e.target.value)}
                  >
                    <option value="">اختر عضواً...</option>
                    {teamMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">ملاحظات ومحاور التركيز</label>
                <Textarea
                  rows={2}
                  value={newSectionNotes}
                  onChange={(e) => setNewSectionNotes(e.target.value)}
                  placeholder="النقاط الجوهرية الواجب إبرازها..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSectionDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                إضافة المحور
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddQuestion}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">إضافة سؤال متوقع للجنة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">السؤال المتوقع *</label>
                <Input
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="مثال: كيف تعاملتم مع تزامن البيانات عند انقطاع الاتصال؟"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">المسؤول عن الرد</label>
                <Select
                  value={newQuestionOwner}
                  onChange={(e) => setNewQuestionOwner(e.target.value)}
                >
                  <option value="">اختر عضواً...</option>
                  {teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">الرد النموذجي المقترح</label>
                <Textarea
                  rows={3}
                  value={newQuestionAnswer}
                  onChange={(e) => setNewQuestionAnswer(e.target.value)}
                  placeholder="النقاط الفنية الدقيقة للإجابة..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setQuestionDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                حفظ السؤال
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
