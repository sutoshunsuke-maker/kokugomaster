import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, unitsTable, lessonsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/progress/summary", async (_req, res): Promise<void> => {
  const units = await db
    .select()
    .from(unitsTable)
    .orderBy(asc(unitsTable.orderIndex), asc(unitsTable.id));

  const lessons = await db
    .select()
    .from(lessonsTable)
    .orderBy(asc(lessonsTable.unitId), asc(lessonsTable.orderIndex), asc(lessonsTable.id));

  const totalUnits = units.length;
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.status === "completed").length;
  const inProgressLessons = lessons.filter((l) => l.status === "in_progress").length;
  const upcomingLessons = lessons.filter((l) => l.status === "upcoming").length;
  const completionPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Current lesson: first in_progress, or first upcoming
  const currentLesson =
    lessons.find((l) => l.status === "in_progress") ??
    lessons.find((l) => l.status === "upcoming") ??
    null;

  // Current unit: the unit containing the current lesson
  const currentUnit = currentLesson
    ? (units.find((u) => u.id === currentLesson.unitId) ?? null)
    : null;

  res.json({
    totalUnits,
    totalLessons,
    completedLessons,
    inProgressLessons,
    upcomingLessons,
    completionPercent,
    currentUnit: currentUnit
      ? { ...currentUnit, createdAt: currentUnit.createdAt.toISOString() }
      : null,
    currentLesson: currentLesson
      ? { ...currentLesson, createdAt: currentLesson.createdAt.toISOString() }
      : null,
  });
});

export default router;
