'use server';

import { getDb } from '@/db';
import { settings } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

export const listSettingsAction = adminActionClient
  .schema(
    z.object({
      pageIndex: z.number().min(0).default(0),
      pageSize: z.number().min(1).max(100).default(50),
      search: z.string().optional().default(''),
    })
  )
  .action(async ({ parsedInput }) => {
    const { pageIndex, pageSize, search } = parsedInput;
    const where = search ? ilike(settings.key, `%${search}%`) : undefined;
    const offset = pageIndex * pageSize;
    const db = await getDb();
    const [items, [{ count }]] = await Promise.all([
      db.select().from(settings).where(where).orderBy(settings.key).limit(pageSize).offset(offset),
      db.select({ count: sql`count(*)` }).from(settings).where(where),
    ]);
    return { success: true, data: { items, total: Number(count) } };
  });

export const createSettingAction = adminActionClient
  .schema(z.object({ key: z.string().min(1), value: z.string().min(0) }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    // Upsert: if key exists, update value
    const [created] = await db
      .insert(settings)
      .values({ key: parsedInput.key, value: parsedInput.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: parsedInput.value, updatedAt: sql`now()` } })
      .returning();
    return { success: true, data: created };
  });

export const updateSettingAction = adminActionClient
  .schema(z.object({ key: z.string().min(1), value: z.string().min(0) }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const [updated] = await db.update(settings).set({ value: parsedInput.value }).where(eq(settings.key, parsedInput.key)).returning();
    return { success: true, data: updated };
  });

export const deleteSettingAction = adminActionClient
  .schema(z.object({ key: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    await db.delete(settings).where(eq(settings.key, parsedInput.key));
    return { success: true };
  });


