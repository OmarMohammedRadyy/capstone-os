"use client";

import React, { useState } from "react";
import { RiskStatus, RiskCategory, IssueStatus, IssueSeverity } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createRiskAction, createIssueAction } from "@/app/actions/risk-actions";
import { AlertTriangle, AlertOctagon, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RiskItem {
  id: string;
  title: string;
  description: string | null;
  category: RiskCategory;
  probability: number;
  impact: number;
  mitigation: string | null;
  contingency: string | null;
  status: RiskStatus;
  owner: { name: string } | null;
}

interface IssueItem {
  id: string;
  title: string;
  description: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  isBlocker: boolean;
  rootCause: string | null;
  resolution: string | null;
  owner: { name: string } | null;
}

export function RisksView({
  projectId,
  projectSlug,
  initialRisks,
  initialIssues,
}: {
  projectId: string;
  projectSlug: string;
  initialRisks: RiskItem[];
  initialIssues: IssueItem[];
}) {
  const [tab, setTab] = useState<"risks" | "issues">("risks");
  const [risks] = useState<RiskItem[]>(initialRisks);
  const [issues] = useState<IssueItem[]>(initialIssues);

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // 5x5 Matrix Counts: probability (rows 5..1) x impact (cols 1..5)
  const getMatrixCellRisks = (prob: number, imp: number) => {
    return risks.filter((r) => r.probability === prob && r.impact === imp && r.status !== "CLOSED");
  };

  const getExposureBadge = (exposure: number) => {
    if (exposure >= 16) return <Badge variant="danger" size="sm">حرج {exposure}/25</Badge>;
    if (exposure >= 10) return <Badge variant="warning" size="sm">مرتفع {exposure}/25</Badge>;
    if (exposure >= 5) return <Badge variant="accent" size="sm">متوسط {exposure}/25</Badge>;
    return <Badge variant="success" size="sm">منخفض {exposure}/25</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Top Bar Switcher & Actions */}
      <div
        data-guide="risks-tabs"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3"
      >
        <div className="flex items-center gap-2">
          <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5 bg-[var(--surface-subtle)]">
            <button
              onClick={() => setTab("risks")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold cursor-pointer transition-colors ${
                tab === "risks"
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              سجل ومصفوفة المخاطر ({risks.length})
            </button>
            <button
              onClick={() => setTab("issues")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold cursor-pointer transition-colors ${
                tab === "issues"
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              المشاكل والمعوقات الحرجة ({issues.length})
            </button>
          </div>
        </div>

        {tab === "risks" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRiskModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            إضافة خطر محتمل (New Risk)
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsIssueModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            تسجيل مشكلة قائمة (Log Issue)
          </Button>
        )}
      </div>

      {tab === "risks" ? (
        <div data-guide="risks-matrix" className="space-y-6">
          {/* 5x5 Interactive Risk Matrix Grid */}
          <Card className="p-4 border-[var(--border)]">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3">
              مصفوفة المخاطر المعتمدة (5×5 Probability × Impact Matrix)
            </h3>

            <div className="grid grid-cols-6 gap-1.5 text-center text-[11px] font-mono select-none overflow-x-auto min-w-[500px]">
              {/* Row headers & cells */}
              <div className="p-2 font-bold text-[var(--ink-secondary)]">احتمالية \ أثر</div>
              <div className="p-2 font-bold text-[var(--ink-secondary)]">1. طفيف</div>
              <div className="p-2 font-bold text-[var(--ink-secondary)]">2. ثانوي</div>
              <div className="p-2 font-bold text-[var(--ink-secondary)]">3. متوسط</div>
              <div className="p-2 font-bold text-[var(--ink-secondary)]">4. كبير</div>
              <div className="p-2 font-bold text-[var(--ink-secondary)]">5. حرج</div>

              {[5, 4, 3, 2, 1].map((prob) => (
                <React.Fragment key={prob}>
                  <div className="p-2 font-bold text-[var(--ink-secondary)] flex items-center justify-center">
                    {prob}
                  </div>
                  {[1, 2, 3, 4, 5].map((imp) => {
                    const score = prob * imp;
                    const cellRisks = getMatrixCellRisks(prob, imp);
                    const bgClass =
                      score >= 16
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
                        : score >= 10
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                        : score >= 5
                        ? "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";

                    return (
                      <div
                        key={`${prob}-${imp}`}
                        className={`h-12 p-1 rounded border flex flex-col items-center justify-center transition-colors ${bgClass}`}
                        title={`Probability: ${prob}, Impact: ${imp}, Score: ${score}`}
                      >
                        <span className="text-[10px] opacity-60">{score}</span>
                        {cellRisks.length > 0 && (
                          <span className="h-5 w-5 rounded-full bg-[var(--surface)] text-[var(--ink)] font-bold text-xs flex items-center justify-center shadow-xs mt-0.5">
                            {cellRisks.length}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* Risk Register Table */}
          <div className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border)] text-[var(--ink-secondary)] font-semibold">
                <tr>
                  <th className="p-3 text-start">الخطر المحتمل</th>
                  <th className="p-3 text-start">التصنيف</th>
                  <th className="p-3 text-start">الاحتمالية × الأثر</th>
                  <th className="p-3 text-start">درجة الخطورة</th>
                  <th className="p-3 text-start">إجراءات التخفيف والوقاية (Mitigation)</th>
                  <th className="p-3 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {risks.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-3 font-bold text-[var(--ink)] max-w-xs">{r.title}</td>
                    <td className="p-3 text-[var(--ink-secondary)]">{r.category}</td>
                    <td className="p-3 font-mono font-semibold">{r.probability} × {r.impact}</td>
                    <td className="p-3">{getExposureBadge(r.probability * r.impact)}</td>
                    <td className="p-3 text-[var(--ink-secondary)] max-w-sm leading-relaxed">
                      {r.mitigation || "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant={r.status === "OPEN" ? "warning" : "default"} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Issues Triage Register */
        <div className="space-y-4">
          <div className="border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-xs text-start">
              <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border)] text-[var(--ink-secondary)] font-semibold">
                <tr>
                  <th className="p-3 text-start">المشكلة القائمة</th>
                  <th className="p-3 text-start">مستوى الخطورة</th>
                  <th className="p-3 text-start">حالة التعطيل</th>
                  <th className="p-3 text-start">السبب الجذري (Root Cause)</th>
                  <th className="p-3 text-start">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-3 font-bold text-[var(--ink)] max-w-xs">{iss.title}</td>
                    <td className="p-3">
                      <Badge
                        variant={iss.severity === "CRITICAL" ? "danger" : iss.severity === "HIGH" ? "warning" : "default"}
                        size="sm"
                      >
                        {iss.severity}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {iss.isBlocker ? (
                        <Badge variant="danger" size="sm" dot>
                          معطل حرج (Blocker)
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-[var(--ink-muted)]">غير معطل</span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--ink-secondary)] max-w-sm">
                      {iss.rootCause || "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant={iss.status === "OPEN" ? "danger" : "success"} size="sm">
                        {iss.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Risk Modal */}
      {isRiskModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsRiskModalOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                تسجيل خطر محتمل (Identify Risk)
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createRiskAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Risk added to register");
                  setIsRiskModalOpen(false);
                } else {
                  toast.error(res.error || "Failed to add risk");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان الخطر" name="title" required placeholder="e.g. Hardware sensor delivery delay" />

              <Select label="التصنيف" name="category">
                <option value="TECHNICAL">تقني (Technical)</option>
                <option value="SCHEDULE">جدول زمني (Schedule)</option>
                <option value="EXTERNAL">خارجي (External/Vendors)</option>
                <option value="SCOPE">نطاق العمل (Scope)</option>
                <option value="TEAM">الفريق (Team)</option>
                <option value="QUALITY">جودة (Quality)</option>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Select label="الاحتمالية (1-5)" name="probability">
                  <option value="1">1 - نادر جدًا (Rare)</option>
                  <option value="2">2 - غير مرجح (Unlikely)</option>
                  <option value="3">3 - محتمل (Possible)</option>
                  <option value="4">4 - مرجح (Likely)</option>
                  <option value="5">5 - شبه مؤكد (Certain)</option>
                </Select>

                <Select label="الأثر (1-5)" name="impact">
                  <option value="1">1 - طفيف (Negligible)</option>
                  <option value="2">2 - ثانوي (Minor)</option>
                  <option value="3">3 - متوسط (Moderate)</option>
                  <option value="4">4 - كبير (Major)</option>
                  <option value="5">5 - حرج (Catastrophic)</option>
                </Select>
              </div>

              <Textarea label="خطة التخفيف والوقاية (Mitigation)" name="mitigation" placeholder="Preventive measures..." />
              <Textarea label="خطة الطوارئ والبدائل (Contingency)" name="contingency" placeholder="Fallback plan..." />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsRiskModalOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ الخطر</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Issue Modal */}
      {isIssueModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsIssueModalOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--danger)] flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                <span>تسجيل مشكلة قائمة ومعطلة (Log Issue)</span>
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createIssueAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Issue logged successfully");
                  setIsIssueModalOpen(false);
                } else {
                  toast.error(res.error || "Failed to log issue");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان المشكلة" name="title" required placeholder="e.g. Lab firewall blocking MQTT port" />

              <div className="grid grid-cols-2 gap-3">
                <Select label="مستوى الخطورة" name="severity">
                  <option value="CRITICAL">حرجة (Critical)</option>
                  <option value="HIGH">مرتفعة (High)</option>
                  <option value="MEDIUM">متوسطة (Medium)</option>
                  <option value="LOW">منخفضة (Low)</option>
                </Select>

                <Select label="هل تعطل العمل؟ (Blocker)" name="isBlocker">
                  <option value="true">نعم - معطل حرج</option>
                  <option value="false">لا - غير معطل</option>
                </Select>
              </div>

              <Textarea label="السبب الجذري للمشكلة (Root Cause)" name="rootCause" placeholder="What caused this issue..." />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsIssueModalOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="destructive">تسجيل المشكلة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
