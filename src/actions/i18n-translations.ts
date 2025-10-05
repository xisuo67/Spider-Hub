'use server';

import { getDb } from '@/db';
import { i18nTranslation } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

const baseSchema = z.object({
  key: z.string().min(1),
  languageCode: z.string().min(1).max(10),
  value: z.string().min(1),
});

export const listI18nTranslationsAction = adminActionClient
  .schema(
    z.object({
      pageIndex: z.number().min(0).default(0),
      pageSize: z.number().min(1).max(100).default(10),
      search: z.string().optional().default(''),
    })
  )
  .action(async ({ parsedInput }) => {
    const { pageIndex, pageSize, search } = parsedInput;
    const where = search
      ? ilike(i18nTranslation.key, `%${search}%`)
      : undefined;
    const offset = pageIndex * pageSize;
    const db = await getDb();
    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(i18nTranslation)
        .where(where)
        .orderBy(i18nTranslation.key)
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(i18nTranslation).where(where),
    ]);
    return { success: true, data: { items, total: Number(count) } };
  });

export const createI18nTranslationAction = adminActionClient
  .schema(baseSchema)
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const [created] = await db
      .insert(i18nTranslation)
      .values({ ...parsedInput })
      .returning();
    return { success: true, data: created };
  });

export const updateI18nTranslationAction = adminActionClient
  .schema(
    baseSchema.extend({
      id: z.number().int().positive(),
    })
  )
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const { id, ...rest } = parsedInput;
    const [updated] = await db
      .update(i18nTranslation)
      .set({ ...rest })
      .where(eq(i18nTranslation.id, id))
      .returning();
    return { success: true, data: updated };
  });

export const deleteI18nTranslationAction = adminActionClient
  .schema(z.object({ id: z.number().int().positive() }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    await db.delete(i18nTranslation).where(eq(i18nTranslation.id, parsedInput.id));
    return { success: true };
  });


