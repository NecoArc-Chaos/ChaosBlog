import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveMemosOptions } from "../src/config/memosConfig.ts";

/** 精简的默认配置，按用例覆盖需要的字段。 */
function baseConfig(overrides = {}) {
	return {
		enable: true,
		apiUrl: "https://memos.example.com/api/v1/memos",
		pageSize: 200,
		maxItems: 0,
		imagePolicy: "remote",
		extractInlineTags: true,
		baseTags: ["memos"],
		defaultMood: "",
		pruneRemoved: true,
		manifestFile: ".memos-manifest.json",
		...overrides,
	};
}

describe("Memos 同步配置解析", () => {
	it("未启用时返回 null，脚本据此跳过同步", () => {
		assert.equal(resolveMemosOptions(baseConfig({ enable: false })), null);
	});

	it("端点不是 http(s) 时返回 null，避免构建期请求非法地址", () => {
		assert.equal(resolveMemosOptions(baseConfig({ apiUrl: "not-a-url" })), null);
		assert.equal(resolveMemosOptions(baseConfig({ apiUrl: "" })), null);
	});

	it("pageSize 被限制在服务端上限 200 以内，非法值回退默认值", () => {
		assert.equal(resolveMemosOptions(baseConfig({ pageSize: 999 }))?.pageSize, 200);
		assert.equal(resolveMemosOptions(baseConfig({ pageSize: 10 }))?.pageSize, 10);
		assert.equal(resolveMemosOptions(baseConfig({ pageSize: 0 }))?.pageSize, 200);
		assert.equal(resolveMemosOptions(baseConfig({ pageSize: -5 }))?.pageSize, 200);
		assert.equal(resolveMemosOptions(baseConfig({ pageSize: Number.NaN }))?.pageSize, 200);
	});

	it("maxItems 非正数一律视为不限制", () => {
		assert.equal(resolveMemosOptions(baseConfig({ maxItems: 0 }))?.maxItems, 0);
		assert.equal(resolveMemosOptions(baseConfig({ maxItems: -1 }))?.maxItems, 0);
		assert.equal(resolveMemosOptions(baseConfig({ maxItems: 5 }))?.maxItems, 5);
	});

	it("图片策略只接受 remote 与 local，其余回退 remote", () => {
		assert.equal(resolveMemosOptions(baseConfig({ imagePolicy: "local" }))?.imagePolicy, "local");
		assert.equal(resolveMemosOptions(baseConfig({ imagePolicy: "somewhere" }))?.imagePolicy, "remote");
	});

	it("清单文件名必须是隐藏的安全文件名，否则回退默认值", () => {
		assert.equal(
			resolveMemosOptions(baseConfig({ manifestFile: ".custom.json" }))?.manifestFile,
			".custom.json",
		);
		assert.equal(
			resolveMemosOptions(baseConfig({ manifestFile: "visible.json" }))?.manifestFile,
			".memos-manifest.json",
		);
		assert.equal(
			resolveMemosOptions(baseConfig({ manifestFile: "../escape.json" }))?.manifestFile,
			".memos-manifest.json",
		);
	});

	it("baseTags 过滤空字符串与非字符串", () => {
		assert.deepEqual(
			resolveMemosOptions(baseConfig({ baseTags: ["a", "", "  ", 42, "b"] }))?.baseTags,
			["a", "b"],
		);
	});

	it("环境变量优先于配置文件中的端点与令牌，便于部署环境覆盖", () => {
		const previousUrl = process.env.MEMOS_API_URL;
		const previousToken = process.env.MEMOS_TOKEN;
		try {
			process.env.MEMOS_API_URL = "https://env.example.com/api/v1/memos";
			process.env.MEMOS_TOKEN = "env-token";
			const resolved = resolveMemosOptions(
				baseConfig({
					apiUrl: "https://config.example.com/api/v1/memos",
					token: "file-token",
				}),
			);
			assert.equal(resolved?.apiUrl, "https://env.example.com/api/v1/memos");
			assert.equal(resolved?.token, "env-token");
		} finally {
			if (previousUrl === undefined) delete process.env.MEMOS_API_URL;
			else process.env.MEMOS_API_URL = previousUrl;
			if (previousToken === undefined) delete process.env.MEMOS_TOKEN;
			else process.env.MEMOS_TOKEN = previousToken;
		}
	});
});
