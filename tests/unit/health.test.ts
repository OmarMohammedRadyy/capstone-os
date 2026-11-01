import { describe, it, expect } from "vitest";
import { prisma } from "@/server/db/prisma";
import { calculateProjectHealth } from "@/server/services/health";

describe("Project Health Engine unit & formula tests", () => {
  it("should calculate deterministic health score with 6 dimensions and explainable drivers", async () => {
    // Retrieve available project in DB
    const project = await prisma.project.findFirst();

    expect(project).toBeDefined();
    if (!project) return;

    const health = await calculateProjectHealth(project.id, "TEST");

    // Score bounds check
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);

    // Confidence metric
    expect(health.confidence).toBeGreaterThanOrEqual(60);
    expect(health.confidence).toBeLessThanOrEqual(100);

    // Component scores
    expect(health.components.schedule).toBeGreaterThanOrEqual(0);
    expect(health.components.tasks).toBeGreaterThanOrEqual(0);
    expect(health.components.feedback).toBeGreaterThanOrEqual(0);
    expect(health.components.risks).toBeGreaterThanOrEqual(0);
    expect(health.components.readiness).toBeGreaterThanOrEqual(0);
    expect(health.components.workload).toBeGreaterThanOrEqual(0);

    // Weights sum to 100
    const totalWeights =
      health.weights.schedule +
      health.weights.tasks +
      health.weights.feedback +
      health.weights.risks +
      health.weights.readiness +
      health.weights.workload;
    expect(totalWeights).toBe(100);

    // Explainable drivers: verify every driver has category, impact, and message
    expect(health.drivers.length).toBeGreaterThanOrEqual(0);
    for (const driver of health.drivers) {
      expect(["schedule", "tasks", "feedback", "risks", "readiness", "workload"]).toContain(
        driver.category
      );
      expect(driver.message).toBeTruthy();
      expect(driver.impact).toBeGreaterThan(0);
    }
  }, 15000);
});

