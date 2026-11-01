import { prisma } from "@/server/db/prisma";

export interface SearchResultItem {
  id: string;
  type: "task" | "milestone" | "feedback" | "document" | "decision" | "risk" | "issue" | "meeting";
  title: string;
  subtitle?: string;
  href: string;
}

export async function searchProject(
  projectId: string,
  projectSlug: string,
  query: string
): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  // Scoped queries with case-insensitive search
  const [tasks, milestones, feedback, documents, decisions, risks, issues, meetings] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, number: true, title: true, status: true },
      }),
      prisma.milestone.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { objective: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, status: true },
      }),
      prisma.feedback.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, severity: true },
      }),
      prisma.document.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, category: true },
      }),
      prisma.decision.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { context: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, number: true, title: true, status: true },
      }),
      prisma.risk.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, probability: true, impact: true },
      }),
      prisma.issue.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, severity: true },
      }),
      prisma.meeting.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { notes: { contains: q, mode: "insensitive" } }],
        },
        take: 5,
        select: { id: true, title: true, scheduledAt: true },
      }),
    ]);

  const results: SearchResultItem[] = [];

  for (const t of tasks) {
    results.push({
      id: t.id,
      type: "task",
      title: `#${t.number} ${t.title}`,
      subtitle: `Task • Status: ${t.status}`,
      href: `/app/p/${projectSlug}/tasks?id=${t.id}`,
    });
  }

  for (const m of milestones) {
    results.push({
      id: m.id,
      type: "milestone",
      title: m.title,
      subtitle: `Milestone • Status: ${m.status}`,
      href: `/app/p/${projectSlug}/milestones`,
    });
  }

  for (const f of feedback) {
    results.push({
      id: f.id,
      type: "feedback",
      title: f.title,
      subtitle: `Feedback • Severity: ${f.severity}`,
      href: `/app/p/${projectSlug}/feedback`,
    });
  }

  for (const d of documents) {
    results.push({
      id: d.id,
      type: "document",
      title: d.title,
      subtitle: `Document • ${d.category}`,
      href: `/app/p/${projectSlug}/documents`,
    });
  }

  for (const dec of decisions) {
    results.push({
      id: dec.id,
      type: "decision",
      title: `DEC-${dec.number}: ${dec.title}`,
      subtitle: `Decision • ${dec.status}`,
      href: `/app/p/${projectSlug}/decisions`,
    });
  }

  for (const r of risks) {
    results.push({
      id: r.id,
      type: "risk",
      title: r.title,
      subtitle: `Risk • Exposure: ${r.probability * r.impact}/25`,
      href: `/app/p/${projectSlug}/risks`,
    });
  }

  for (const i of issues) {
    results.push({
      id: i.id,
      type: "issue",
      title: i.title,
      subtitle: `Issue • Severity: ${i.severity}`,
      href: `/app/p/${projectSlug}/risks?tab=issues`,
    });
  }

  for (const meet of meetings) {
    results.push({
      id: meet.id,
      type: "meeting",
      title: meet.title,
      subtitle: `Meeting`,
      href: `/app/p/${projectSlug}/meetings`,
    });
  }

  return results;
}

