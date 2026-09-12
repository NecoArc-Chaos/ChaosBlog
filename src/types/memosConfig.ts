/**
 * Memos 动态同步配置类型。
 *
 * 配置管行为与连接信息，脚本 `scripts/memos/sync-moments.mjs` 消费它，
 * 在构建期把 Memos API 的动态物化为 `src/content/moments/*.md`。
 */
export type MemosImagePolicy = "remote" | "local";

export type MemosConfig = {
	/** 是否在构建期从 Memos API 同步动态 */
	enable: boolean;
	/** Memos API 的动态列表端点 */
	apiUrl: string;
	/** 可选的访问令牌（公开实例留空） */
	token?: string;
	/** 单页请求条数（Memos 服务端上限通常为 200） */
	pageSize?: number;
	/** 最多同步条数，0 表示不限制 */
	maxItems?: number;
	/** 图片处理策略：远端链接或下载到本地 */
	imagePolicy?: MemosImagePolicy;
	/** 正文中的 `#标签` 是否并入 frontmatter tags 并从正文移除 */
	extractInlineTags?: boolean;
	/** 写入 frontmatter 的固定标签 */
	baseTags?: string[];
	/** 默认心情图标名（留空则卡片不显示心情） */
	defaultMood?: string;
	/** 是否清理远端已删除、且由本脚本生成的文件 */
	pruneRemoved?: boolean;
	/** 生成清单文件名 */
	manifestFile?: string;
};

/** 脚本解析后的归一化选项。 */
export type ResolvedMemosOptions = {
	apiUrl: string;
	token: string;
	pageSize: number;
	maxItems: number;
	imagePolicy: MemosImagePolicy;
	extractInlineTags: boolean;
	baseTags: string[];
	defaultMood: string;
	pruneRemoved: boolean;
	manifestFile: string;
};
