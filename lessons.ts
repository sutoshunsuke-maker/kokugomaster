import { Router, type IRouter } from "express";
import { eq, asc, sql } from "drizzle-orm";
import { db, lessonsTable } from "@workspace/db";
import {
  CreateLessonBody,
  UpdateLessonBody,
  GetLessonParams,
  UpdateLessonParams,
  DeleteLessonParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lessons", async (_req, res): Promise<void> => {
  const lessons = await db
    .select()
    .from(lessonsTable)
    .orderBy(asc(lessonsTable.unitId), asc(lessonsTable.orderIndex), asc(lessonsTable.id));

  res.json(
    lessons.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  );
});

router.post("/lessons", async (req, res): Promise<void> => {
  const parsed = CreateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const maxOrder = await db
    .select({ max: sql<number>`COALESCE(MAX(${lessonsTable.orderIndex}), 0)` })
    .from(lessonsTable)
    .where(eq(lessonsTable.unitId, parsed.data.unitId));

  const [lesson] = await db
    .insert(lessonsTable)
    .values({
      unitId: parsed.data.unitId,
      title: parsed.data.title,
      memo: parsed.data.memo ?? null,
      status: (parsed.data.status as "upcoming" | "in_progress" | "completed") ?? "upcoming",
      lessonDate: parsed.data.lessonDate ?? null,
      orderIndex: parsed.data.orderIndex ?? (maxOrder[0].max + 1),
    })
    .returning();

  res.status(201).json({
    ...lesson,
    createdAt: lesson.createdAt.toISOString(),
  });
});

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, params.data.id));

  if (!lesson) {
    res.status(404).json({ error: "授業が見つかりません" });
    return;
  }

  res.json({
    ...lesson,
    createdAt: lesson.createdAt.toISOString(),
  });
});

router.patch("/lessons/:id", async (req, res): Promise<void> => {
  const params = UpdateLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof lessonsTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.memo !== undefined) updates.memo = parsed.data.memo;
  if (parsed.data.status !== undefined)
    updates.status = parsed.data.status as "upcoming" | "in_progress" | "completed";
  if (parsed.data.lessonDate !== undefined) updates.lessonDate = parsed.data.lessonDate;
  if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;
  if (parsed.data.unitId !== undefined) updates.unitId = parsed.data.unitId;

  const [lesson] = await db
    .update(lessonsTable)
    .set(updates)
    .where(eq(lessonsTable.id, params.data.id))
    .returning();

  if (!lesson) {
    res.status(404).json({ error: "授業が見つかりません" });
    return;
  }

  res.json({
    ...lesson,
    createdAt: lesson.createdAt.toISOString(),
  });
});

router.delete("/lessons/:id", async (req, res): Promise<void> => {
  const params = DeleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lesson] = await db
    .delete(lessonsTable)
    .where(eq(lessonsTable.id, params.data.id))
    .returning();

  if (!lesson) {
    res.status(404).json({ error: "授業が見つかりません" });
    return;
  }

  res.sendStatus(204);
});

export default router;
