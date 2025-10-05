'use server';

import { getDb } from '@/db';
import { appItem } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, eq, max } from 'drizzle-orm';
import { z } from 'zod';

const baseSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(200).optional().default(''),
  enable: z.boolean().optional().default(false),
  icon: z.string().optional().default(''),
  sortOrder: z.number().int().min(0).optional(),
});

export const createAppItemAction = adminActionClient
  .schema(baseSchema)
  .action(async ({ parsedInput }) => {
    const db = await getDb();

    let sortOrder = parsedInput.sortOrder;
    if (sortOrder === undefined || sortOrder === null) {
      const [{ maxSort }] = await db
        .select({ maxSort: max(appItem.sortOrder) })
        .from(appItem);
      sortOrder = (maxSort ?? 0) + 1;
    }

    const [created] = await db
      .insert(appItem)
      .values({
        id: crypto.randomUUID(),
        title: parsedInput.title,
        description: parsedInput.description ?? '',
        enable: parsedInput.enable ?? false,
        icon: parsedInput.icon ?? '',
        sortOrder,
      })
      .returning();

    return { success: true, data: created };
  });

export const updateAppItemAction = adminActionClient
  .schema(
    baseSchema.extend({
      id: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    const db = await getDb();

    const [updated] = await db
      .update(appItem)
      .set({
        title: parsedInput.title,
        description: parsedInput.description ?? '',
        enable: parsedInput.enable ?? false,
        icon: parsedInput.icon ?? '',
        sortOrder: parsedInput.sortOrder ?? undefined,
      })
      .where(eq(appItem.id, parsedInput.id))
      .returning();

    return { success: true, data: updated };
  });

export const deleteAppItemAction = adminActionClient
  .schema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    await db.delete(appItem).where(eq(appItem.id, parsedInput.id));
    return { success: true };
  });

export const toggleEnableAppItemAction = adminActionClient
  .schema(z.object({ id: z.string().min(1), enable: z.boolean() }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const [updated] = await db
      .update(appItem)
      .set({ enable: parsedInput.enable })
      .where(eq(appItem.id, parsedInput.id))
      .returning();
    return { success: true, data: updated };
  });


