"use client";

import React, { useState } from "react";
import { FeedbackStatus, FeedbackSeverity, FeedbackCategory, ProjectRole } from "@/generated/prisma/enums";
import { emitGuideAction } from "@/features/user-guide";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import {
  createFeedbackAction,
  resolveFeedbackAction,
  verifyFeedbackAction,
  reopenFeedbackAction,
} from "@/app/actions/feedback-actions";
import {
  MessageSquare,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
  Plus,
  ShieldCheck,
  FileCheck,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  title: string;
  body: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  createdAt: Date | string;
  resolutionNote: string | null;
  evidenceUrl: string | null;
  reopenCount: number;
  author: { name: string };
  assignee: { name: string } | null;
}

export function FeedbackInbox({
  projectId,
  projectSlug,
  userRole,
  initialFeedback,
  members,
}: {
  projectId: string;
  projectSlug: string;
  userRole: string;
  initialFeedback: FeedbackItem[];
  members: Array<{ userId: string; user: { name: string } }>;
}) {
  const [items, setItems] = useState<FeedbackItem[]>(initialFeedback);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);

  const [resolveNote, setResolveNote] = useState("");
  const [resolveUrl, setResolveUrl] = useState("");
  const [reopenReason, setReopenReason] = useState("");

  const isSupervisor = userRole === ProjectRole.SUPERVISOR;

  const filtered = items.filter((f) => {
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
    const matchesSeverity = severityFilter === "ALL" || f.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const handleVerify = async (id: string) => {
    try {
      await verifyFeedbackAction(id, projectSlug);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: FeedbackStatus.VERIFIED } : i))
      );
      toast.success("Feedback verified and approved.");
      setSelectedItem(null);
    } catch {
      toast.error("Failed to verify feedback.");
    }
  };

  const submitResolve = async () => {
    if (!selectedItem || !resolveNote.trim()) return;
    try {
      await resolveFeedbackAction(selectedItem.id, projectSlug, resolveNote.trim(), resolveUrl);
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? { ...i, status: FeedbackStatus.AWAITING_VERIFICATION, resolutionNote: resolveNote.trim(), evidenceUrl: resolveUrl }
            : i
        )
      );
      toast.success("Resolution submitted for supervisor verification.");
      setIsResolveOpen(false);
      setSelectedItem(null);
      setResolveNote("");
      setResolveUrl("");
    } catch {
      toast.error("Failed to resolve feedback.");
    }
  };

  const submitReopen = async () => {
    if (!selectedItem || !reopenReason.trim()) return;
    try {
      await reopenFeedbackAction(selectedItem.id, projectSlug, reopenReason.trim());
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? { ...i, status: FeedbackStatus.OPEN, reopenCount: i.reopenCount + 1 }
            : i
        )
      );
      toast.success("Feedback reopened.");
      setIsReopenOpen(false);
      setSelectedItem(null);
      setReopenReason("");
    } catch {
      toast.error("Failed to reopen feedback.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Action Bar */}
      <div
        data-guide="feedback-filter-bar"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:outline-none"
          >
            <option value="ALL">جميع الحالات (All Statuses)</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--ink)] focus:outline-none"
          >
            <option value="ALL">جميع مستويات الأهمية (All Severities)</option>
            <option value="BLOCKING">حرجة (Blocking)</option>
            <option value="IMPORTANT">مهمة (Important)</option>
            <option value="NOTE">ملاحظة (Note)</option>
          </select>
        </div>

        {isSupervisor && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            إضافة ملاحظة مشرف جديدة
          </Button>
        )}
      </div>

      {/* Feedback List */}
      <div data-guide="feedback-list" className="space-y-3">
        {filtered.map((item) => {
          const isBlocking = item.severity === FeedbackSeverity.BLOCKING;
          const isVerified = item.status === FeedbackStatus.VERIFIED;

          return (
            <Card
              key={item.id}
              interactive
              onClick={() => {
                setSelectedItem(item);
                emitGuideAction("feedback.selected", { feedbackId: item.id });
              }}
              className={`p-4 transition-all text-start ${isBlocking && !isVerified
                  ? "border-[var(--danger)]/50 bg-[var(--danger-subtle)]/10"
                  : ""
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isBlocking ? "danger" : item.severity === "IMPORTANT" ? "warning" : "default"}
                    size="sm"
                  >
                    {item.severity}
                  </Badge>
                  <Badge variant={isVerified ? "success" : "accent"} size="sm">
                    {item.status}
                  </Badge>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    {item.category}
                  </span>
                </div>

                <div className="text-xs text-[var(--ink-secondary)]">
                  <span>المشرف: {item.author.name}</span> • <span>{formatDate(item.createdAt, "ar")}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[var(--ink)] mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-3">
                {item.body}
              </p>

              {item.resolutionNote && (
                <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--ink)] mt-2">
                  <span className="font-bold text-[var(--success)]">تفاصيل الحل: </span>
                  <span>{item.resolutionNote}</span>
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-[var(--surface-subtle)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-xs text-[var(--ink-secondary)]">
            لا توجد ملاحظات مشرف تطابق شروط التصفية المحددة.
          </div>
        )}
      </div>

      {/* Feedback Detail & Verification Dialog */}
      {selectedItem && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={selectedItem.severity === "BLOCKING" ? "danger" : "warning"}>
                  {selectedItem.severity}
                </Badge>
                <Badge variant="accent">{selectedItem.status}</Badge>
                <span className="text-xs text-[var(--ink-secondary)]">{selectedItem.category}</span>
              </div>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                {selectedItem.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start">
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)] mb-1">تفاصيل الملاحظة من المشرف:</h4>
                <p className="text-xs text-[var(--ink-secondary)] p-3 rounded bg-[var(--surface-subtle)] leading-relaxed whitespace-pre-line">
                  {selectedItem.body}
                </p>
              </div>

              {selectedItem.resolutionNote && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--success)] mb-1">رد الفريق وتفاصيل الحل:</h4>
                  <p className="text-xs text-[var(--ink-secondary)] p-3 rounded bg-[var(--success-subtle)] leading-relaxed">
                    {selectedItem.resolutionNote}
                  </p>
                  {selectedItem.evidenceUrl && (
                    <a
                      href={selectedItem.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent)] hover:underline mt-1.5 block font-semibold"
                    >
                      رابط دليل المخرج المُرفق ←
                    </a>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-wrap gap-2 pt-3">
              {/* Supervisor Actions */}
              {isSupervisor && selectedItem.status !== FeedbackStatus.VERIFIED && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleVerify(selectedItem.id)}
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                  >
                    تأكيد واعتماد الحل (Verify)
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsReopenOpen(true)}
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                  >
                    إعادة فتح الملاحظة (Reopen)
                  </Button>
                </>
              )}

              {/* Student Action */}
              {!isSupervisor && selectedItem.status !== FeedbackStatus.VERIFIED && selectedItem.status !== FeedbackStatus.AWAITING_VERIFICATION && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsResolveOpen(true)}
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                >
                  حل الملاحظة وإرفاق الأدلة (Resolve)
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve Feedback Modal */}
      {isResolveOpen && (
        <Dialog open={true} onOpenChange={() => setIsResolveOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--ink)]">
                حل وتصحيح ملاحظة المشرف
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-start">
              <Textarea
                label="تفاصيل الحل والإجراءات المتخذة"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="وضح التعديلات التي قمت بها في التقرير أو الكود لتلبية طلب المشرف..."
                required
              />
              <Input
                label="رابط دليل الإنجاز أو المخرج (اختياري)"
                value={resolveUrl}
                onChange={(e) => setResolveUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsResolveOpen(false)}>إلغاء</Button>
              <Button variant="primary" onClick={submitResolve} disabled={!resolveNote.trim()}>
                إرسال للتأكيد الأكاديمي
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reopen Feedback Modal */}
      {isReopenOpen && (
        <Dialog open={true} onOpenChange={() => setIsReopenOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--danger)]">
                أسباب إعادة فتح الملاحظة
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-start">
              <Textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="وضح ما زال ناقصًا أو لم يستوفِ المعايير المطلوبة..."
                required
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsReopenOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={submitReopen} disabled={!reopenReason.trim()}>
                إعادة فتح الملاحظة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Feedback Modal for Supervisor */}
      {isCreateOpen && (
        <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                إضافة ملاحظة مشرف أكاديمية
              </DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                const res = await createFeedbackAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Feedback created successfully");
                  setIsCreateOpen(false);
                } else {
                  toast.error(res.error || "Failed to create feedback");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان الملاحظة" name="title" required placeholder="e.g. Incomplete section in Report" />
              <Textarea label="تفاصيل الملاحظة والتوجيهات" name="body" required placeholder="Technical guidance..." />

              <div className="grid grid-cols-2 gap-3">
                <Select label="مستوى الأهمية (Severity)" name="severity">
                  <option value="IMPORTANT">Important</option>
                  <option value="BLOCKING">Blocking (حرج للتسليم)</option>
                  <option value="NOTE">Note (توجيهي)</option>
                </Select>

                <Select label="التصنيف الأكاديمي" name="category">
                  <option value="REQUIREMENTS">Requirements</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="UI_UX">UI/UX</option>
                  <option value="RESEARCH">Research</option>
                  <option value="PRESENTATION">Presentation</option>
                  <option value="SCOPE">Scope</option>
                </Select>
              </div>

              <Select label="إسناد لطالب محدد" name="assigneeId">
                <option value="">(الفريق بالكامل)</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </Select>

              <DialogFooter className="pt-3">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ الملاحظة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
