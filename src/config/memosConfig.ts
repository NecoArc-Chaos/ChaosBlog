import type { MemosConfig, ResolvedMemosOptions } from "../types/memosConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * Memos 动态同步配置单一真源。
 *
 * 构建期（`pnpm memos:sync`，已挂在 `pnpm build` 前）从一个公开的 Memos API
 * 拉取动态，转换为 `src/content/moments/*.md`，随后由站点常规的 SSR 渲染链
 * 处理。这样既保持 Shirone「SSR 优先、零运行时请求」的架构，又让动态内容
 * 随构建自动更新。
 *
 * 【使用要点】
 * - `enable: false` 时脚本空转，`src/content/moments/` 保持仓库中的静态内容；
 * - 拉取失败（网络 / API 变更 / 服务下线）时脚本保留既有文件并以成功状态退出，
 *   绝不因外部服务异常而阻断部署；
 * - 附件图片默认保留 Memos 远端链接（`imagePolicy: "remote"`），
 *   设为 `"local"` 可将图片下载到 `public/images/moments/` 并纳入构建期缩略图；
 * - 访问令牌请用环境变量 `MEMOS_TOKEN` 注入，不要写进本文件。
 */
export const memosConfig: MemosConfig = withUserConfig("memos", {
	/** 是否在构建期从 Memos API 同步动态 */
	enable: true,
	/** Memos API 的动态列表端点 */
	apiUrl: "https://memos.nachaos.xyz/api/v1/memos",
	/** 可选的访问令牌（公开实例留空；优先读环境变量 MEMOS_TOKEN） */
	token: "",
	/** 单页请求条数（Memos 服务端上限通常为 200） */
	pageSize: 200,
	/** 最多同步条数，0 表示不限制 */
	maxItems: 0,
	/**
	 * 图片处理策略：
	 * - "remote"：保留 Memos 远端链接（仓库轻量，依赖 Memos 服务可访问）
	 * - "local"：下载到 public/images/moments/，由构建期生成响应式缩略图
	 */
	imagePolicy: "remote",
	/** 正文中解析出的 `#标签` 是否并入 frontmatter 的 tags（并从正文移除） */
	extractInlineTags: true,
	/** 写入 frontmatter 的固定标签，便于在站点上聚合筛选 */
	baseTags: ["memos"],
	/** 默认心情图标（Memos 无此概念时统一下发；留空则卡片不显示心情） */
	defaultMood: "",
	/**
	 * 同步时是否删除仓库中已不存在于远端、且同样由本脚本生成的文件。
	 * 脚本只清理自己写入过的文件（依据生成清单），不会触碰手写动态。
	 */
	pruneRemoved: true,
	/** 生成清单文件名（保存在 moments 目录内，用于识别脚本生成的文件） */
	manifestFile: ".memos-manifest.json",
});

const DEFAULT_PAGE_SIZE = 200;
const VALID_IMAGE_POLICIES = new Set(["remote", "local"]);
const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** 环境变量优先，便于在不同部署环境覆盖端点与令牌。 */
function readEnvString(name) {
	const value = process.env[name];
	return typeof value === "string" && value.trim() !== "" ? value.trim() : "";
}

/**
 * 校验并归一化 Memos 同步选项。
 * 未启用、端点非法或令牌缺失等情况下返回 null，调用方按「不同步」处理。
 */
export function resolveMemosOptions(
	config: MemosConfig,
): ResolvedMemosOptions | null {
	if (!config.enable) return null;

	const apiUrl =
		readEnvString("MEMOS_API_URL") || String(config.apiUrl ?? "").trim();
	if (!/^https?:\/\//i.test(apiUrl)) return null;

	const token =
		readEnvString("MEMOS_TOKEN") || String(config.token ?? "").trim();

	const rawPageSize = Number(config.pageSize ?? DEFAULT_PAGE_SIZE);
	const pageSize =
		Number.isFinite(rawPageSize) && rawPageSize > 0
			? Math.min(Math.floor(rawPageSize), 200)
			: DEFAULT_PAGE_SIZE;

	const rawMaxItems = Number(config.maxItems ?? 0);
	const maxItems =
		Number.isFinite(rawMaxItems) && rawMaxItems > 0
			? Math.floor(rawMaxItems)
			: 0;

	const imagePolicy = VALID_IMAGE_POLICIES.has(String(config.imagePolicy))
		? /** @type {"remote" | "local"} */ (config.imagePolicy)
		: "remote";

	const manifestFile =
		typeof config.manifestFile === "string" &&
		SAFE_FILENAME_PATTERN.test(config.manifestFile) &&
		config.manifestFile.startsWith(".")
			? config.manifestFile
			: ".memos-manifest.json";

	const baseTags = Array.isArray(config.baseTags)
		? config.baseTags.filter(
				(tag) => typeof tag === "string" && tag.trim() !== "",
			)
		: [];

	return {
		apiUrl,
		token,
		pageSize,
		maxItems,
		imagePolicy,
		extractInlineTags: config.extractInlineTags !== false,
		baseTags,
		defaultMood:
			typeof config.defaultMood === "string" ? config.defaultMood.trim() : "",
		pruneRemoved: config.pruneRemoved !== false,
		manifestFile,
	};
}
