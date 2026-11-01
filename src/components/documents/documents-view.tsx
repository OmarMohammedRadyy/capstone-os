"use client";

import React, { useState } from "react";
import { DocumentCategory, DocumentStatus } from "@/generated/prisma/enums";
import { emitGuideAction } from "@/features/user-guide";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate, formatFileSize } from "@/lib/utils";
import {
  createDocumentAction,
  uploadDocumentVersionAction,
  markOfficialAction,
} from "@/app/actions/document-actions";
import {
  FolderLock,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Download,
  Plus,
  Tag,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentVersionItem {
  id: string;
  versionNumber: number;
  originalName: string;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
  note: string | null;
  storageKey: string;
  createdAt: Date | string;
  uploadedBy: { name: string };
}

interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  tags: string[];
  isOfficial: boolean;
  status: DocumentStatus;
  currentVersionId: string | null;
  versions: DocumentVersionItem[];
  owner: { name: string } | null;
}

export function DocumentsView({
  projectId,
  projectSlug,
  initialDocuments,
}: {
  projectId: string;
  projectSlug: string;
  initialDocuments: DocumentItem[];
}) {
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filtered = docs.filter(
    (d) => selectedCategory === "ALL" || d.category === selectedCategory
  );

  const categories = [
    "ALL",
    "PROPOSAL",
    "SRS",
    "RESEARCH",
    "ARCHITECTURE",
    "DATABASE",
    "UI_UX",
    "TESTING",
    "REPORT",
    "PRESENTATION",
  ];

  const handleToggleOfficial = async (docId: string, current: boolean) => {
    try {
      await markOfficialAction(docId, projectSlug, !current);
      setDocs((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isOfficial: !current } : d))
      );
      if (selectedDoc) {
        setSelectedDoc({ ...selectedDoc, isOfficial: !current });
      }
      toast.success(!current ? "Marked as official deliverable." : "Official marker removed.");
    } catch {
      toast.error("Failed to update official status.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Pills & Create Action */}
      <div
        data-guide="documents-categories"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--accent)] text-white font-semibold shadow-xs"
                  : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          مستند جديد (New Document)
        </Button>
      </div>

      {/* Documents Grid */}
      <div
        data-guide="documents-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((doc) => (
          <Card
            key={doc.id}
            interactive
            onClick={() => {
              setSelectedDoc(doc);
              emitGuideAction("document.selected", { docId: doc.id });
            }}
            className={`p-4 flex flex-col justify-between text-start ${
              doc.isOfficial ? "border-[var(--success)]/50 bg-[var(--success-subtle)]/5" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="accent" size="sm">{doc.category}</Badge>
                {doc.isOfficial && (
                  <Badge variant="success" size="sm" dot>
                    رسمي معتمد (Official)
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-bold text-[var(--ink)] mb-1">{doc.title}</h3>
              <p className="text-xs text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mb-3">
                {doc.description || "ملف تسليم رسمي موثق في نظام مشروع التخرج."}
              </p>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--ink-muted)]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
              <span className="font-semibold text-[var(--ink)]">
                الإصدار: v{doc.versions.length}
              </span>
              <span className="text-[var(--accent)] font-semibold">
                سجل الإصدارات ←
              </span>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center bg-[var(--surface-subtle)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-xs text-[var(--ink-secondary)]">
            لا توجد مستندات مسجلة في هذا التصنيف.
          </div>
        )}
      </div>

      {/* Document Detail & Immutable Version History Dialog */}
      {selectedDoc && (
        <Dialog open={true} onOpenChange={(open) => !open && setSelectedDoc(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{selectedDoc.category}</Badge>
                  {selectedDoc.isOfficial && (
                    <Badge variant="success" dot>رسمي معتمد</Badge>
                  )}
                </div>
                <Button
                  variant={selectedDoc.isOfficial ? "secondary" : "outline"}
                  size="xs"
                  onClick={() => handleToggleOfficial(selectedDoc.id, selectedDoc.isOfficial)}
                >
                  {selectedDoc.isOfficial ? "إلغاء صفة رسمي" : "تعيين كمستند رسمي"}
                </Button>
              </div>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                {selectedDoc.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start">
              {selectedDoc.description && (
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed p-2.5 rounded bg-[var(--surface-subtle)]">
                  {selectedDoc.description}
                </p>
              )}

              {/* Version History Table (Immutable Records) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-[var(--accent)]" />
                    <span>سجل الإصدارات السابقة (Version History):</span>
                  </h4>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => setIsUploadOpen(true)}
                    leftIcon={<UploadCloud className="h-3.5 w-3.5" />}
                  >
                    رفع إصدار جديد
                  </Button>
                </div>

                <div className="border border-[var(--border)] rounded-[var(--radius-sm)] overflow-hidden">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border)] text-[var(--ink-secondary)]">
                      <tr>
                        <th className="p-2 text-start">الإصدار</th>
                        <th className="p-2 text-start">اسم الملف</th>
                        <th className="p-2 text-start">الحجم</th>
                        <th className="p-2 text-start">البصمة SHA-256</th>
                        <th className="p-2 text-start">بواسطة</th>
                        <th className="p-2 text-start">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {selectedDoc.versions.map((ver) => (
                        <tr key={ver.id} className="hover:bg-[var(--surface-hover)]">
                          <td className="p-2 font-bold text-[var(--accent)]">v{ver.versionNumber}</td>
                          <td className="p-2 font-semibold text-[var(--ink)] truncate max-w-[140px]">
                            {ver.originalName}
                          </td>
                          <td className="p-2 text-[var(--ink-secondary)]">{formatFileSize(ver.byteSize)}</td>
                          <td className="p-2 font-mono text-[10px] text-[var(--ink-muted)] truncate max-w-[100px]" title={ver.checksumSha256}>
                            {ver.checksumSha256.slice(0, 8)}...
                          </td>
                          <td className="p-2 text-[var(--ink)]">{ver.uploadedBy.name}</td>
                          <td className="p-2 text-[var(--ink-secondary)]">{formatDate(ver.createdAt, "ar")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload New Version Modal */}
      {isUploadOpen && selectedDoc && (
        <Dialog open={true} onOpenChange={() => setIsUploadOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[var(--ink)]">
                رفع إصدار جديد من: {selectedDoc.title}
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await uploadDocumentVersionAction(selectedDoc.id, projectSlug, formData);
                if (res.success) {
                  toast.success("New version uploaded successfully with SHA-256 validation");
                  setIsUploadOpen(false);
                  setSelectedDoc(null);
                } else {
                  toast.error(res.error || "Failed to upload version");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  اختر الملف (PDF, DOCX, PPTX, ZIP, etc. max 25MB)
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  className="w-full text-xs text-[var(--ink)] file:me-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-sm)] file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent)] file:text-white hover:file:opacity-90 cursor-pointer"
                />
              </div>

              <Textarea
                label="ملاحظات حول التعديلات في هذا الإصدار"
                name="note"
                placeholder="What changed in this version..."
              />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">بدء الرفع والتحقق</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Document Modal */}
      {isCreateOpen && (
        <Dialog open={true} onOpenChange={() => setIsCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[var(--ink)]">
                إنشاء مستند جديد (New Deliverable Document)
              </DialogTitle>
            </DialogHeader>

            <form
              action={async (formData) => {
                const res = await createDocumentAction(projectId, projectSlug, formData);
                if (res.success) {
                  toast.success("Document created successfully");
                  setIsCreateOpen(false);
                } else {
                  toast.error(res.error || "Failed to create document");
                }
              }}
              className="space-y-3 py-2 text-start"
            >
              <Input label="عنوان المستند" name="title" required placeholder="e.g. Final Architecture Report" />

              <Select label="التصنيف الأكاديمي" name="category">
                <option value="REPORT">تقرير أكاديمي (Report)</option>
                <option value="SRS">متطلبات البرمجيات (SRS)</option>
                <option value="PROPOSAL">مقترح المشروع (Proposal)</option>
                <option value="ARCHITECTURE">معمارية النظم (Architecture)</option>
                <option value="DATABASE">قاعدة البيانات (Database)</option>
                <option value="UI_UX">واجهة المستخدم (UI/UX)</option>
                <option value="TESTING">الاختبار وضمان الجودة (Testing)</option>
                <option value="PRESENTATION">عرض تقديمي (Presentation)</option>
                <option value="DEMO_ASSET">ملحقات العرض (Demo Asset)</option>
              </Select>

              <Textarea label="وصف المستند وأهدافه" name="description" placeholder="Description..." />

              <Input label="الوسوم (مفصولة بفواصل)" name="tags" placeholder="IEEE, Architecture, v1" />

              <DialogFooter className="pt-2">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ المستند</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
