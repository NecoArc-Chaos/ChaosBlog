/**
 * Memos 动态同步：把一个公开 Memos 实例的动态物化为 `src/content/moments/*.md`。
 *
 * 设计要点（与 `docs/remote-data-system.md` 的双平面模型一致）：
 * - 外部网络请求只发生在显式调用（`pnpm memos:sync` / 构建前）阶段，
 *   页面运行期与 SSR 阶段零外部请求；
 * - 拉取失败时保留仓库既有内容并非零退出，避免外部服务故障阻断部署；
 * - 只清理「上次由本脚本生成」的文件（依据生成清单），绝不触碰手写动态；
 * - 凭据（token）只从环境变量 / 配置读取，绝不写入产物与日志。
 *
 * 用法：
 *   node scripts/memos/sync-moments.mjs [--dry-run] [--quiet] [--no-prune]
 */

import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { memosConfig, resolveMemosOptions } from "../../src/config/memosConfig.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const MOMENTS_DIR = join(projectRoot, "src", "content", "moments");
const LOCAL_IMAGE_DIR = join(projectRoot, "public", "images", "moments");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const QUIET = args.includes("--quiet");
const NO_PRUNE = args.includes("--no-prune");

const log = (...parts) => {
	if (!QUIET) console.log("[memos]", ...parts);
};

/** 日志脱敏：令牌即便误入错误信息也不会被打印出来。 */
function redact(value) {
	let text = String(value ?? "");
	if (process.env.MEMOS_TOKEN) {
		text = text.split(process.env.MEMOS_TOKEN).join("***");
	}
	return text.replace(/(authorization|bearer|token)\s*[:=]?\s*\S+/gi, "$1 ***");
}

const warn = (...parts) => console.warn("[memos]", ...parts.map(redact));

/** 生成清单：记录本脚本写入的文件与其内容哈希，用于安全清理与增量比较。 */
function readManifest(manifestPath) {
	if (!existsSync(manifestPath)) return { version: 1, files: {} };
	try {
		const parsed = JSON.parse(readFileSync(manifestPath, "utf8"));
		if (parsed && typeof parsed.files === "object" && parsed.files !== null) {
			return parsed;
		}
	} catch {
		// 清单损坏时按空处理，后续重新生成。
	}
	return { version: 1, files: {} };
}

/** 取得某一时刻在目标时区的 UTC 偏移（分钟）。 */
function getOffsetMinutes(date, timeZone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).formatToParts(date);
	const pick = (type) => parts.find((part) => part.type === type)?.value ?? "";
	const hour = pick("hour") === "24" ? "0" : pick("hour");
	const asUTC = Date.UTC(
		Number(pick("year")),
		Number(pick("month")) - 1,
		Number(pick("day")),
		Number(hour),
		Number(pick("minute")),
		Number(pick("second")),
	);
	// 抹掉毫秒，避免偏差进入分钟计算。
	return Math.round((asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** 把 Memos 的 UTC 时间串转换为站点时区的带偏移 ISO 字符串。 */
function toZonedISO(utcString, timeZone) {
	const date = new Date(utcString);
	if (Number.isNaN(date.getTime())) return null;

	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(date);
	const pick = (type) => parts.find((part) => part.type === type)?.value ?? "";
	const hour = pick("hour") === "24" ? "00" : pick("hour");
	const stamp = `${pick("year")}-${pick("month")}-${pick("day")}T${hour}:${pick("minute")}:${pick("second")}`;

	const total = getOffsetMinutes(date, timeZone);
	const sign = total >= 0 ? "+" : "-";
	const abs = Math.abs(total);
	const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;

	return `${stamp}${offset}`;
}

/** 从正文中抽出 `#标签`（Memos 约定），返回清洗后的正文与标签列表。 */
function extractInlineTags(content) {
	const tags = [];
	const cleaned = content.replace(/(^|\s)#([^\s#]+)/g, (match, lead, tag) => {
		tags.push(tag);
		return lead;
	});
	return { content: cleaned.replace(/[ \t]+$/gm, "").trim(), tags };
}

/** 收集一条动态的图片附件，产出 moments frontmatter 需要的 images 数组。 */
function collectImages(memo, options, downloaded) {
	const attachments = Array.isArray(memo.attachments) ? memo.attachments : [];
	const images = [];
	for (const attachment of attachments) {
		const type = typeof attachment?.type === "string" ? attachment.type : "";
		const name = typeof attachment?.name === "string" ? attachment.name : "";
		const filename =
			typeof attachment?.filename === "string" ? attachment.filename : "";
		if (!type.startsWith("image/") || !name || !filename) continue;

		if (options.imagePolicy === "local") {
			const relative = `moments/${filename}`;
			const publicPath = `/images/${relative}`;
			downloaded.push({ attachment, relative, publicPath });
			images.push({ src: publicPath, alt: filename });
		} else {
			const base = options.apiUrl.replace(/\/api\/v1\/memos\/?$/, "");
			images.push({
				src: `${base}/file/${name}/${encodeURIComponent(filename)}`,
				alt: filename,
			});
		}
	}
	return images;
}

/** YAML 标量安全输出：需要时使用双引号，避免 `#`、`:`、前导空格等被误解析。 */
function yamlScalar(value) {
	const text = String(value);
	if (text === "") return '""';
	if (/^[A-Za-z0-9_./@+\- ]+$/.test(text) && !/^\s|\s$/.test(text)) return text;
	return JSON.stringify(text);
}

/** 组装 moments markdown 文件内容。 */
function buildMarkdown({ published, pinned, mood, tags, images, content }) {
	const lines = ["---", `published: ${published}`];
	if (pinned) lines.push("pinned: true");
	if (mood) lines.push(`mood: ${yamlScalar(mood)}`);
	if (tags.length > 0) {
		lines.push("tags:");
		for (const tag of tags) lines.push(`  - ${yamlScalar(tag)}`);
	}
	if (images.length > 0) {
		lines.push("images:");
		for (const image of images) {
			lines.push(`  - src: ${yamlScalar(image.src)}`);
			if (image.alt) lines.push(`    alt: ${yamlScalar(image.alt)}`);
		}
	}
	lines.push("---", "", content.trim() === "" ? "" : content.trim(), "");
	return lines.join("\n");
}

/** 文件名：`YYYY-MM-DD-<memo id 前缀>.md`，保证稳定、可读、可排序。 */
function buildFilename(published, memoName) {
	const id = String(memoName).split("/").pop() ?? "memo";
	const short = id.slice(0, 8);
	return `${published.slice(0, 10)}-${short}.md`;
}

async function fetchAllMemos(options) {
	const collected = [];
	let pageToken = "";
	let guard = 0;

	do {
		if (guard++ > 50) {
			warn("分页次数过多，提前结束");
			break;
		}
		const url = new URL(options.apiUrl);
		url.searchParams.set("pageSize", String(options.pageSize));
		if (pageToken) url.searchParams.set("pageToken", pageToken);

		const headers = { Accept: "application/json" };
		if (options.token) headers.Authorization = `Bearer ${options.token}`;

		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}
		const payload = await response.json();
		const memos = Array.isArray(payload?.memos) ? payload.memos : [];
		collected.push(...memos);

		pageToken = typeof payload?.nextPageToken === "string" ? payload.nextPageToken : "";
		if (options.maxItems > 0 && collected.length >= options.maxItems) break;
	} while (pageToken);

	return options.maxItems > 0 ? collected.slice(0, options.maxItems) : collected;
}

async function downloadImage(attachment, targetPath, apiUrl) {
	const url = attachment?.externalLink
		? attachment.externalLink
		: `${apiUrl.replace(/\/api\/v1\/memos\/?$/, "")}/file/${attachment.name}/${encodeURIComponent(attachment.filename)}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`图片下载失败 HTTP ${response.status}`);
	const buffer = Buffer.from(await response.arrayBuffer());
	mkdirSync(dirname(targetPath), { recursive: true });
	writeFileSync(targetPath, buffer);
}

async function main() {
	const options = resolveMemosOptions(memosConfig);
	if (!options) {
		log("未启用（enable: false），跳过同步，保持仓库既有内容");
		return;
	}

	log(`拉取 ${options.apiUrl}`);
	let memos;
	try {
		memos = await fetchAllMemos(options);
	} catch (error) {
		warn(`拉取失败，保留仓库既有内容：${error.message}`);
		return;
	}

	const visible = memos.filter((memo) => memo?.state === "NORMAL");
	log(`取得 ${memos.length} 条，其中 NORMAL ${visible.length} 条`);

	mkdirSync(MOMENTS_DIR, { recursive: true });
	const manifestPath = join(MOMENTS_DIR, options.manifestFile);
	const manifest = readManifest(manifestPath);

	const written = {};
	const seen = new Set();
	const downloaded = [];

	for (const memo of visible) {
		const published = toZonedISO(memo.createTime, "Asia/Shanghai");
		if (!published) {
			warn(`跳过时间无法解析的动态：${memo.name}`);
			continue;
		}

		const rawContent = typeof memo.content === "string" ? memo.content : "";
		const inline = options.extractInlineTags
			? extractInlineTags(rawContent)
			: { content: rawContent.trim(), tags: [] };

		const tags = [...options.baseTags, ...inline.tags];
		const images = collectImages(memo, options, downloaded);
		const filename = buildFilename(published, memo.name);

		const body = buildMarkdown({
			published,
			pinned: memo.pinned === true,
			mood: options.defaultMood,
			tags,
			images,
			content: inline.content,
		});

		const hash = createHash("sha256").update(body).digest("hex").slice(0, 16);
		seen.add(filename);
		written[filename] = hash;

		const target = join(MOMENTS_DIR, filename);
		const previous = manifest.files?.[filename];
		const exists = existsSync(target);
		if (exists && previous === hash) {
			log(`= ${filename}（未变化）`);
			continue;
		}
		if (DRY_RUN) {
			log(`~ ${filename}（dry-run，将写入）`);
			continue;
		}
		writeFileSync(target, body, "utf8");
		log(`${previous ? "~" : "+"} ${filename}${memo.pinned ? " [置顶]" : ""} 图 ${images.length}`);
	}

	// 下载本地图片（imagePolicy: "local"）
	if (!DRY_RUN && downloaded.length > 0) {
		let ok = 0;
		for (const item of downloaded) {
			const target = join(LOCAL_IMAGE_DIR, item.relative.replace(/^moments\//, ""));
			if (existsSync(target)) {
				ok++;
				continue;
			}
			try {
				await downloadImage(item.attachment, target, options.apiUrl);
				ok++;
			} catch (error) {
				warn(`图片下载失败 ${item.publicPath}：${error.message}`);
			}
		}
		log(`本地图片 ${ok}/${downloaded.length}`);
	}

	// 清理：只删除清单中记录、且本次远端已不存在的文件。
	if (!DRY_RUN && options.pruneRemoved && !NO_PRUNE) {
		for (const filename of Object.keys(manifest.files ?? {})) {
			if (seen.has(filename)) continue;
			const target = join(MOMENTS_DIR, filename);
			if (existsSync(target)) {
				rmSync(target);
				log(`- ${filename}（远端已删除）`);
			}
		}
	}

	if (!DRY_RUN) {
		writeFileSync(
			manifestPath,
			`${JSON.stringify({ version: 1, syncedAt: new Date().toISOString(), files: written }, null, "\t")}\n`,
			"utf8",
		);
	}
	log(`完成：${seen.size} 条动态`);
}

await main();
