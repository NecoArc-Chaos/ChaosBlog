import { expect, test } from "@playwright/test";
import { aboutConfig } from "../../src/config/aboutConfig";
import { albumsConfig } from "../../src/config/albumsConfig";
import { animeConfig } from "../../src/config/animeConfig";
import { compassConfig } from "../../src/config/compassConfig";
import { devicesConfig } from "../../src/config/devicesConfig";
import { friendsConfig } from "../../src/config/friendsConfig";
import { momentsConfig } from "../../src/config/momentsConfig";
import { projectsConfig } from "../../src/config/projectsConfig";
import { skillsConfig } from "../../src/config/skillsConfig";
import { timelineConfig } from "../../src/config/timelineConfig";

/**
 * 功能开关 → 对应导航路由（与 `src/config/navBarConfig.ts` 的裁剪表同源）。
 * 关闭的功能页面会重定向 `/404/`，导航入口必须一并消失，因此这里按开关断言。
 */
const featureRoutes: Array<[string, boolean, string]> = [
	["friends", friendsConfig.enable, "/friends/"],
	["moments", momentsConfig.enable, "/moments/"],
	["anime", animeConfig.enable, "/anime/"],
	["compass", compassConfig.enable, "/compass/"],
	["albums", albumsConfig.enable, "/albums/"],
	["timeline", timelineConfig.enable, "/timeline/"],
	["projects", projectsConfig.enable, "/projects/"],
	["devices", devicesConfig.enable, "/devices/"],
	["skills", skillsConfig.enable, "/skills/"],
	["about", aboutConfig.enable, "/about/"],
];

test.describe("top app bar content alignment", () => {
	test("centers navigation while keeping the blog title on the left", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });

		const content = page.locator("#navbar > div").first();
		const title = content.locator(":scope > a");
		const nav = content.locator(":scope > nav");

		await expect(title).toHaveText("Shirone");
		await expect(title).not.toHaveClass(/lg:absolute/);
		await expect(nav).toBeVisible();
		await expect(nav).toHaveClass(/lg:absolute/);

		const geometry = await Promise.all([
			content.boundingBox(),
			nav.boundingBox(),
		]);
		expect(geometry[0]).not.toBeNull();
		expect(geometry[1]).not.toBeNull();
		expect(geometry[1]!.x + geometry[1]!.width / 2).toBeCloseTo(
			geometry[0]!.x + geometry[0]!.width / 2,
			0,
		);
	});
});

test.describe("navigation feature gating", () => {
	test("lists exactly the enabled feature pages in the top bar", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });

		for (const [feature, enabled, href] of featureRoutes) {
			await expect(
				page.locator(`#navbar nav a[href="${href}"]`),
				`top bar entry for ${feature}`,
			).toHaveCount(enabled ? 1 : 0);
		}
	});

	test("keeps the mobile navigation rail free of dead feature links", async ({
		page,
	}) => {
		// 移动端（<640px）点击顶栏菜单按钮，在原地长出悬浮可展开导航导轨。
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.locator("#nav-drawer-switch").click();

		const groupHeads = page.locator('#site-nav-rail button[aria-expanded="false"]');
		for (let index = 0; index < (await groupHeads.count()); index += 1) {
			await groupHeads.nth(index).click();
		}

		for (const [feature, enabled, name] of [
			["friends", friendsConfig.enable, "Friends"],
			["moments", momentsConfig.enable, "Moments"],
			["anime", animeConfig.enable, "Anime"],
			["compass", compassConfig.enable, "Compass"],
			["albums", albumsConfig.enable, "Albums"],
			["timeline", timelineConfig.enable, "Timeline"],
			["projects", projectsConfig.enable, "Projects"],
			["devices", devicesConfig.enable, "Devices"],
			["skills", skillsConfig.enable, "Skills"],
			["about", aboutConfig.enable, "About"],
		] as Array<[string, boolean, string]>) {
			await expect(
				page.locator(`#site-nav-rail button[aria-label="${name}"]`),
				`rail entry for ${feature}`,
			).toHaveCount(enabled ? 1 : 0);
		}
	});
});
