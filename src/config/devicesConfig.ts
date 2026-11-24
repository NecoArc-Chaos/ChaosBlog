import type { DevicesConfig } from "@/types/devicesConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 设备展示页行为与展示配置。
 *
 * 遵循「配置管行为，数据管内容」原则：
 * - enable：页面总开关；false 时导航入口同步隐藏，访问 /devices/ 跳转 404；
 * - categories：场景分类清单（数组顺序即页面顶部 Chips 顺序）；
 * - disabledIds：可选被禁用的设备 ID 列表；
 *
 * 注：设备的具体清单数据（设备名、品牌、规格、感受说明、图片等）请在 `src/data/devices.ts` 中维护。
 */
export const devicesConfig: DevicesConfig = withUserConfig("devices", {
	enable: true,
	title: "$t:devices",
	description: "$t:devicesBanner",
	categories: [
		{
			key: "mobile",
			label: "随身设备",
			icon: "material-symbols:phone-iphone",
			description: "日常主力手机、备用机与智能穿戴",
		},
		{
			key: "camera",
			label: "摄影影像",
			icon: "material-symbols:photo-camera-outline-rounded",
			description: "便携运动相机与随手记录装备",
		},
		{
			key: "desk",
			label: "桌面工作台",
			icon: "material-symbols:desktop-windows-outline-rounded",
			description: "主力电脑、显示器与桌面核心设备",
		},
		{
			key: "audio",
			label: "影音装备",
			icon: "material-symbols:headphones-rounded",
			description: "耳机、音响与监听设备",
		},
		{
			key: "peripheral",
			label: "外设配件",
			icon: "material-symbols:keyboard-outline-rounded",
			description: "键盘、鼠标与桌面周边配件",
		},
	],
	// disabledIds: [],
});
