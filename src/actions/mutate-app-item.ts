'use server';

import { getDb } from '@/db';
import { appItem } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, eq, max } from 'drizzle-orm';
import { z } from 'zod';

const baseSchema = z.object({
  key: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().max(200).optional().default(''),
  enable: z.boolean().optional().default(false),
  icon: z.string().optional().default(''),
  link: z
    .union([
      z.string().url(), // absolute URL
      z.string().regex(/^\/[\S]*$/), // relative path starting with /
      z.literal(''), // allow empty string
    ])
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  parentId: z.string().optional().nullable(),
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
    const newId = crypto.randomUUID();

    const [created] = await db
      .insert(appItem)
      .values({
        id: newId,
        key: (parsedInput.key && parsedInput.key.trim()) || newId,
        parentId: parsedInput.parentId ?? null,
        title: parsedInput.title,
        description: parsedInput.description ?? '',
        enable: parsedInput.enable ?? false,
        icon: parsedInput.icon ?? '',
        link: parsedInput.link ?? '',
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

    const updateData: any = {
      title: parsedInput.title,
      description: parsedInput.description ?? '',
      enable: parsedInput.enable ?? false,
      icon: parsedInput.icon ?? '',
      link: parsedInput.link ?? '',
      sortOrder: parsedInput.sortOrder ?? undefined,
    };
    if (typeof parsedInput.key !== 'undefined') {
      updateData.key = parsedInput.key; // rely on schema to validate if provided
    }
    if (typeof parsedInput.parentId !== 'undefined') {
      updateData.parentId = parsedInput.parentId ?? null;
    }

    const [updated] = await db
      .update(appItem)
      .set(updateData)
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


