import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { ProjectRole } from "@/generated/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch available academic supervisors
  const supervisors = await prisma.user.findMany({
    where: {
      OR: [
        { systemRole: { in: ["DEPARTMENT_ADMIN", "SYSTEM_ADMIN"] } },
        { memberships: { some: { role: "SUPERVISOR" } } },
        { supervisedProjects: { some: {} } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
          إنشاء مشروع تخرج جديد (Initiate Capstone Project)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)] mt-1">
          تأسيس مساحة العمل الأكاديمية، تهيئة المراحل العشر القياسية، وتعيين المشرف الأكاديمي
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-bold text-[var(--ink)]">
            بيانات الميثاق والتأسيس
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <NewProjectForm supervisors={supervisors} />
        </CardContent>
      </Card>
    </div>
  );
}
