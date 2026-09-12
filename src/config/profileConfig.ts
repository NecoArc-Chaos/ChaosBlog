import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/chaos-avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "NecoArc-Chaos",
	bio: "Ecc3:7",
	links: [
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/1823717804",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/NecoArc-Chaos",
		},
	],
});
