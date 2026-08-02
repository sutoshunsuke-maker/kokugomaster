import { Router, type IRouter } from "express";
import { eq, asc, sql } from "drizzle-orm";
import { db, unitsTable, lessonsTable } from "@workspace/db";
import {
  CreateUnitBody,
  UpdateUnitBody,
  GetUnitParams,
  UpdateUnitParams,
  DeleteUnitParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/units", async (_req, res): Promise<void> => {
  const units = await db
    .select()
    .from(unitsTable)
    .orderBy(asc(unitsTable.orderIndex), asc(unitsTable.id));

  const results = await Promise.all(
    units.map(async (unit) => {
      const lessons = await db
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.unitId, unit.id))
        .orderBy(asc(lessonsTable.orderIndex), asc(lessonsTable.id));

      const completedCount = lessons.filter((l) => l.status === "completed").length;

      return {
        ...unit,
        createdAt: unit.createdAt.toISOString(),
        lessons: lessons.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        })),
        completedCount,
        totalCount: lessons.length,
      };
    }),
  );

  res.json(results);
});

router.post("/units", async (req, res): Promise<void> => {
  const parsed = CreateUnitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const maxOrder = await db
    .select({ max: sql<number>`COALESCE(MAX(${unitsTable.orderIndex}), 0)` })
    .from(unitsTable);

  const [unit] = await db
    .insert(unitsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      orderIndex: parsed.data.orderIndex ?? (maxOrder[0].max + 1),
    })
    .returning();

  res.status(201).json({
    ...unit,
    createdAt: unit.createdAt.toISOString(),
  });
});

router.get("/units/:id", async (req, res): Promise<void> => {
  const params = GetUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [unit] = await db
    .select()
    .from(unitsTable)
    .where(eq(unitsTable.id, params.data.id));

  if (!unit) {
    res.status(404).json({ error: "単元が見つかりません" });
    return;
  }

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.unitId, unit.id))
    .orderBy(asc(lessonsTable.orderIndex), asc(lessonsTable.id));

  const completedCount = lessons.filter((l) => l.status === "completed").length;

  res.json({
    ...unit,
    createdAt: unit.createdAt.toISOString(),
    lessons: lessons.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    completedCount,
    totalCount: lessons.length,
  });
});

router.patch("/units/:id", async (req, res): Promise<void> => {
  const params = UpdateUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUnitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof unitsTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.orderIndex !== undefined) updates.orderIndex = parsed.data.orderIndex;

  const [unit] = await db
    .update(unitsTable)
    .set(updates)
    .where(eq(unitsTable.id, params.data.id))
    .returning();

  if (!unit) {
    res.status(404).json({ error: "単元が見つかりません" });
    return;
  }

  res.json({
    ...unit,
    createdAt: unit.createdAt.toISOString(),
  });
});

router.delete("/units/:id", async (req, res): Promise<void> => {
  const params = DeleteUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [unit] = await db
    .delete(unitsTable)
    .where(eq(unitsTable.id, params.data.id))
    .returning();

  if (!unit) {
    res.status(404).json({ error: "単元が見つかりません" });
    return;
  }

  res.sendStatus(204);
});

export default router;
