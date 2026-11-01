"use client";

import React, { useState } from "react";
import { DecisionStatus } from "@/generated/prisma/enums";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { createDecisionAction } from "@/app/actions/decision-actions";
import { Scale, CheckCircle2, RotateCcw, Plus, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface DecisionItem {
  id: string;
  number: number;
  title: string;
  context: string;
  chosenOption: string | null;
  rationale: string | null;
  consequences: string | null;
  status: DecisionStatus;
  decidedAt: Date | string | null;
  owner: { name: string } | null;
  options: Array<{ id: string; title: string; pros: string | null; cons: string | null }>;
  revisions: Array<{ id: string; revision: number; createdAt: Date | string; editor: { name: string } }>;
  supersededBy: { id: string; number: number; title: string } | null;
}

export function DecisionsView({
  projectId,
  projectSlug,
  initialDecisions,
}: {
  projectId: string;
  projectSlug: string;
  initialDecisions: DecisionItem[];
}) {
  const [decisions, setDecisions] = useState<DecisionItem[]>(initialDecisions);
  const [selectedDecision, setSelectedDecision] = useState<DecisionItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <span className="text-xs font-semibold text-[var(--ink-secondary)]">
          سجل القرارات المعمارية والهندسية ({decisions.length})
        </span>

        <Button
          data-guide="decisions-create-btn"
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          تسجيل قرار جديد (Record ADR)
        </Button>
      </div>

      <div
        data-guide="decisions-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {decisions.map((dec) => (
          <Card
            key={dec.id}
            interactive
            onClick={() => setSelectedDecision(dec)}
            className="p-4 flex flex-col justify-between text-start"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold font-mono text-[var(--accent)]">
                  DEC-{dec.number}
                </span>
                <Badge
                  variant={dec.status === "ACCEPTED" ? "success" : dec.status === "SUPERSEDED" ? "warning" : "default"}
                  size="sm"
                >
                  {dec.status}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-[var(--ink)] mb-1">{dec.title}</h3>
              <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-3">
                السياق: {dec.context}
              </p>

              {dec.chosenOption && (
                <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--ink)]">
                  <span className="font-bold text-[var(--success)]">القرار المعتمد: </span>
                  <span className="line-clamp-1">{dec.chosenOption}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
              <span>{dec.revisions.length} مراجعات تاريخية</span>
              <span className="text-[var(--accent)] font-semibold">عرض السجل والبدائل ←</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedDecision(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                  DEC-{selectedDecision.number}
                </span>
                <Badge variant={selectedDecision.status === "ACCEPTED" ? "success" : "default"}>
                  {selectedDecision.status}
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                {selectedDecision.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start text-xs">
              <div>
                <h4 className="font-bold text-[var(--ink)] mb-1">سياق القرار والمشكلة (Context):</h4>
                <p className="text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)] leading-relaxed whitespace-pre-line">
                  {selectedDecision.context}
                </p>
              </div>

              {selectedDecision.options.length > 0 && (
                <div>
                  <h4 className="font-bold text-[var(--ink)] mb-1">الخيارات والبدائل المدروسة:</h4>
                  <div className="space-y-1.5">
                    {selectedDecision.options.map((opt) => (
                      <div key={opt.id} className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                        <span className="font-bold text-[var(--ink)] block">{opt.title}</span>
                        {opt.pros && <span className="text-[11px] text-[var(--success)] block mt-0.5">المميزات: {opt.pros}</span>}
                        {opt.cons && <span className="text-[11px] text-[var(--danger)] block">العيوب: {opt.cons}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDecision.chosenOption && (
                <div>
                  <h4 className="font-bold text-[var(--success)] mb-1">الخيار المعتمد وأسباب الاختيار (Rationale):</h4>
                  <p className="text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--success-subtle)] leading-relaxed">
                    <span className="font-bold text-[var(--ink)] block mb-1">{selectedDecision.chosenOption}</span>
                    {selectedDecision.rationale}
                  </p>
                </div>
              )}

              {selectedDecision.consequences && (
                <div>
                  <h4 className="font-bold text-[var(--ink)] mb-1">الآثار والمقايضات الهندسية (Consequences):</h4>
                  <p className="text-[var(--ink-secondary)] p-2.5 rounded bg-[var(--surface-subtle)] leading-relaxed">
                    {selectedDecision.consequences}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDecision(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Decision Modal */}
      {isCreateOpen && (
        <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                تسجيل قرار هندسي جديد (Architectural Decision Record)
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createDecisionAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Decision recorded successfully in immutable log");
                  setIsCreateOpen(false);
                } else {
                  toast.error(res.error || "Failed to record decision");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان القرار" name="title" required placeholder="e.g. Using Next.js 16 over Vite SPA" />
              <Textarea label="سياق المشكلة والاحتياج (Context)" name="context" required placeholder="Why we need to make this decision..." />
              <Input label="الخيار المعتمد (Chosen Option)" name="chosenOption" placeholder="The adopted architectural choice" />
              <Textarea label="أسباب اتخاذ القرار (Rationale)" name="rationale" placeholder="Technical justification..." />
              <Textarea label="الآثار المترتبة والمقايضات (Consequences)" name="consequences" placeholder="Trade-offs, positive/negative outcomes..." />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ القرار رسميًا</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
