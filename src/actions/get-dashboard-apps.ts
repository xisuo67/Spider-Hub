'use server';

import { getDb } from '@/db';
import { appItem, i18nTranslation } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const getDashboardAppsAction = adminActionClient
  .schema(
    z.object({
      languageCode: z.string().optional(),
    })
  )
  .action(async ({ parsedInput }) => {
    const db = await getDb();
    const items = await db
      .select()
      .from(appItem)
      .where(and(eq(appItem.enable, true), isNull(appItem.parentId)))
      .orderBy(asc(appItem.sortOrder));

    const lang = parsedInput.languageCode;
    if (!lang || lang === 'en') {
      return {
        success: true,
        data: items.map((it) => ({
          id: it.id,
          key: it.key ?? undefined,
          title: it.title,
          description: it.description,
          icon: it.icon ?? '',
          link: it.link ?? '',
          sortOrder: it.sortOrder,
        })),
      };
    }

    const baseKeys = (items.map((it) => it.key).filter(Boolean) as string[]);
    const keysToFetch: string[] = [];
    for (const k of baseKeys) {
      keysToFetch.push(`${k}.title`, `${k}.description`);
    }
    const translations = keysToFetch.length
      ? await db
          .select({ key: i18nTranslation.key, value: i18nTranslation.value })
          .from(i18nTranslation)
          .where(and(eq(i18nTranslation.languageCode, lang), inArray(i18nTranslation.key, keysToFetch)))
      : [];
    const map = new Map(translations.map((t) => [t.key, t.value]));

    return {
      success: true,
      data: items.map((it) => {
        const k = it.key ?? '';
        const title = map.get(`${k}.title`) ?? it.title;
        const description = map.get(`${k}.description`) ?? it.description;
        return {
          id: it.id,
          key: it.key ?? undefined,
          title,
          description,
          icon: it.icon ?? '',
          link: it.link ?? '',
          sortOrder: it.sortOrder,
        };
      }),
    };
  });


