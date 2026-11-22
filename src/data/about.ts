import { profileConfig } from "@/config/profileConfig";

export interface AboutFact {
	icon: string;
	label: string;
	value: string;
}

export interface AboutIntroData {
	name: string;
	tagline: string;
	facts: AboutFact[];
}

export interface AboutLanguage {
	name: string;
	level: string;
	code: string;
	note?: string;
}

export interface AboutLanguagesData {
	title: string;
	subtitle: string;
	icon: string;
	items: AboutLanguage[];
}

export const aboutIntroData: AboutIntroData = {
	name: profileConfig.name,
	tagline: "调制饮料，改变人生。正在尝试写点有用的",
	facts: [
		{
			icon: "material-symbols:school-outline-rounded",
			label: "职业",
			value: "学生",
		},
		{
			icon: "material-symbols:cake-outline-rounded",
			label: "生日",
			value: "2009年1月23日",
		},
		{
			icon: "material-symbols:location-on-outline-rounded",
			label: "现居",
			value: "中国山东青岛",
		},
		{
			icon: "material-symbols:psychology-outline-rounded",
			label: "MBTI",
			value: "INFP / ENFP / ENFJ",
		},
	],
};

export const aboutLanguagesData: AboutLanguagesData = {
	title: "语言",
	subtitle: "我所掌握和正在学习的语言",
	icon: "material-symbols:translate-rounded",
	items: [
		{
			name: "中文",
			level: "母语",
			code: "zh-CN",
		},
		{
			name: "English",
			level: "日常交流",
			code: "en-US",
		},
		{
			name: "青岛话",
			level: "不算特别地道",
			code: "zh-cmn-pingdu",
			note: "其实是平度",
		},
	],
};
