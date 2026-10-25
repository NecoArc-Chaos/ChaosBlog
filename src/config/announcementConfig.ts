import type { AnnouncementConfig } from "@/types/announcementConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 公告栏配置
 * 组件显示由 sidebarConfig 统一控制
 */
export const announcementConfig: AnnouncementConfig = withUserConfig(
	"announcement",
	{
		title: "Coming Posts & Note", // 公告标题，填空使用 i18n 字符串 Key.announcement
		content: "", // 公告内容，为空不渲染
		closable: false, // 允许用户关闭公告
		link: {
			enable: false, // 启用链接
			text: "Learn More", // 链接文本
			url: "/about/", // 链接 URL
			external: false, // 外部链接
		},
	},
);
