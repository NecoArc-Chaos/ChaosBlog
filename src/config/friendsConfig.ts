import type { FriendsConfig } from "../types/friendsConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const friendsConfig: FriendsConfig = withUserConfig("friends", {
	enable: true,
	title: "$t:friends",
	description: "海内存知己，天涯若比邻。申请交换友链见下方卡片。",
	/** 页面每页条数（正整数），默认 12；省略或无效值回退 12。 */
	pageSize: 12,
});
