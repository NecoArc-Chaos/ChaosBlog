export type AIToolCategory =
	| "chat"
	| "coding"
	| "image"
	| "audio"
	| "video"
	| "writing"
	| "search"
	| "other";

export type AIToolFrequency =
	| "daily"
	| "weekly"
	| "occasional"
	| "experimental";

export type LocaleString = Partial<
	Record<"en" | "zh_CN" | "zh_TW" | "ja", string>
>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string;
	description: LocaleString;
	icon: string;
	category: AIToolCategory;
	frequency: AIToolFrequency;
	url?: string;
	usage?: LocaleString;
	tags?: string[];
	color?: string;
}

// Replace the examples below with your own AI tools
export const aiToolsData: AITool[] = [
	{
		id: "gemini-flash",
		name: "Gemini 3.6 Flash",
		description: {
			en: "Google's fast and efficient conversational AI for chat and reasoning.",
			zh_CN: "Google 的高效对话式 AI，适合快速聊天和逻辑推理。",
		},
		icon: "material-symbols:smart-toy",
		category: "chat",
		frequency: "daily",
		url: "https://gemini.google.com",
		usage: {
			en: "Daily: conversation, Q&A, brainstorming",
			zh_CN: "每天：聊天、问答、思路梳理",
		},
		tags: ["Chat", "Gemini"],
		color: "#4285F4",
	},
	{
		id: "deepseek-v4p",
		name: "DeepSeek V4 Pro",
		description: {
			en: "Advanced coding AI for code completion, debugging, and refactoring.",
			zh_CN: "专业的编程 AI，擅长代码补全、调试和重构。",
		},
		icon: "material-symbols:code",
		category: "coding",
		frequency: "daily",
		url: "https://deepseek.com",
		usage: {
			en: "Daily: coding, code review, debugging",
			zh_CN: "每天：编程、代码 review、调试",
		},
		tags: ["Coding", "DeepSeek"],
		color: "#10A37F",
	},
	{
		id: "gemini-banana-pro",
		name: "Gemini Banana Pro",
		description: {
			en: "Google's advanced image generation AI for creating illustrations and artwork.",
			zh_CN: "Google 的高级图像生成 AI，擅长创作插图和艺术作品。",
		},
		icon: "material-symbols:image",
		category: "image",
		frequency: "weekly",
		url: "https://gemini.google.com",
		usage: {
			en: "Weekly: image generation, illustration",
			zh_CN: "每周：图像生成、插图创作",
		},
		tags: ["Image", "Gemini"],
		color: "#1A73E8",
	},
];
