import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { ProjectSettingsView } from "@/components/settings/project-settings-view";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project, membership } = await getProjectBySlug(slug, user);

  // Fetch all members (both active and inactive) with their user profile & systemRole
  const members = await prisma.projectMember.findMany({
    where: { projectId: project.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, systemRole: true },
      },
    },
    orderBy: [{ active: "desc" }, { role: "asc" }],
  });

  // Fetch active project invites
  const invites = await prisma.projectInvite.findMany({
    where: { projectId: project.id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  // Fetch candidate academic supervisors (users with faculty or admin roles)
  const candidateSupervisors = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [
        { systemRole: { in: ["DEPARTMENT_ADMIN", "SYSTEM_ADMIN"] } },
        { memberships: { some: { projectId: project.id, role: "SUPERVISOR" } } },
        { supervisedProjects: { some: { id: project.id } } },
      ],
    },
    select: { id: true, name: true, email: true, systemRole: true },
    orderBy: { name: "asc" },
    take: 40,
  });

  // Fetch recent governance audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      projectId: project.id,
      action: {
        in: [
          "PROJECT_MEMBER_UPDATED",
          "PROJECT_MEMBER_REMOVED",
          "PROJECT_INVITE_CREATED",
          "PROJECT_INVITE_REVOKED",
          "PROJECT_INVITE_ACCEPTED",
          "PROJECT_SUPERVISOR_ASSIGNED",
          "PROJECT_LEADERSHIP_TRANSFERRED",
          "PROJECT_SETTINGS_UPDATED",
          "USER_SYSTEM_ROLE_UPDATED",
        ],
      },
    },
    include: {
      actor: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          إعدادات المشروع وحوكمة الفريق (Project Settings & Governance)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          التحكم الدقيق في ميثاق المشروع، مصفوفة الصلاحيات والأدوار، محرك صحة المشروع، واستوديو العرض
        </p>
      </div>

      <ProjectSettingsView
        project={project as any}
        members={members as any}
        userRole={membership?.role || user.systemRole}
        invites={invites as any}
        auditLogs={auditLogs as any}
        candidateSupervisors={candidateSupervisors as any}
        currentUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          systemRole: user.systemRole,
          projectRole: membership?.role || null,
        }}
      />
    </div>
  );
}
