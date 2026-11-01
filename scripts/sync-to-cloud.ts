/**
 * Capstone OS — Cloud Migration & Data Sync
 * Usage: $env:TARGET_DATABASE_URL="postgresql://..."; pnpm tsx scripts/sync-to-cloud.ts
 */
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { prisma as localPrisma } from "../src/server/db/prisma";

async function main() {
  const targetUrl = process.env.TARGET_DATABASE_URL || process.argv[2];

  if (!targetUrl || !targetUrl.startsWith("postgres")) {
    console.error("Error: Please provide a valid TARGET_DATABASE_URL");
    console.error("Usage: pnpm tsx scripts/sync-to-cloud.ts \"postgresql://user:pass@host/db?sslmode=require\"");
    process.exit(1);
  }

  console.log("Connecting to target cloud database...");
  const targetAdapter = new PrismaPg({ connectionString: targetUrl });
  const cloudPrisma = new PrismaClient({ adapter: targetAdapter });

  try {
    // 1. Fetch real local users
    const users = await localPrisma.user.findMany({
      where: {
        NOT: { email: { endsWith: "@example.edu" } },
      },
    });
    console.log(`Found ${users.length} real local users.`);

    // 2. Fetch real local projects
    const projects = await localPrisma.project.findMany({
      where: {
        NOT: { slug: { startsWith: "scop-smart-campus" } },
      },
      include: {
        phases: true,
        defensePlan: true,
        members: true,
      },
    });
    console.log(`Found ${projects.length} real local projects.`);

    // 3. Insert users into cloud DB
    for (const u of users) {
      await cloudPrisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          passwordHash: u.passwordHash,
          systemRole: u.systemRole,
          locale: u.locale,
        },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          systemRole: u.systemRole,
          locale: u.locale,
        },
      });
      console.log(`Synced user: ${u.email} (${u.name})`);
    }

    // 4. Insert projects into cloud DB
    for (const p of projects) {
      await cloudPrisma.project.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          code: p.code,
          slug: p.slug,
          academicYear: p.academicYear,
          department: p.department,
          status: p.status,
          createdById: p.createdById,
        },
        create: {
          id: p.id,
          title: p.title,
          code: p.code,
          slug: p.slug,
          academicYear: p.academicYear,
          department: p.department,
          status: p.status,
          createdById: p.createdById,
          startDate: p.startDate,
          endDate: p.endDate,
        },
      });

      // Insert phases
      for (const ph of p.phases) {
        await cloudPrisma.phase.upsert({
          where: { id: ph.id },
          update: { name: ph.name, status: ph.status, order: ph.order },
          create: {
            id: ph.id,
            projectId: ph.projectId,
            name: ph.name,
            status: ph.status,
            order: ph.order,
            progressStrategy: ph.progressStrategy,
          },
        });
      }

      // Insert defense plan
      if (p.defensePlan) {
        await cloudPrisma.defensePlan.upsert({
          where: { id: p.defensePlan.id },
          update: {},
          create: {
            id: p.defensePlan.id,
            projectId: p.defensePlan.projectId,
          },
        });
      }

      // Insert members
      for (const m of p.members) {
        await cloudPrisma.projectMember.upsert({
          where: { id: m.id },
          update: { role: m.role, active: m.active },
          create: {
            id: m.id,
            projectId: m.projectId,
            userId: m.userId,
            role: m.role,
            active: m.active,
          },
        });
      }
      console.log(`Synced project: ${p.title} (${p.code}) with phases and members.`);
    }

    console.log("\nSUCCESS: All real users and projects are synced to the cloud database!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await cloudPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

main();

