"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { emitGuideAction } from "@/features/user-guide";

export function RecomputeHealthButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRecompute = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/health/recompute`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        toast.success(
          `تم تحديث مؤشر أداء المشروع (${json.data?.score ?? 100}/100)`
        );
        emitGuideAction("health.recomputed");
        router.refresh();
      } else {
        toast.error("فشل تحديث مؤشر الأداء");
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث المؤشرات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="xs"
      onClick={handleRecompute}
      loading={loading}
      leftIcon={<RefreshCw className="h-3.5 w-3.5 text-[var(--accent)]" />}
    >
      تحديث المؤشرات
    </Button>
  );
}

