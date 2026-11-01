"use client";

import React, { useState } from "react";
import { SubmissionStatus, RequirementType } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  completeRequirementAction,
  freezeSubmissionAction,
  unfreezeSubmissionAction,
  createSubmissionAction,
} from "@/app/actions/submission-actions";
import {
  Archive,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lock,
  Unlock,
  AlertCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface RequirementItem {
  id: string;
  type: RequirementType;
  title: string;
  description: string | null;
  required: boolean;
  completed: boolean;
  completedAt: Date | string | null;
  completedBy: { name: string } | null;
  documentVersionId: string | null;
  url: string | null;
  documentVersion?: {
    id: string;
    versionNumber: number;
    originalName?: string;
    originalFilename?: string;
    checksumSha256: string;
  } | null;
}

interface SnapshotItem {
  id: string;
  sequence: number;
  readiness: number;
  createdAt: Date | string;
  createdBy: { name: string };
  artifacts: Array<{
    id: string;
    label: string;
    requirementType: RequirementType;
    checksumSha256: string | null;
    completed: boolean;
    url: string | null;
  }>;
}

interface SubmissionItem {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | string;
  status: SubmissionStatus;
  requiresSupervisorApproval: boolean;
  frozenAt: Date | string | null;
  frozenBy: { name: string } | null;
  requirements: RequirementItem[];
  snapshots: SnapshotItem[];
  events: Array<{
    id: string;
    type: string;
    note: string | null;
    createdAt: Date | string;
    actor: { name: string };
  }>;
}

export function SubmissionsView({
  projectId,
  projectSlug,
  initialSubmissions,
  availableDocs,
  userRole,
}: {
  projectId: string;
  projectSlug: string;
  initialSubmissions: SubmissionItem[];
  availableDocs: Array<{ id: string; title: string; currentVersionId?: string | null; latestVersionId?: string | null }>;
  userRole: string;
}) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [selectedId, setSelectedId] = useState<string>(
    initialSubmissions[0]?.id || ""
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [unfreezeReason, setUnfreezeReason] = useState("");
  const [loading, setLoading] = useState(false);

  // New submission form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const activeSubmission = submissions.find((s) => s.id === selectedId);

  const isLeader = userRole === "TEAM_LEADER" || userRole === "SYSTEM_ADMIN";
  const isSupervisor = userRole === "SUPERVISOR" || userRole === "SYSTEM_ADMIN";

  const totalReqs = activeSubmission?.requirements.length || 0;
  const completedReqs = activeSubmission?.requirements.filter((r) => r.completed).length || 0;
  const mandatoryIncomplete =
    activeSubmission?.requirements.filter((r) => r.required && !r.completed) || [];
  const readinessPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 100;

  async function handleToggleRequirement(reqId: string, currentStatus: boolean) {
    if (!activeSubmission) return;
    if (activeSubmission.status === SubmissionStatus.FROZEN) {
      toast.error("الحزمة مجمدة. يجب فك التجميد من قبل المشرف لإجراء تعديلات.");
      return;
    }

    setLoading(true);
    try {
      const res = await completeRequirementAction(
        reqId,
        !currentStatus,
        undefined,
        undefined,
        projectSlug
      );
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((sub) => {
            if (sub.id !== activeSubmission.id) return sub;
            return {
              ...sub,
              requirements: sub.requirements.map((r) =>
                r.id === reqId ? { ...r, completed: !currentStatus } : r
              ),
            };
          })
        );
        toast.success(currentStatus ? "تم إلغاء تأكيد البند" : "تم استيفاء المتطلب بنجاح");
      }
    } catch {
      toast.error("فشل تحديث حالة المتطلب");
    } finally {
      setLoading(false);
    }
  }

  async function handleFreeze() {
    if (!activeSubmission) return;
    if (mandatoryIncomplete.length > 0) {
      toast.error(`لا يمكن التجميد: يوجد ${mandatoryIncomplete.length} متطلب إلزامي غير مكتمل`);
      return;
    }

    setLoading(true);
    try {
      const res = await freezeSubmissionAction(activeSubmission.id, projectSlug);
      if (res.success && res.snapshot) {
        setSubmissions((prev) =>
          prev.map((sub) => {
            if (sub.id !== activeSubmission.id) return sub;
            return {
              ...sub,
              status: SubmissionStatus.FROZEN,
              frozenAt: new Date().toISOString(),
              snapshots: [res.snapshot as any, ...sub.snapshots],
            };
          })
        );
        toast.success("تم تجميد حزمة التسليم وتوليد لقطة تسليم غير قابلة للتعديل (Freeze Snapshot)");
      } else {
        toast.error(res.error || "فشل تجميد حزمة التسليم");
      }
    } catch {
      toast.error("حدث خطأ أثناء تجميد التسليم");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnfreeze() {
    if (!activeSubmission || !unfreezeReason.trim()) return;

    setLoading(true);
    try {
      const res = await unfreezeSubmissionAction(activeSubmission.id, unfreezeReason, projectSlug);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((sub) => {
            if (sub.id !== activeSubmission.id) return sub;
            return {
              ...sub,
              status: SubmissionStatus.PREPARING,
              frozenAt: null,
            };
          })
        );
        setUnfreezeDialogOpen(false);
        setUnfreezeReason("");
        toast.success("تم فك تجميد التسليم وتوثيق سبب الإعادة للمراجعة");
      } else {
        toast.error(res.error || "فشل فك التجميد");
      }
    } catch {
      toast.error("حدث خطأ أثناء فك التجميد");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDeadline) return;

    setLoading(true);
    try {
      const res = await createSubmissionAction(
        {
          projectId,
          title: newTitle,
          description: newDesc,
          deadline: newDeadline,
          requiresSupervisorApproval: true,
          requirements: [
            { type: RequirementType.DOCUMENT, title: "التقرير النهائي الشامل بصيغة PDF", required: true },
            { type: RequirementType.DOCUMENT, title: "أرشيف الكود المصدري والمستودع", required: true },
            { type: RequirementType.DOCUMENT, title: "العرض التقديمي للمناقشة (Slides)", required: true },
            { type: RequirementType.URL, title: "رابط البيئة الحية القابلة للتشغيل", required: false },
          ],
        },
        projectSlug
      );

      if (res.success && res.submission) {
        toast.success("تم إنشاء استحقاق التسليم مع المتطلبات المنهجية");
        setCreateDialogOpen(false);
        setNewTitle("");
        setNewDesc("");
        setNewDeadline("");
        window.location.reload();
      }
    } catch {
      toast.error("فشل إنشاء موعد التسليم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div
        data-guide="submissions-header"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedId(sub.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                selectedId === sub.id
                  ? "bg-[var(--surface-muted)] text-[var(--ink)] border-[var(--border-strong)]"
                  : "bg-transparent text-[var(--ink-secondary)] border-[var(--border)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {sub.title}
            </button>
          ))}
        </div>

        {isLeader && (
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            استحقاق تسليم جديد
          </Button>
        )}
      </div>

      {!activeSubmission ? (
        <Card>
          <CardContent className="py-12 text-center text-xs text-[var(--ink-secondary)]">
            لا توجد استحقاقات تسليم مسجلة حاليًا
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Deliverable Details & Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-guide="submissions-checklist">
              <CardHeader className="pb-3 border-b border-[var(--border)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[var(--ink)]">
                        {activeSubmission.title}
                      </h2>
                      <Badge
                        variant={
                          activeSubmission.status === SubmissionStatus.FROZEN
                            ? "default"
                            : activeSubmission.status === SubmissionStatus.SUBMITTED
                            ? "success"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {activeSubmission.status === SubmissionStatus.FROZEN ? (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> مجمد للتسليم (Frozen)
                          </span>
                        ) : activeSubmission.status === SubmissionStatus.SUBMITTED ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> تم التسليم
                          </span>
                        ) : (
                          "قيد التجهيز (Preparing)"
                        )}
                      </Badge>
                    </div>
                    {activeSubmission.description && (
                      <p className="text-xs text-[var(--ink-secondary)] mt-1">
                        {activeSubmission.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSubmission.status !== SubmissionStatus.FROZEN && isLeader && (
                      <Button
                        size="sm"
                        onClick={handleFreeze}
                        disabled={loading || mandatoryIncomplete.length > 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        اعتماد وإغلاق الحزمة
                      </Button>
                    )}

                    {activeSubmission.status === SubmissionStatus.FROZEN && isSupervisor && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUnfreezeDialogOpen(true)}
                        className="text-amber-600 border-amber-500/30 flex items-center gap-1.5 text-xs"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        فك التجميد للمراجعة
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[var(--ink-secondary)]">جاهزية الحزمة والتسليم:</span>
                    <span className="font-semibold text-[var(--ink)]">
                      {completedReqs} من {totalReqs} متطلبات ({readinessPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        readinessPct === 100
                          ? "bg-[var(--success)]"
                          : readinessPct >= 75
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--gold)]"
                      }`}
                      style={{ width: `${readinessPct}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <h3 className="text-xs font-semibold text-[var(--ink)]">
                  قائمة المتطلبات الإلزامية والاختيارية (Checklist):
                </h3>

                <div className="space-y-2">
                  {activeSubmission.requirements.map((req) => (
                    <div
                      key={req.id}
                      className={`p-3 rounded-lg border transition-colors flex items-start justify-between gap-3 ${
                        req.completed
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : req.required
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-[var(--border)] bg-[var(--surface-muted)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={activeSubmission.status === SubmissionStatus.FROZEN || loading}
                          onClick={() => handleToggleRequirement(req.id, req.completed)}
                          className={`mt-0.5 rounded focus:outline-none transition-colors ${
                            req.completed ? "text-emerald-600" : "text-[var(--ink-tertiary)] hover:text-[var(--ink)]"
                          }`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium ${
                                req.completed ? "line-through text-[var(--ink-secondary)]" : "text-[var(--ink)]"
                              }`}
                            >
                              {req.title}
                            </span>
                            {req.required ? (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1">
                                إلزامي
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1">
                                اختياري
                              </Badge>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                              {req.description}
                            </p>
                          )}
                          {req.documentVersion && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-secondary)]">
                              <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                              <span>{req.documentVersion.originalName || req.documentVersion.originalFilename}</span>
                              <span className="text-[10px] text-[var(--ink-tertiary)]">
                                (v{req.documentVersion.versionNumber} • {req.documentVersion.checksumSha256.slice(0, 8)})
                              </span>
                            </div>
                          )}
                          {req.url && (
                            <a
                              href={req.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>{req.url}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <span className="text-[10px] text-[var(--ink-tertiary)]">
                          {req.completed ? "مستوفى" : "معلق"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submission Snapshots History */}
            <Card data-guide="submissions-snapshots">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[var(--ink)]">
                  <Archive className="h-4 w-4" />
                  سجل النسخ المعتمدة (Submission History)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSubmission.snapshots.length === 0 ? (
                  <p className="text-xs text-[var(--ink-secondary)] py-4 text-center">
                    لم يتم تسجيل أي لقطات تسليم مجمدة بعد. عند تجميد الحزمة، سيتم توثيق لقطة غير قابلة للتعديل مع بصمات SHA-256 للملفات.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeSubmission.snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span className="font-bold text-[var(--ink)]">
                              اللقطة #{snap.sequence} (Snapshot #{snap.sequence})
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              جاهزية {snap.readiness}%
                            </Badge>
                          </div>
                          <span className="text-[11px] text-[var(--ink-secondary)]">
                            {formatDate(snap.createdAt)} بواسطة {snap.createdBy.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                          {snap.artifacts.map((art) => (
                            <div
                              key={art.id}
                              className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] text-[11px]"
                            >
                              <div className="flex items-center justify-between font-medium text-[var(--ink)]">
                                <span>{art.label}</span>
                                <Badge variant="secondary" className="text-[10px]">
                                  {art.requirementType}
                                </Badge>
                              </div>
                              {art.checksumSha256 && (
                                <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-1 truncate">
                                  SHA-256: {art.checksumSha256}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Meta Information & Event Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[var(--ink)]">
                  معلومات الاستحقاق والموعد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-secondary)]">الموعد النهائي:</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {formatDate(activeSubmission.deadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--ink-secondary)]">موافقة المشرف مطلوبة:</span>
                  <span className="text-[var(--ink)]">
                    {activeSubmission.requiresSupervisorApproval ? "نعم (إلزامية)" : "لا"}
                  </span>
                </div>
                {activeSubmission.frozenAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink-secondary)]">تاريخ التجميد:</span>
                    <span className="text-[var(--ink)] font-mono">
                      {formatDate(activeSubmission.frozenAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-[var(--ink)]">
                  <History className="h-4 w-4" />
                  سجل أحداث التسليم (Events)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  {activeSubmission.events.map((ev) => (
                    <div key={ev.id} className="border-s-2 border-[var(--border-strong)] ps-3 py-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--ink)]">{ev.type}</span>
                        <span className="text-[10px] text-[var(--ink-tertiary)]">
                          {formatDate(ev.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-secondary)]">
                        بواسطة {ev.actor.name} {ev.note ? `• ${ev.note}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Unfreeze Dialog (Supervisor only) */}
      <Dialog open={unfreezeDialogOpen} onOpenChange={setUnfreezeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              فك تجميد حزمة التسليم (Supervisor Unfreeze Authorization)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs py-2">
            <p className="text-[var(--ink-secondary)]">
              بصفتك المشرف الأكاديمي، سيؤدي فك التجميد إلى تمكين الفريق من تعديل واستبدال الوثائق والملفات قبل التسليم النهائي. يرجى توثيق سبب الإعادة:
            </p>
            <Textarea
              rows={3}
              value={unfreezeReason}
              onChange={(e) => setUnfreezeReason(e.target.value)}
              placeholder="مثال: يرجى استكمال قسم دراسة الجدوى وتصحيح المراجع في الفصل الرابع..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setUnfreezeDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              size="sm"
              disabled={loading || !unfreezeReason.trim()}
              onClick={handleUnfreeze}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              تأكيد فك التجميد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Submission Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateSubmission}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">
                إضافة استحقاق تسليم جديد (New Deliverable)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">عنوان التسليم *</label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: التسليم النهائي لمشروع التخرج"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">الموعد النهائي *</label>
                <Input
                  type="datetime-local"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">الوصف أو التعليمات</label>
                <Textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="تعليمات أو اشتراطات القسم العلمي للتسليم..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                إنشاء الاستحقاق
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
