"use client";

import React, { useState } from "react";
import { MeetingType, MeetingStatus, ActionItemStatus } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  createMeetingAction,
  convertActionToTaskAction,
  addMeetingActionItemAction,
} from "@/app/actions/meeting-actions";
import {
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  ArrowRight,
  Plus,
  Users,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface MeetingItem {
  id: string;
  type: MeetingType;
  title: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  location: string | null;
  agenda: string | null;
  notes: string | null;
  status: MeetingStatus;
  actions: Array<{
    id: string;
    text: string;
    status: ActionItemStatus;
    task: { id: string; number: number } | null;
    owner: { name: string } | null;
  }>;
  attendees: Array<{ user: { name: string }; attendance: string }>;
}

export function MeetingsView({
  projectId,
  projectSlug,
  initialMeetings,
  members,
}: {
  projectId: string;
  projectSlug: string;
  initialMeetings: MeetingItem[];
  members: Array<{ userId: string; user: { name: string } }>;
}) {
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newActionText, setNewActionText] = useState("");
  const [newActionOwner, setNewActionOwner] = useState("");

  const handleConvertAction = async (actionId: string) => {
    try {
      await convertActionToTaskAction(actionId, projectSlug);
      toast.success("Action item converted to formal Task with traceability link.");
      if (selectedMeeting) {
        setSelectedMeeting({
          ...selectedMeeting,
          actions: selectedMeeting.actions.map((a) =>
            a.id === actionId ? { ...a, task: { id: "new", number: 99 } } : a
          ),
        });
      }
    } catch {
      toast.error("Failed to convert action item to task.");
    }
  };

  const handleAddAction = async () => {
    if (!selectedMeeting || !newActionText.trim()) return;
    try {
      await addMeetingActionItemAction(
        selectedMeeting.id,
        projectSlug,
        newActionText.trim(),
        newActionOwner || undefined
      );
      toast.success("Action item added to meeting minutes.");
      setNewActionText("");
      setNewActionOwner("");
    } catch {
      toast.error("Failed to add action item.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <span className="text-xs font-semibold text-[var(--ink-secondary)]">
          سجل الاجتماعات والمحاضر الرسمية ({meetings.length})
        </span>

        <Button
          data-guide="meetings-create-btn"
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          جدولة اجتماع جديد
        </Button>
      </div>

      {/* Meetings Grid */}
      <div
        data-guide="meetings-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {meetings.map((m) => (
          <Card
            key={m.id}
            interactive
            onClick={() => setSelectedMeeting(m)}
            className="p-4 flex flex-col justify-between text-start"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant={m.type === "SUPERVISOR" ? "accent" : "default"} size="sm">
                  {m.type}
                </Badge>
                <Badge variant={m.status === "COMPLETED" ? "success" : "default"} size="sm">
                  {m.status}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-[var(--ink)] mb-1">{m.title}</h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-secondary)] my-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>{formatDateTime(m.scheduledAt, "ar")}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{m.durationMinutes} دقيقة</span>
                </span>
                {m.location && (
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{m.location}</span>
                  </span>
                )}
              </div>

              {m.notes && (
                <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 bg-[var(--surface-subtle)] p-2 rounded mt-2">
                  المحضر: {m.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
              <span>{m.actions.length} تكليفات وإجراءات</span>
              <span className="text-[var(--accent)] font-semibold">عرض المحضر ←</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Meeting Detail & Action Conversion Dialog */}
      {selectedMeeting && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="accent">{selectedMeeting.type}</Badge>
                <Badge variant="success">{selectedMeeting.status}</Badge>
              </div>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                {selectedMeeting.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start">
              <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)]">
                <span>الموعد: {formatDateTime(selectedMeeting.scheduledAt, "ar")}</span>
                <span>المدة: {selectedMeeting.durationMinutes} دقيقة</span>
                {selectedMeeting.location && <span>المكان: {selectedMeeting.location}</span>}
              </div>

              {selectedMeeting.agenda && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--ink)] mb-1">جدول الأعمال (Agenda):</h4>
                  <p className="text-xs text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)] whitespace-pre-line leading-relaxed">
                    {selectedMeeting.agenda}
                  </p>
                </div>
              )}

              {selectedMeeting.notes && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--ink)] mb-1">محضر ونقاط الاجتماع (Minutes):</h4>
                  <p className="text-xs text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)] whitespace-pre-line leading-relaxed">
                    {selectedMeeting.notes}
                  </p>
                </div>
              )}

              {/* Action items section with 1-click Task conversion */}
              <div className="pt-2 border-t border-[var(--border)]">
                <h4 className="text-xs font-bold text-[var(--ink)] mb-2 flex items-center justify-between">
                  <span>التكليفات والإجراءات الصادرة عن الاجتماع (Action Items):</span>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    {selectedMeeting.actions.length} تكليفات
                  </span>
                </h4>

                <div className="space-y-2 mb-3">
                  {selectedMeeting.actions.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--ink)]">{act.text}</p>
                        {act.owner && (
                          <span className="text-[10px] text-[var(--ink-muted)]">
                            المسؤول: {act.owner.name}
                          </span>
                        )}
                      </div>

                      {act.task ? (
                        <Badge variant="success" size="sm">
                          تم التحويل لمهمة #{act.task.number}
                        </Badge>
                      ) : (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleConvertAction(act.id)}
                          leftIcon={<CheckSquare className="h-3 w-3 text-[var(--accent)]" />}
                        >
                          تحويل لمهمة رسمية
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="إضافة تكليف جديد من محضر الاجتماع..."
                    className="text-xs h-8 flex-1"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddAction}>
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedMeeting(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Meeting Modal */}
      {isCreateOpen && (
        <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                جدولة اجتماع جديد (Schedule Meeting)
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createMeetingAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Meeting scheduled successfully");
                  setIsCreateOpen(false);
                } else {
                  toast.error(res.error || "Failed to schedule meeting");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان الاجتماع" name="title" required placeholder="e.g. Sprint 2 Planning & Review" />

              <div className="grid grid-cols-2 gap-3">
                <Select label="نوع الاجتماع" name="type">
                  <option value="TEAM">اجتماع فريق (Team)</option>
                  <option value="SUPERVISOR">مع المشرف الأكاديمي</option>
                  <option value="DEPARTMENT">مع منسق القسم</option>
                  <option value="REHEARSAL">بروفة ومناقشة تجريبية</option>
                </Select>

                <Input label="المدة (دقيقة)" name="durationMinutes" type="number" defaultValue="60" />
              </div>

              <Input label="الموعد والتاريخ" name="scheduledAt" type="datetime-local" required />

              <Input label="المكان أو رابط الاجتماع" name="location" placeholder="e.g. Hall 204 or Google Meet link" />

              <Textarea label="جدول الأعمال المقترح" name="agenda" placeholder="Agenda items..." />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ الجدولة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
