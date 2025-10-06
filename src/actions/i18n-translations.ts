'use server';

import { getDb } from '@/db';
import { i18nTranslation } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
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
      languageCode: z.string().optional(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { pageIndex, pageSize, search, languageCode } = parsedInput;
    const conditions = [] as any[];
    if (search) conditions.push(ilike(i18nTranslation.key, `%${search}%`));
    if (languageCode) conditions.push(eq(i18nTranslation.languageCode, languageCode));
    const where = conditions.length ? and(...conditions) : undefined;
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

// -----------------------------------------------------------------------------
// Import translations (skip existing key+languageCode)
// -----------------------------------------------------------------------------
export const importI18nTranslationsAction = adminActionClient
  .schema(
    z.object({
      languageCode: z.string().min(1).max(10),
      entries: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const { languageCode, entries } = parsedInput;

    const keys = entries.map((e) => e.key);
    const existing = await db
      .select({ key: i18nTranslation.key })
      .from(i18nTranslation)
      .where(and(eq(i18nTranslation.languageCode, languageCode), inArray(i18nTranslation.key, keys)));
    const existingSet = new Set(existing.map((e) => e.key));

    const toInsert = entries
      .filter((e) => !existingSet.has(e.key))
      .map((e) => ({ key: e.key, languageCode, value: e.value }));

    if (toInsert.length > 0) {
      await db.insert(i18nTranslation).values(toInsert);
    }

    return { success: true, data: { inserted: toInsert.length, skipped: entries.length - toInsert.length } };
  });

// -----------------------------------------------------------------------------
// Export translations by language
// -----------------------------------------------------------------------------
export const exportI18nTranslationsAction = adminActionClient
  .schema(z.object({ languageCode: z.string().min(1).max(10) }))
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const items = await db
      .select({ key: i18nTranslation.key, value: i18nTranslation.value })
      .from(i18nTranslation)
      .where(eq(i18nTranslation.languageCode, parsedInput.languageCode))
      .orderBy(i18nTranslation.key);
    return { success: true, data: { items } };
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


