"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createProjectAction } from "@/app/actions/project-actions";
import { toast } from "sonner";
import { Sparkles, Calendar, Layers } from "lucide-react";

export function NewProjectForm({
  supervisors,
}: {
  supervisors: Array<{ id: string; name: string; email: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [department, setDepartment] = useState("Software Engineering");
  const [abstract, setAbstract] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [supervisorId, setSupervisorId] = useState("");
  const [createDefaultPhases, setCreateDefaultPhases] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      toast.error("يرجى ملء كافة الحقول الإلزامية");
      return;
    }

    setLoading(true);
    try {
      const res = await createProjectAction({
        title,
        code,
        academicYear,
        department,
        abstract,
        startDate,
        endDate,
        supervisorId: supervisorId || undefined,
        createDefaultPhases,
      });

      if (res.success && res.project) {
        toast.success("تم إنشاء مشروع التخرج وتهيئة المراحل القياسية بنجاح");
        router.push(`/app/p/${res.project.slug}/overview`);
      } else {
        toast.error(res.error || "فشل إنشاء المشروع");
      }
    } catch {
      toast.error("حدث خطأ أثناء تأسيس المشروع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      <div className="space-y-4">
        <div>
          <label className="block text-[var(--ink)] font-semibold mb-1">
            اسم أو عنوان مشروع التخرج *
          </label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: Smart Campus Operations Platform (SCOP)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[var(--ink)] font-semibold mb-1">
              رمز المشروع (Code) *
            </label>
            <Input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: CS-2026-01"
            />
          </div>

          <div>
            <label className="block text-[var(--ink)] font-semibold mb-1">
              العام الأكاديمي *
            </label>
            <Input
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[var(--ink)] font-semibold mb-1">
              القسم العلمي *
            </label>
            <Input
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--ink)] font-semibold mb-1">
              تاريخ البدء *
            </label>
            <Input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[var(--ink)] font-semibold mb-1">
              الموعد المستهدف للمناقشة (تاريخ النهاية) *
            </label>
            <Input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-[var(--ink)] font-semibold mb-1">
            المشرف الأكاديمي المعتمد
          </label>
          <Select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
          >
            <option value="">اختر المشرف الأكاديمي (أو التعيين لاحقًا)...</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-[var(--ink)] font-semibold mb-1">
            الملخص والأهداف والمشكلة المعالجة (Abstract)
          </label>
          <Textarea
            rows={4}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="وصف المشكلة، الأهداف الهندسية، والنتائج المتوقعة..."
          />
        </div>

        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] flex items-start gap-3">
          <input
            type="checkbox"
            id="createPhases"
            checked={createDefaultPhases}
            onChange={(e) => setCreateDefaultPhases(e.target.checked)}
            className="mt-1 rounded"
          />
          <div>
            <label htmlFor="createPhases" className="font-semibold text-[var(--ink)] cursor-pointer">
              تهيئة المراحل العشر القياسية لمشاريع التخرج (Recommended)
            </label>
            <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
              ينشئ تلقائيًا مراحل: الفكرة والمقترح، تحديد المشكلة، متطلبات SRS، المعمارية والـ ERD، النماذج، التنفيذ، الاختبار، التقرير النهائي، البروفة، والمناقشة النهائية.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <Sparkles className="h-4 w-4" />
          تأسيس مساحة العمل والمشروع
        </Button>
      </div>
    </form>
  );
}

