"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Activity,
  CheckCircle2,
  FileText,
  MessageSquare,
  Users,
  GitCommit,
  Archive,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  entityType: string;
  entityId: string | null;
  params: any;
  createdAt: Date | string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export function ActivityTimelineView({
  activities,
  teamMembers,
}: {
  activities: ActivityItem[];
  teamMembers: Array<{ id: string; name: string }>;
}) {
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [selectedActor, setSelectedActor] = useState<string>("ALL");

  const filteredActivities = activities.filter((act) => {
    if (selectedEntity !== "ALL" && act.entityType !== selectedEntity) return false;
    if (selectedActor !== "ALL" && act.actor.id !== selectedActor) return false;
    return true;
  });

  function getEventIcon(entityType: string) {
    switch (entityType) {
      case "Task":
        return <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />;
      case "Document":
        return <FileText className="h-4 w-4 text-[var(--gold)]" />;
      case "SupervisorFeedback":
        return <MessageSquare className="h-4 w-4 text-[var(--copper)]" />;
      case "Meeting":
        return <Users className="h-4 w-4 text-[var(--accent)]" />;
      case "Decision":
        return <GitCommit className="h-4 w-4 text-[var(--gold)]" />;
      case "Submission":
        return <Archive className="h-4 w-4 text-[var(--success)]" />;
      case "Risk":
      case "Issue":
        return <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />;
      default:
        return <Activity className="h-4 w-4 text-[var(--ink-secondary)]" />;
    }
  }

  function getEventDescription(act: ActivityItem) {
    const params = act.params || {};
    switch (act.type) {
      case "TASK_CREATED":
        return `أنشأ المهمة: "${params.title || "مهمة جديدة"}"`;
      case "TASK_STATUS_CHANGED":
        return `غيّر حالة المهمة "${params.title || ""}" إلى ${params.toStatus || ""}`;
      case "TASK_COMPLETED":
        return `أنجز المهمة: "${params.title || ""}"`;
      case "DOCUMENT_CREATED":
        return `أنشأ الوثيقة الجديدة: "${params.title || ""}"`;
      case "DOCUMENT_VERSION_UPLOADED":
        return `رفع الإصدار #${params.versionNumber || ""} من وثيقة "${params.title || ""}"`;
      case "DOCUMENT_OFFICIAL_APPROVED":
        return `اعتمد وثيقة "${params.title || ""}" كإصدار رسمي`;
      case "FEEDBACK_SUBMITTED":
        return `وجّه ملاحظة توجيهية: "${params.title || ""}"`;
      case "FEEDBACK_RESOLVED":
        return `عالج ملاحظة المشرف: "${params.title || ""}"`;
      case "FEEDBACK_VERIFIED":
        return `تحقق المشرف من معالجة الملاحظة: "${params.title || ""}"`;
      case "MEETING_CREATED":
        return `سجل اجتماعاً أكاديمياً: "${params.title || ""}"`;
      case "DECISION_RECORDED":
        return `سجل القرار المعماري ADR: "${params.title || ""}"`;
      case "DECISION_SUPERSEDED":
        return `استبدل القرار المعماري #${params.oldNumber} بالقرار الجديد #${params.newNumber}`;
      case "SUBMISSION_FROZEN":
        return `جمّد حزمة التسليم "${params.title || ""}" باللقطة #${params.sequence}`;
      case "SUBMISSION_UNFROZEN":
        return `فك تجميد حزمة التسليم: "${params.title || ""}"`;
      default:
        return act.type;
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-[var(--ink)]">
              <Filter className="h-3.5 w-3.5" />
              تصفية السجل:
            </span>

            <Select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-40 text-xs"
            >
              <option value="ALL">جميع الأنشطة والمخرجات</option>
              <option value="Task">المهام (Tasks)</option>
              <option value="Document">الوثائق (Documents)</option>
              <option value="SupervisorFeedback">ملاحظات المشرف (Feedback)</option>
              <option value="Meeting">الاجتماعات (Meetings)</option>
              <option value="Decision">القرارات المعمارية (Decisions)</option>
              <option value="Submission">التسليمات (Submissions)</option>
            </Select>

            <Select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="w-40 text-xs"
            >
              <option value="ALL">جميع أعضاء الفريق</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>

          <span className="text-xs text-[var(--ink-secondary)]">
            عرض {filteredActivities.length} من أصل {activities.length} حدث
          </span>
        </CardContent>
      </Card>

      {/* Timeline Events List */}
      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-xs text-[var(--ink-secondary)]">
            لا توجد أحداث مطابقة لشروط التصفية المحددة.
          </CardContent>
        </Card>
      ) : (
        <div className="relative border-s border-[var(--border)] ms-4 space-y-6">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative ps-6 group">
              {/* Dot icon */}
              <div className="absolute -start-3 top-1 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                {getEventIcon(act.entityType)}
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-xs space-y-2 hover:border-[var(--border-strong)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={act.actor.name} className="h-6 w-6 text-[10px]" />
                    <span className="font-bold text-[var(--ink)]">{act.actor.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {act.entityType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-tertiary)] font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(act.createdAt)}</span>
                    <span>({formatRelativeTime(act.createdAt)})</span>
                  </div>
                </div>

                <p className="text-[var(--ink)] leading-relaxed">
                  {getEventDescription(act)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

