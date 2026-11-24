/**
 * 设备展示页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/devicesConfig.ts 控制。
 */
import type { DeviceItem } from "@/types/devicesConfig";

export const devicesData: DeviceItem[] = [
	{
		id: "realme-gt6",
		name: "realme GT6",
		brand: "realme",
		category: "mobile",
		status: "active",
		specs: "骁龙 8 Gen 3 / 16GB + 512GB",
		description: "5800mAh 大电池搭配 120W 闪充，日常主力使用性能与续航都很稳。",
		image: "/images/device/realmegt6.webp",
		featured: true,
		link: "https://www.realme.com/cn/realme-gt-6",
	},
	{
		id: "pixel-watch-3",
		name: "Pixel Watch 3",
		brand: "Google",
		category: "mobile",
		status: "active",
		specs: "Wi-Fi 版 / 45mm / 美版",
		description:
			"45mm 大表径搭配更窄的黑边，日常查看心率记录、睡眠分析与消息通知一目了然。",
		image: "/images/device/pixelwatch3.webp",
		featured: true,
		link: "https://store.google.com/product/pixel_watch_3",
	},
	{
		id: "pixel-3",
		name: "Pixel 3",
		brand: "Google",
		category: "mobile",
		status: "backup",
		specs: "骁龙 845 / 4GB + 64GB / OLED / 线性马达",
		description:
			"闲鱼花 220 元淘来的情怀小屏备用机，刷入 PixelOS 后手感与流畅度依旧在线。",
		image: "/images/device/pixel3.webp",
		link: "https://zh.wikipedia.org/wiki/Pixel_3",
	},
	{
		id: "insta360-go-3s",
		name: "insta360 GO 3S",
		brand: "Insta360",
		category: "camera",
		status: "active",
		specs: "4K / 128GB / 39g（本体）",
		description: "轻巧的拇指运动相机，要便携有便携，要续航也很便携。",
		image: "/images/device/insta360go3s.webp",
		link: "https://www.insta360.com/product/insta360-go3s",
	},
];
