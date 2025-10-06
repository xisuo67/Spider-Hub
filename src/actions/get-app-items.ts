'use server';

import { getDb } from '@/db';
import { appItem } from '@/db/schema';
import { adminActionClient } from '@/lib/safe-action';
import { asc, desc, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

const getAppItemsSchema = z.object({
  pageIndex: z.number().min(0).default(0),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional().default(''),
  sorting: z
    .array(
      z.object({
        id: z.string(),
        desc: z.boolean(),
      })
    )
    .optional()
    .default([]),
});

const sortFieldMap = {
  key: appItem.key,
  title: appItem.title,
  enable: appItem.enable,
  sortOrder: appItem.sortOrder,
  createdAt: appItem.createdAt,
} as const;

export const getAppItemsAction = adminActionClient
  .schema(getAppItemsSchema)
  .action(async ({ parsedInput }) => {
    const { pageIndex, pageSize, search, sorting } = parsedInput;
    const where = search
      ? ilike(appItem.title, `%${search}%`)
      : undefined;

    const offset = pageIndex * pageSize;
    const sortConfig = sorting[0];
    const sortField = sortConfig?.id
      ? sortFieldMap[sortConfig.id as keyof typeof sortFieldMap]
      : appItem.sortOrder;
    const sortDirection = sortConfig?.desc ? desc : asc;

    const db = await getDb();
    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(appItem)
        .where(where)
        .orderBy(sortDirection(sortField))
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(appItem).where(where),
    ]);

    return {
      success: true,
      data: {
        items,
        total: Number(count),
      },
    };
  });


