import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { DefenseSectionStatus, DefenseChecklistCategory, DefenseQuestionStatus } from "@/generated/prisma";
import type { User, DefensePlan, DefenseSection, DefenseChecklistItem, DefenseQuestion } from "@/generated/prisma";

export async function getOrCreateDefensePlan(projectId: string): Promise<DefensePlan> {
  let plan = await prisma.defensePlan.findUnique({
    where: { projectId },
    include: {
      sections: { orderBy: { order: "asc" } },
      checklist: { orderBy: { order: "asc" } },
      questions: { orderBy: { order: "asc" } },
      assets: { include: { documentVersion: true } },
    },
  });

  if (!plan) {
    const createdPlan = await prisma.defensePlan.create({
      data: { projectId },
      include: {
        sections: true,
        checklist: true,
        questions: true,
        assets: { include: { documentVersion: true } },
      },
    });
    plan = createdPlan;

    // Populate default checklist (docs/21)
    const defaultChecks = [
      { category: DefenseChecklistCategory.MATERIALS, title: "Final Slides Presentation (PPTX/PDF) validated" },
      { category: DefenseChecklistCategory.MATERIALS, title: "Printed Final Reports ready for Jury" },
      { category: DefenseChecklistCategory.DEMO, title: "Local demo build tested without external internet" },
      { category: DefenseChecklistCategory.DEMO, title: "Offline database seed executed and verified" },
      { category: DefenseChecklistCategory.DEMO, title: "Screen recording backup of full demo walkthrough prepared" },
      { category: DefenseChecklistCategory.EQUIPMENT, title: "HDMI/USB-C display adapters checked" },
      { category: DefenseChecklistCategory.EQUIPMENT, title: "Laptop chargers and presentation clicker ready" },
      { category: DefenseChecklistCategory.REHEARSAL, title: "Timed rehearsal under 15 minutes completed" },
    ];

    await prisma.defenseChecklistItem.createMany({
      data: defaultChecks.map((c, i) => ({
        planId: createdPlan.id,
        category: c.category,
        title: c.title,
        order: i + 1,
      })),
    });
  }

  return plan;
}

export async function updateDefensePlanDetails(
  actor: User,
  projectId: string,
  defenseAt?: Date | string | null,
  location?: string | null,
  demoScript?: string | null,
  backupPlan?: string | null,
  buildUrl?: string | null
): Promise<DefensePlan> {
  const plan = await getOrCreateDefensePlan(projectId);

  return prisma.defensePlan.update({
    where: { id: plan.id },
    data: {
      defenseAt: defenseAt ? new Date(defenseAt) : plan.defenseAt,
      location: location !== undefined ? location : plan.location,
      demoScript: demoScript !== undefined ? demoScript : plan.demoScript,
      backupPlan: backupPlan !== undefined ? backupPlan : plan.backupPlan,
      buildUrl: buildUrl !== undefined ? buildUrl : plan.buildUrl,
    },
  });
}

export async function addDefenseSection(
  actor: User,
  projectId: string,
  title: string,
  ownerId?: string | null,
  durationMinutes: number = 3,
  notes?: string | null
): Promise<DefenseSection> {
  const plan = await getOrCreateDefensePlan(projectId);
  const count = await prisma.defenseSection.count({ where: { planId: plan.id } });

  return prisma.defenseSection.create({
    data: {
      planId: plan.id,
      title: title.trim(),
      ownerId: ownerId || null,
      durationMinutes,
      notes: notes?.trim() || null,
      order: count + 1,
      status: DefenseSectionStatus.NOT_STARTED,
    },
  });
}

export async function toggleDefenseChecklistItem(
  actor: User,
  itemId: string,
  done: boolean
): Promise<DefenseChecklistItem> {
  return prisma.defenseChecklistItem.update({
    where: { id: itemId },
    data: {
      done,
      doneAt: done ? new Date() : null,
      ownerId: done ? actor.id : null,
    },
  });
}

export async function addDefenseQuestion(
  actor: User,
  projectId: string,
  question: string,
  answerNotes?: string | null,
  ownerId?: string | null
): Promise<DefenseQuestion> {
  const plan = await getOrCreateDefensePlan(projectId);
  const count = await prisma.defenseQuestion.count({ where: { planId: plan.id } });

  return prisma.defenseQuestion.create({
    data: {
      planId: plan.id,
      question: question.trim(),
      answerNotes: answerNotes?.trim() || null,
      ownerId: ownerId || null,
      status: answerNotes ? DefenseQuestionStatus.PREPARED : DefenseQuestionStatus.DRAFT,
      order: count + 1,
    },
  });
}

export async function calculateDefenseReadiness(projectId: string): Promise<number> {
  const plan = await getOrCreateDefensePlan(projectId);
  const items = await prisma.defenseChecklistItem.findMany({ where: { planId: plan.id } });
  if (items.length === 0) return 100;
  const done = items.filter((i) => i.done).length;
  return Math.round((done / items.length) * 100);
}
