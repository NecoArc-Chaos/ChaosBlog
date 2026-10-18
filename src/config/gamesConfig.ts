import type { GamesConfig } from "@/types/gamesConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 游戏展示页行为与展示配置。
 *
 * 遵循「配置管行为，数据管内容」原则：
 * - enable：页面总开关；false 时导航入口同步隐藏，访问 /games/ 跳转 404；
 * - categories：游戏分类清单（数组顺序即页面顶部 Chips 顺序；
 *   没有任何条目的分类会自动隐藏，因此可放心保留暂时用不到的分类）；
 * - disabledIds：可选被禁用的游戏 ID 列表；
 *
 * 注：游戏的具体清单数据（游戏名、开发商、封面、评分、时长、简评等）请在 `src/data/games.ts` 中维护。
 */
export const gamesConfig: GamesConfig = withUserConfig("games", {
	enable: true,
	title: "$t:games",
	description: "$t:gamesBanner",
	categories: [
		{
			key: "action",
			label: "动作",
			icon: "material-symbols:swords-outline-rounded",
			description: "动作、格斗与射击",
		},
		{
			key: "rpg",
			label: "RPG",
			icon: "material-symbols:shield-outline-rounded",
			description: "角色扮演与成长叙事",
		},
		{
			key: "strategy",
			label: "策略",
			icon: "material-symbols:strategy",
			description: "即时战略与塔防",
		},
		{
			key: "sandbox",
			label: "沙盒",
			icon: "material-symbols:widgets-rounded",
			description: "建造、制作与自由探索",
		},
		{
			key: "visual-novel",
			label: "视觉小说",
			icon: "material-symbols:menu-book-rounded",
			description: "以文字与演出驱动的叙事作品",
		},
		{
			key: "casual",
			label: "休闲",
			icon: "material-symbols:extension-outline-rounded",
			description: "轻松、派对与合家欢",
		},
	],
	// disabledIds: [],
});
