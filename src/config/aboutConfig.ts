import type { AboutConfig } from "../types/aboutConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const aboutConfig: AboutConfig = withUserConfig("about", {
	enable: true,
	title: "$t:about",
	description: "调制饮料，改变人生 —— 关于我与这个小站的一切。",
});
