import 'server-only'

import { getSetting } from '@/lib/settings/get-setting'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type PreRequestContext = {
	url: string
	method: HttpMethod
	headers: Headers
	body?: any
	init: RequestInit
}

export type PostResponseContext = {
	url: string
	method: HttpMethod
	headers: Headers
	status: number
	success: boolean
	durationMs: number
	error?: string
}

export type HttpClientOptions = {
	baseApiKeyName?: string // key name in settings, default 'BaseApi'
	apiKeyName?: string // key name in settings, default 'ApiKey'
	timeoutMs?: number // default 60s
	preRequest?: (ctx: PreRequestContext) => Promise<void> | void
	postResponse?: (ctx: PostResponseContext) => Promise<void> | void
}

const DEFAULT_TIMEOUT_MS = 60_000

// 说明：
// - 本文件为服务端 HTTP 客户端。
// - 会优先使用外部传入的 preRequest/postResponse 钩子；若未传入，则调用内部默认钩子（空实现）。
// - 自动从 settings 读取 BaseApi/ApiKey：
//   * BaseApi 用于拼接非 http(s) 开头的相对路径
//   * ApiKey 若调用方未自定义 Authorization，则自动注入为 "Bearer {ApiKey}"
// - 默认超时 60s，可在创建客户端时通过 timeoutMs 覆盖。

// 默认内部钩子（可在此添加全局行为；外部传入则优先生效）
async function defaultPreRequest(_ctx: PreRequestContext) {
	// 可在此添加：全局追踪 header、全局埋点、统一重试标记等
}

async function defaultPostResponse(_ctx: PostResponseContext) {
	// 可在此添加：全局日志记录、性能指标上报等
}

export function createHttpClient(opts: HttpClientOptions = {}) {
	const baseApiKeyName = opts.baseApiKeyName || 'BaseApi'
	const apiKeyName = opts.apiKeyName || 'ApiKey'
	const defaultTimeout = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS

	async function buildUrl(path: string): Promise<string> {
		const baseApi = (await getSetting(baseApiKeyName)) || ''
		if (!baseApi) return path
		if (/^https?:\/\//i.test(path)) return path
		return baseApi.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
	}

	function withTimeoutSignal(ms: number): AbortSignal {
		const ac = new AbortController()
		setTimeout(() => ac.abort(), ms)
		return ac.signal
	}

	// 统一请求入口：
	// - 负责：拼 URL、注入 Authorization、执行钩子、处理超时、解析 JSON/文本、回调 postResponse
	async function request<T>(method: HttpMethod, path: string, init: RequestInit & { query?: Record<string, any> } = {}): Promise<T> {
		const url = new URL(await buildUrl(path))
		if (init.query) {
			for (const [k, v] of Object.entries(init.query)) {
				if (v === undefined || v === null) continue
				url.searchParams.append(k, String(v))
			}
		}

		const headers = new Headers(init.headers || {})
		// 若未自定义 Authorization，则自动注入 Bearer {ApiKey}
		const apiKey = await getSetting(apiKeyName)
		if (apiKey && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${apiKey}`)

		const reqInit: RequestInit = {
			method,
			headers,
			body: init.body,
			signal: init.signal ?? withTimeoutSignal(defaultTimeout),
			redirect: init.redirect,
			credentials: init.credentials,
		}

		const preCtx: PreRequestContext = { url: url.toString(), method, headers, body: init.body, init: reqInit }
		// 外部钩子优先，未提供则调用内部默认钩子
		await (opts.preRequest ?? defaultPreRequest)(preCtx)

		const started = Date.now()
		let status = 0
		let success = false
		let error: string | undefined

		try {
			const res = await fetch(preCtx.url, preCtx.init)
			status = res.status
			success = res.ok
			if (!res.ok) {
				const txt = await res.text().catch(() => '')
				throw new Error(txt || `HTTP ${res.status}`)
			}
			const contentType = res.headers.get('content-type') || ''
			if (contentType.includes('application/json')) {
				const data = (await res.json()) as T
				await (opts.postResponse ?? defaultPostResponse)({ url: preCtx.url, method, headers: preCtx.headers, status, success: true, durationMs: Date.now() - started })
				return data
			}
			const text = (await res.text()) as unknown as T
			await (opts.postResponse ?? defaultPostResponse)({ url: preCtx.url, method, headers: preCtx.headers, status, success: true, durationMs: Date.now() - started })
			return text
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Request failed'
			await (opts.postResponse ?? defaultPostResponse)({ url: preCtx.url, method, headers: preCtx.headers, status, success: false, durationMs: Date.now() - started, error })
			throw e
		}
	}

	// 业务调用入口：get/post
	async function get<T>(path: string, opts?: { query?: Record<string, any>; headers?: HeadersInit; timeoutMs?: number }): Promise<T> {
		return request<T>('GET', path, { query: opts?.query, headers: opts?.headers })
	}

	async function post<T>(path: string, body?: any, opts?: { headers?: HeadersInit; timeoutMs?: number }): Promise<T> {
		const headers = new Headers(opts?.headers || {})
		if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
		return request<T>('POST', path, { headers, body: body != null ? JSON.stringify(body) : undefined })
	}

	return { get, post }
}
