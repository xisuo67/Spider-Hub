import 'server-only'

import { getDb } from '@/db'
import { settings } from '@/db/schema'
import { and, eq, inArray } from 'drizzle-orm'

// Simple in-memory cache with TTL per key
const cache = new Map<string, { value: string; expireAt: number }>()

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function getSetting(key: string, ttlMs: number = DEFAULT_TTL_MS): Promise<string | undefined> {
	const now = Date.now()
	const hit = cache.get(key)
	if (hit && hit.expireAt > now) return hit.value

	const db = await getDb()
	const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
	const value = rows[0]?.value
	if (value !== undefined) cache.set(key, { value, expireAt: now + ttlMs })
	return value
}

export async function getSettings(keys: string[], ttlMs: number = DEFAULT_TTL_MS): Promise<Record<string, string | undefined>> {
	const now = Date.now()
	const result: Record<string, string | undefined> = {}
	const missing: string[] = []

	for (const k of keys) {
		const hit = cache.get(k)
		if (hit && hit.expireAt > now) {
			result[k] = hit.value
		} else {
			missing.push(k)
		}
	}

	if (missing.length > 0) {
		const db = await getDb()
		const rows = await db.select().from(settings).where(inArray(settings.key, missing))
		for (const row of rows) {
			cache.set(row.key, { value: row.value, expireAt: now + ttlMs })
			result[row.key] = row.value
		}
		for (const k of missing) if (!(k in result)) result[k] = undefined
	}

	return result
}
