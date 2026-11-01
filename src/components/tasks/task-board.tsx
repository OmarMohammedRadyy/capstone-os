"use client";

import React, { useState } from "react";
import { TaskStatus, Priority } from "@/generated/prisma/enums";
import { emitGuideAction } from "@/features/user-guide";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import {
  transitionTaskAction,
  addChecklistAction,
  toggleChecklistAction,
  addCommentAction,
  createTaskAction,
} from "@/app/actions/task-actions";
import {
  Plus,
  Clock,
  AlertOctagon,
  MessageSquare,
  Check,
  List,
  Kanban,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TaskItem {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  estimatePoints: number | null;
  dueAt: Date | string | null;
  blockedReason: string | null;
  assignees: Array<{ user: { id: string; name: string } }>;
  checklist: Array<{ id: string; text: string; done: boolean }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date | string;
    author: { name: string };
  }>;
  labels: Array<{ label: { id: string; name: string; color: string } }>;
  blockedBy: Array<{ dependsOn: { id: string; number: number; title: string } }>;
}

interface TaskBoardProps {
  initialTasks: TaskItem[];
  projectId: string;
  projectSlug: string;
  members: Array<{ userId: string; user: { name: string } }>;
  sprints: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; title: string }>;
}

const COLUMNS: Array<{ status: TaskStatus; label: string; dotColor: string }> = [
  { status: TaskStatus.BACKLOG, label: "Backlog", dotColor: "bg-[var(--ink-muted)]" },
  { status: TaskStatus.READY, label: "Ready", dotColor: "bg-[var(--gold)]" },
  { status: TaskStatus.IN_PROGRESS, label: "In Progress", dotColor: "bg-[var(--accent)]" },
  { status: TaskStatus.IN_REVIEW, label: "In Review", dotColor: "bg-[var(--copper)]" },
  { status: TaskStatus.DONE, label: "Done", dotColor: "bg-[var(--success)]" },
  { status: TaskStatus.BLOCKED, label: "Blocked", dotColor: "bg-[var(--danger)]" },
];

export function TaskBoard({
  initialTasks,
  projectId,
  projectSlug,
  members,
  sprints,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [blockedPromptTaskId, setBlockedPromptTaskId] = useState<string | null>(null);
  const [blockedReasonText, setBlockedReasonText] = useState("");

  // Filters
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.number.toString().includes(searchQuery);
    const matchesAssignee =
      selectedAssignee === "all" ||
      t.assignees.some((a) => a.user.id === selectedAssignee);
    const matchesPriority =
      selectedPriority === "all" || t.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all" || t.status === selectedStatus;
    return matchesSearch && matchesAssignee && matchesPriority && matchesStatus;
  });

  // Handle transition with reversible Undo action toast
  const handleTransition = async (
    taskId: string,
    targetStatus: TaskStatus,
    isUndo = false
  ) => {
    if (targetStatus === TaskStatus.BLOCKED && !isUndo) {
      setBlockedPromptTaskId(taskId);
      return;
    }

    const existingTask = tasks.find((t) => t.id === taskId);
    const previousStatus = existingTask?.status;

    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: targetStatus, blockedReason: null } : t
        )
      );
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, status: targetStatus, blockedReason: null } : null
        );
      }

      await transitionTaskAction(taskId, targetStatus, projectSlug);

      if (!isUndo && previousStatus && previousStatus !== targetStatus) {
        toast.success(`تم نقل المهمة إلى ${targetStatus}`, {
          action: {
            label: "تراجع (Undo)",
            onClick: () => handleTransition(taskId, previousStatus, true),
          },
        });
      } else if (isUndo) {
        toast.success(`تم التراجع وإعادة المهمة إلى ${targetStatus}`);
      }
    } catch {
      toast.error("Failed to transition task.");
    }
  };

  const submitBlockedTransition = async () => {
    if (!blockedPromptTaskId || !blockedReasonText.trim()) return;
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === blockedPromptTaskId
            ? {
                ...t,
                status: TaskStatus.BLOCKED,
                blockedReason: blockedReasonText.trim(),
              }
            : t
        )
      );
      if (selectedTask && selectedTask.id === blockedPromptTaskId) {
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                status: TaskStatus.BLOCKED,
                blockedReason: blockedReasonText.trim(),
              }
            : null
        );
      }
      await transitionTaskAction(
        blockedPromptTaskId,
        TaskStatus.BLOCKED,
        projectSlug,
        blockedReasonText.trim()
      );
      toast.success("تم تسجيل تعطيل المهمة وتوثيق السبب");
      setBlockedPromptTaskId(null);
      setBlockedReasonText("");
    } catch {
      toast.error("Failed to mark task as blocked.");
    }
  };

  // Checklist handler
  const handleToggleChecklist = async (itemId: string, done: boolean) => {
    if (!selectedTask) return;
    const updatedChecklist = selectedTask.checklist.map((i) =>
      i.id === itemId ? { ...i, done } : i
    );
    setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id ? { ...t, checklist: updatedChecklist } : t
      )
    );
    await toggleChecklistAction(itemId, done, projectSlug);
  };

  const handleAddChecklist = async () => {
    if (!selectedTask || !newChecklistText.trim()) return;
    const res = await addChecklistAction(
      selectedTask.id,
      newChecklistText.trim(),
      projectSlug
    );
    if (res.success && res.item) {
      const updatedChecklist = [...selectedTask.checklist, res.item];
      setSelectedTask({
        ...selectedTask,
        checklist: updatedChecklist,
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, checklist: updatedChecklist } : t
        )
      );
      setNewChecklistText("");
    }
  };

  // Comment handler
  const handleAddComment = async () => {
    if (!selectedTask || !newCommentText.trim()) return;
    const res = await addCommentAction(
      selectedTask.id,
      newCommentText.trim(),
      projectSlug
    );
    if (res.success && res.comment) {
      const updatedComments = [
        ...selectedTask.comments,
        {
          ...res.comment,
          author: { name: "أنت (You)" },
        },
      ];
      setSelectedTask({
        ...selectedTask,
        comments: updatedComments,
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, comments: updatedComments } : t
        )
      );
      setNewCommentText("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Filter Bar */}
      <div
        data-guide="tasks-filter-bar"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4"
      >
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View switcher */}
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5 bg-[var(--surface-subtle)]">
            <button
              onClick={() => setViewMode("board")}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === "board"
                  ? "bg-[var(--surface)] font-semibold shadow-xs text-[var(--ink)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              <Kanban className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>لوحة (Board)</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--surface)] font-semibold shadow-xs text-[var(--ink)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              <List className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>جدول (Table)</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="h-3.5 w-3.5 absolute start-2.5 top-2.5 text-[var(--ink-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم أو عنوان المهمة..."
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Member filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--ink)] focus:outline-none"
          >
            <option value="all">جميع الأعضاء</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--ink)] focus:outline-none"
          >
            <option value="all">كل الأولويات</option>
            <option value="CRITICAL">Critical (حرجة)</option>
            <option value="HIGH">High (عالية)</option>
            <option value="MEDIUM">Medium (متوسطة)</option>
            <option value="LOW">Low (منخفضة)</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--ink)] focus:outline-none"
          >
            <option value="all">كل الحالات ({tasks.length})</option>
            {COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          data-guide="tasks-create-btn"
          variant="primary"
          size="sm"
          onClick={() => {
            setIsCreateOpen(true);
            emitGuideAction("task.selected");
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          مهمة جديدة (New Task)
        </Button>
      </div>

      {/* Board View */}
      {viewMode === "board" ? (
        <div
          data-guide="tasks-board-columns"
          className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4"
        >
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className="rounded-[var(--radius-md)] bg-[var(--surface-subtle)]/70 border border-[var(--border)] p-2.5 flex flex-col min-h-[520px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold font-mono text-[var(--ink-secondary)] bg-[var(--surface)] px-1.5 py-0.5 rounded-full border border-[var(--border)]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2 flex-1">
                  {colTasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id;
                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          emitGuideAction("task.selected", { taskId: task.id });
                        }}
                        className={`p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border transition-all cursor-pointer text-start space-y-2 ${
                          isSelected
                            ? "border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-sm"
                            : "border-[var(--border)] hover:border-[var(--accent)] hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-[var(--ink-secondary)]">
                            #{task.number}
                          </span>
                          <Badge
                            variant={
                              task.priority === "CRITICAL"
                                ? "danger"
                                : task.priority === "HIGH"
                                ? "gold"
                                : "default"
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        <p className="text-xs font-semibold text-[var(--ink)] leading-snug line-clamp-2">
                          {task.title}
                        </p>

                        {task.status === "BLOCKED" && task.blockedReason && (
                          <p className="text-[10px] text-[var(--danger)] bg-[var(--danger-subtle)] p-1.5 rounded font-medium line-clamp-2">
                            سبب التعطيل: {task.blockedReason}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--ink-muted)]">
                          <div className="flex items-center gap-2">
                            {task.checklist.length > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-mono">
                                <Check className="h-3 w-3 text-[var(--accent)]" />
                                {task.checklist.filter((c) => c.done).length}/
                                {task.checklist.length}
                              </span>
                            )}
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-mono">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments.length}
                              </span>
                            )}
                            {task.estimatePoints && (
                              <span className="text-[10px] font-mono px-1 rounded bg-[var(--surface-subtle)]">
                                {task.estimatePoints}pt
                              </span>
                            )}
                          </div>

                          <div className="flex -space-x-1 rtl:space-x-reverse">
                            {task.assignees.map((a) => (
                              <Avatar key={a.user.id} name={a.user.name} size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-[11px] text-[var(--ink-muted)] border border-dashed border-[var(--border)] rounded-[var(--radius-sm)]">
                      لا توجد مهام
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-xs text-start">
            <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border)] text-[var(--ink-secondary)] font-semibold">
              <tr>
                <th className="p-3 text-start">#</th>
                <th className="p-3 text-start">العنوان (Task)</th>
                <th className="p-3 text-start">الحالة (Status)</th>
                <th className="p-3 text-start">الأولوية</th>
                <th className="p-3 text-start">النقاط</th>
                <th className="p-3 text-start">المكلفون</th>
                <th className="p-3 text-start">تاريخ الاستحقاق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-[var(--ink-secondary)]">
                    #{t.number}
                  </td>
                  <td className="p-3 font-semibold text-[var(--ink)]">{t.title}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.status === "DONE"
                          ? "success"
                          : t.status === "BLOCKED"
                          ? "danger"
                          : "accent"
                      }
                      size="sm"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.priority === "CRITICAL"
                          ? "danger"
                          : t.priority === "HIGH"
                          ? "gold"
                          : "default"
                      }
                      size="sm"
                    >
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-[var(--ink-secondary)]">
                    {t.estimatePoints ? `${t.estimatePoints} pts` : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {t.assignees.map((a) => (
                        <span
                          key={a.user.id}
                          className="text-[11px] font-medium text-[var(--ink)]"
                        >
                          {a.user.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[var(--ink-secondary)]">
                    {t.dueAt ? formatDate(t.dueAt, "ar") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contextual Side Detail Drawer (Replaces centered modal to preserve board context) */}
      <Drawer
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        title={selectedTask?.title || ""}
        subtitle={
          selectedTask && (
            <>
              <span className="text-xs font-mono font-bold text-[var(--ink-secondary)]">
                TASK #{selectedTask.number}
              </span>
              <Badge variant="accent" size="sm">
                {selectedTask.status}
              </Badge>
              <Badge
                variant={
                  selectedTask.priority === "CRITICAL"
                    ? "danger"
                    : selectedTask.priority === "HIGH"
                    ? "gold"
                    : "default"
                }
                size="sm"
              >
                {selectedTask.priority}
              </Badge>
            </>
          )
        }
        footer={
          <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
            إغلاق اللوحة الجانبية
          </Button>
        }
      >
        {selectedTask && (
          <div className="space-y-5">
            {/* 1. Status Transition Strip */}
            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
              <span className="text-xs font-bold text-[var(--ink)] block">
                تغيير حالة المهمة (Workflow State):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNS.map((col) => (
                  <Button
                    key={col.status}
                    variant={
                      selectedTask.status === col.status ? "primary" : "secondary"
                    }
                    size="xs"
                    onClick={() => handleTransition(selectedTask.id, col.status)}
                  >
                    {col.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 2. Task Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-xs">
              <div>
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  المكلفون بالتنفيذ
                </span>
                <div className="font-semibold text-[var(--ink)] mt-1 flex flex-wrap gap-1">
                  {selectedTask.assignees.length > 0
                    ? selectedTask.assignees.map((a) => a.user.name).join("، ")
                    : "غير مكلف"}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  تاريخ الاستحقاق
                </span>
                <div className="font-semibold font-mono text-[var(--ink)] mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[var(--gold)]" />
                  <span>
                    {selectedTask.dueAt
                      ? formatDate(selectedTask.dueAt, "ar")
                      : "غير محدد"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-muted)] block">
                  النقاط التقديرية
                </span>
                <div className="font-semibold font-mono text-[var(--ink)] mt-1">
                  {selectedTask.estimatePoints ?? 0} نقاط
                </div>
              </div>
            </div>

            {/* Blocked Reason Banner if Blocked */}
            {selectedTask.status === "BLOCKED" && selectedTask.blockedReason && (
              <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-subtle)] border border-[var(--danger)]/30 text-xs text-[var(--danger)]">
                <span className="font-bold block mb-0.5">سبب التعطيل المسجل:</span>
                <span>{selectedTask.blockedReason}</span>
              </div>
            )}

            {/* Dependencies if any */}
            {selectedTask.blockedBy.length > 0 && (
              <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--gold-subtle)] border border-[var(--gold-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--gold-text)] flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>تعتمد هذه المهمة على إنجاز:</span>
                </span>
                {selectedTask.blockedBy.map((dep) => (
                  <div key={dep.dependsOn.id} className="text-[var(--ink)] font-medium">
                    • #{dep.dependsOn.number} — {dep.dependsOn.title}
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {selectedTask.description && (
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)] mb-1.5">
                  الوصف والمواصفات الفنية (Specifications):
                </h4>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed whitespace-pre-line p-3 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {/* 3. Interactive Checklist Section */}
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[var(--ink)]">
                  قائمة الفحص ومعايير القبول (Checklist):
                </h4>
                <span className="text-[11px] font-mono font-semibold text-[var(--accent)]">
                  {selectedTask.checklist.filter((i) => i.done).length}/
                  {selectedTask.checklist.length} مكتمل
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                {selectedTask.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 p-2 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/50 hover:bg-[var(--surface-hover)] text-xs text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(e) =>
                        handleToggleChecklist(item.id, e.target.checked)
                      }
                      className="rounded border-[var(--border)] text-[var(--accent)] h-4 w-4"
                    />
                    <span
                      className={
                        item.done
                          ? "line-through text-[var(--ink-muted)]"
                          : "font-medium"
                      }
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="إضافة بند فحص فرعي جديد..."
                  className="text-xs h-8"
                />
                <Button variant="secondary" size="sm" onClick={handleAddChecklist}>
                  إضافة
                </Button>
              </div>
            </div>

            {/* 4. Comments Section */}
            <div className="pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--ink)] mb-2">
                التعليقات والمناقشات الهندسية ({selectedTask.comments.length}):
              </h4>

              <div className="space-y-2 mb-3 max-h-52 overflow-y-auto">
                {selectedTask.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[var(--ink)]">
                        {c.author.name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                        {formatDate(c.createdAt, "ar")}
                      </span>
                    </div>
                    <p className="text-[var(--ink-secondary)] leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="اكتب تعليقًا أو تحديثًا للفريق..."
                  className="text-xs h-8"
                />
                <Button variant="primary" size="sm" onClick={handleAddComment}>
                  إرسال
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Blocked Reason Prompt Dialog */}
      {blockedPromptTaskId && (
        <Dialog open={true} onOpenChange={() => setBlockedPromptTaskId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--danger)] flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4" />
                <span>سبب تعطيل المهمة إلزامي (Blocked Reason Required)</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Textarea
                value={blockedReasonText}
                onChange={(e) => setBlockedReasonText(e.target.value)}
                placeholder="وضح بالتحديد ما الذي يعطل هذه المهمة والجهة المسؤولة عن فك التعطيل..."
                required
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setBlockedPromptTaskId(null)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={submitBlockedTransition}
                disabled={!blockedReasonText.trim()}
              >
                تأكيد التعطيل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                إنشاء مهمة جديدة (Create New Task)
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createTaskAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("تم إنشاء المهمة بنجاح");
                  setIsCreateOpen(false);
                } else {
                  toast.error(res.error || "Failed to create task");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input
                label="عنوان المهمة"
                name="title"
                required
                placeholder="e.g. Implement OAuth Flow"
              />
              <Textarea
                label="تفاصيل المهمة ومعايير القبول"
                name="description"
                placeholder="Technical details, AC..."
              />

              <div className="grid grid-cols-2 gap-3">
                <Select label="الأولوية" name="priority">
                  <option value="MEDIUM">Medium</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="LOW">Low</option>
                </Select>

                <Input
                  label="النقاط التقديرية"
                  name="estimatePoints"
                  type="number"
                  defaultValue="5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select label="المكلف" name="assigneeId">
                  <option value="">(غير مكلف)</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name}
                    </option>
                  ))}
                </Select>

                <Select label="الدورة (Sprint)" name="sprintId">
                  <option value="">Backlog</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Input label="تاريخ الاستحقاق" name="dueAt" type="date" />

              <DialogFooter className="pt-3">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" variant="primary">
                  حفظ المهمة
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
