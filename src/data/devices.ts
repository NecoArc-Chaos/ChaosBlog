/**
 * 设备展示页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/devicesConfig.ts 控制。
 * 从 Mizuki 迁移：realme GT6 / Pixel 3 / Pixel Watch 3 / insta360 GO 3S
 */
import type { DeviceItem } from "@/types/devicesConfig";

export const devicesData: DeviceItem[] = [
	{
		id: "realme-gt6",
		name: "realme GT6",
		brand: "realme",
		category: "mobile",
		status: "active",
		specs: "骁龙8gen3 / 16G + 512GB",
		description: "5800mhA Battery, 120W SuperVOOC.",
		image: "/images/device/realmegt6.png",
		featured: true,
		link: "https://www.realme.com/cn/realme-gt-6",
	},
	{
		id: "pixel-3",
		name: "Pixel 3",
		brand: "Google",
		category: "mobile",
		status: "backup",
		specs: "骁龙845 / 4+64 / oled屏幕 / 线性马达",
		description: "闲鱼花220淘的，pixelos牛福",
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbOj33XAZiQn1DtNLdEcfEgYmaUPU3b_x3oz2v4t8Thw&s=10",
		link: "https://zh.wikipedia.org/wiki/Pixel_3",
	},
	{
		id: "pixel-watch-3",
		name: "Pixel Watch 3",
		brand: "Google",
		category: "mobile",
		status: "active",
		specs: "Wifi / 45mm / 美版",
		description:
			"Pixel Watch 3 的錶徑有45 公釐，螢幕較前一代大40% 以上，無論是運動、使用地圖或處理其他事務，一眼就能掌握更豐富的資訊.",
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKjYPaNFIYJEXKN7-tYU9u5PQ5slBMfl8RaV1LbjSifg&s=10",
		featured: true,
		link: "https://www.google-mobile.cn/?product=pixel-watch-3",
	},
	{
		id: "insta360-go-3s",
		name: "insta360 GO 3S",
		brand: "Insta360",
		category: "audio",
		status: "active",
		specs: "4K,128G,39g(本体)",
		description: "拇指相机，要便携有便携，要续航有便携",
		image: "/images/device/insta360go3s.png",
		link: "https://www.insta360.com/product/insta360-go3s",
	},
];
