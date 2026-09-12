import type { TrackDescriptor } from "@/types/musicConfig";

/**
 * 侧栏音乐本地曲目数据源。
 * 遵循「零额外负担」原则：配置与数据解耦，此处专用于管理本地曲目列表。
 *
 * 添加曲目：在 musicTracks 中追加一项即可：
 * - id: 唯一标识
 * - title: 曲目标题
 * - artist: 艺术家（可选）
 * - cover: 封面图地址（可选；推荐相对 /src，亦支持 /public 或绝对 URL）
 * - source: 音频文件地址（相对 /public 或绝对 URL）
 * - duration: 曲目时长（秒，可选）
 */
export const musicTracks: readonly TrackDescriptor[] = [
	{
		id: "safe-haven",
		title: "Safe Haven",
		artist: "Garoad",
		cover: "/assets/music/cover/Safe Haven.jpg",
		source: "/assets/music/url/Safe Haven.mp3",
		duration: 159,
	},
	{
		id: "welcome-to-valhalla",
		title: "welcome to valhalla",
		artist: "Garoad",
		cover: "/assets/music/cover/welcome to valhalla.jpg",
		source: "/assets/music/url/welcome to valhalla.mp3",
		duration: 188,
	},
	{
		id: "every-day-is-night",
		title: "Every Day Is Night",
		artist: "Garoad",
		cover: "/assets/music/cover/Every Day Is Night.jpg",
		source: "/assets/music/url/Every Day Is Night.mp3",
		duration: 220,
	},
	{
		id: "your-love-is-a-drug",
		title: "Your Love Is a Drug",
		artist: "Garoad",
		cover: "/assets/music/cover/your love is a drug.jpg",
		source: "/assets/music/url/your love is a drug.mp3",
		duration: 180,
	},
];
