"use client";

import React, { useState } from "react";
import { MilestoneStatus, ProjectRole } from "@/generated/prisma/enums";
import { emitGuideAction } from "@/features/user-guide";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  approveMilestoneAction,
  requestChangesMilestoneAction,
  requestMilestoneApprovalAction,
  addEvidenceAction,
} from "@/app/actions/milestone-actions";
import {
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Link as LinkIcon,
  Plus,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";

interface MilestoneItem {
  id: string;
  title: string;
  objective: string | null;
  acceptanceCriteria: string | null;
  status: MilestoneStatus;
  dueDate: Date | string;
  order: number;
  owner: { id: string; name: string } | null;
  evidence: Array<{ id: string; url: string | null; note: string | null }>;
  approvals: Array<{ id: string; action: string; comment: string | null; createdAt: Date | string; actor: { name: string } }>;
  tasks: Array<{ id: string; status: string }>;
}

interface PhaseItem {
  id: string;
  name: string;
  order: number;
  status: string;
}

export function RoadmapView({
  projectSlug,
  userRole,
  phases,
  milestones,
}: {
  projectSlug: string;
  userRole: string;
  phases: PhaseItem[];
  milestones: MilestoneItem[];
}) {
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [changesModalOpen, setChangesModalOpen] = useState(false);

  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [changesReason, setChangesReason] = useState("");

  const isSupervisor = userRole === ProjectRole.SUPERVISOR;
  const isLeader = userRole === ProjectRole.TEAM_LEADER;

  const handleApprove = async (id: string) => {
    try {
      await approveMilestoneAction(id, projectSlug);
      toast.success("Milestone approved officially.");
      setSelectedMilestone(null);
    } catch {
      toast.error("Failed to approve milestone.");
    }
  };

  const handleRequestApproval = async (id: string) => {
    try {
      await requestMilestoneApprovalAction(id, projectSlug);
      toast.success("Submitted for supervisor approval.");
      setSelectedMilestone(null);
    } catch {
      toast.error("Failed to request approval.");
    }
  };

  const submitChanges = async () => {
    if (!selectedMilestone || !changesReason.trim()) return;
    try {
      await requestChangesMilestoneAction(selectedMilestone.id, projectSlug, changesReason.trim());
      toast.success("Changes requested and feedback logged.");
      setChangesModalOpen(false);
      setSelectedMilestone(null);
      setChangesReason("");
    } catch {
      toast.error("Failed to submit change request.");
    }
  };

  const submitEvidence = async () => {
    if (!selectedMilestone) return;
    try {
      await addEvidenceAction(selectedMilestone.id, projectSlug, evidenceUrl, evidenceNote);
      toast.success("Evidence deliverable attached.");
      setEvidenceModalOpen(false);
      setEvidenceUrl("");
      setEvidenceNote("");
    } catch {
      toast.error("Failed to attach evidence.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Phases Progress Rail */}
      <div
        data-guide="roadmap-phases-rail"
        className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] p-4 overflow-x-auto"
      >
        <h3 className="text-xs font-bold text-[var(--ink)] mb-3">
          مراحل المشروع (Project Phases)
        </h3>
        <div className="flex items-center min-w-[700px] gap-2">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="flex-1 flex flex-col items-center text-center">
              <div
                className={`h-2.5 w-full rounded-full mb-2 ${
                  phase.status === "COMPLETED"
                    ? "bg-[var(--success)]"
                    : phase.status === "IN_PROGRESS"
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--surface-hover)]"
                }`}
              />
              <span className="text-[11px] font-bold text-[var(--ink)] truncate max-w-[90px]">
                {idx + 1}. {phase.name}
              </span>
              <span className="text-[10px] text-[var(--ink-secondary)]">
                {phase.status === "COMPLETED" ? "منتهية" : phase.status === "IN_PROGRESS" ? "جارية" : "قادمة"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Chronological List */}
      <div data-guide="roadmap-milestones-list" className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--ink)]">
          التسليمات المرحلية المعتمدة (Milestones: {milestones.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((ms) => {
            const isCompleted = ms.status === MilestoneStatus.COMPLETED;
            const isAwaiting = ms.status === MilestoneStatus.AWAITING_APPROVAL;
            const isAtRisk = ms.status === MilestoneStatus.AT_RISK;

            return (
              <Card
                key={ms.id}
                interactive
                onClick={() => {
                  setSelectedMilestone(ms);
                  emitGuideAction("milestone.selected", { milestoneId: ms.id });
                }}
                className={`p-4 flex flex-col justify-between ${
                  isAwaiting ? "border-[var(--accent)] shadow-xs" : isAtRisk ? "border-[var(--warning)]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={isCompleted ? "success" : isAwaiting ? "accent" : isAtRisk ? "warning" : "default"}
                      size="sm"
                    >
                      {ms.status}
                    </Badge>
                    <span className="text-xs text-[var(--ink-secondary)] font-medium">
                      استحقاق: {formatDate(ms.dueDate, "ar")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--ink)] mb-1">
                    {ms.title}
                  </h3>
                  <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-3">
                    {ms.objective || "محطة رئيسية ضمن خطة المشروع الأكاديمي."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>{ms.evidence.length} أدلة ومخرجات</span>
                  </span>
                  <span className="font-semibold text-[var(--accent)]">
                    عرض التفاصيل والاعتماد ←
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Milestone Detail Modal & Supervisor Approvals */}
      {selectedMilestone && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="accent">{selectedMilestone.status}</Badge>
                <span className="text-xs text-[var(--ink-secondary)]">
                  تاريخ الاستحقاق: {formatDate(selectedMilestone.dueDate, "ar")}
                </span>
              </div>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                {selectedMilestone.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start">
              {selectedMilestone.objective && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--ink)] mb-1">الهدف الأكاديمي:</h4>
                  <p className="text-xs text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)] leading-relaxed">
                    {selectedMilestone.objective}
                  </p>
                </div>
              )}

              {/* Evidence Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[var(--ink)]">
                    الأدلة والمخرجات المرفقة ({selectedMilestone.evidence.length}):
                  </h4>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setEvidenceModalOpen(true)}
                    leftIcon={<Plus className="h-3 w-3" />}
                  >
                    إرفاق مخرج
                  </Button>
                </div>

                {selectedMilestone.evidence.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedMilestone.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-[var(--ink)]">
                          {ev.note || ev.url || "مستند رسمي معتمد"}
                        </span>
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <LinkIcon className="h-3 w-3" />
                            <span>فتح الرابط</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--ink-muted)] p-2 rounded bg-[var(--surface-subtle)]">
                    لم يتم إرفاق أدلة أو ملفات تسليم بعد.
                  </p>
                )}
              </div>

              {/* Approvals History */}
              {selectedMilestone.approvals.length > 0 && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <h4 className="text-xs font-bold text-[var(--ink)] mb-2">
                    سجل الاعتمادات والملاحظات الأكاديمية:
                  </h4>
                  <div className="space-y-2">
                    {selectedMilestone.approvals.map((app) => (
                      <div key={app.id} className="p-2 rounded bg-[var(--surface-subtle)] text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[var(--ink)]">{app.actor.name}</span>
                          <span className="text-[10px] text-[var(--ink-muted)]">
                            {formatDate(app.createdAt, "ar")}
                          </span>
                        </div>
                        <Badge
                          variant={app.action === "APPROVED" ? "success" : "warning"}
                          size="sm"
                          className="mb-1"
                        >
                          {app.action}
                        </Badge>
                        {app.comment && (
                          <p className="text-xs text-[var(--ink-secondary)] mt-1">{app.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Action Bar */}
            <DialogFooter className="flex flex-wrap gap-2 pt-3">
              {/* Supervisor Actions */}
              {isSupervisor && selectedMilestone.status !== "COMPLETED" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setChangesModalOpen(true)}
                  >
                    طلب تعديلات (Request Changes)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedMilestone.id)}
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                  >
                    اعتماد المحطة رسميًا (Approve)
                  </Button>
                </>
              )}

              {/* Student / Leader Actions */}
              {!isSupervisor && selectedMilestone.status !== "COMPLETED" && selectedMilestone.status !== "AWAITING_APPROVAL" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRequestApproval(selectedMilestone.id)}
                >
                  طلب اعتماد المشرف (Submit for Approval)
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setSelectedMilestone(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Evidence Modal */}
      {evidenceModalOpen && (
        <Dialog open={true} onOpenChange={() => setEvidenceModalOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--ink)]">
                إرفاق دليل أو رابط تسليم (Add Evidence)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-start">
              <Input
                label="رابط المخرج أو المعاينة (URL)"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://github.com/... or cloud link"
              />
              <Textarea
                label="ملاحظات توضيحية حول المخرج"
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                placeholder="تفاصيل التقرير أو ما تم إنجازه في هذه المحطة..."
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEvidenceModalOpen(false)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={submitEvidence}>
                حفظ الدليل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Request Changes Modal */}
      {changesModalOpen && (
        <Dialog open={true} onOpenChange={() => setChangesModalOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--danger)] flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4" />
                <span>طلب تعديلات من المشرف الأكاديمي</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2 text-start">
              <p className="text-xs text-[var(--ink-secondary)]">
                سيتم تحويل حالة المحطة إلى معرضة للخطر وتسجيل ملاحظة مشرف ملزمة للفريق.
              </p>
              <Textarea
                value={changesReason}
                onChange={(e) => setChangesReason(e.target.value)}
                placeholder="وضح أسباب عدم الاعتماد والتعديلات المطلوبة من الطلاب..."
                required
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setChangesModalOpen(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={submitChanges}
                disabled={!changesReason.trim()}
              >
                إرسال طلب التعديل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
