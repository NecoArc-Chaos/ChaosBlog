import { expect, test } from "@playwright/test";
import { registerPersistentShellSync } from "./feature-page";

const GAME_COUNT = 13;

test.describe("游戏展示页", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/games/");
		await expect(page.locator(".game-card")).toHaveCount(GAME_COUNT);
	});

	test("渲染页面标题、游戏卡片与评分/时长/状态信息", async ({ page }) => {
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"games",
		);
		await expect(page.locator(".page-header__title")).toHaveText("游戏");
		await expect(page.locator(".games-section__count")).toHaveText("13 款游戏");

		const minecraft = page.locator('[data-game="minecraft"]');
		await expect(minecraft.locator("h2")).toHaveText("Minecraft");
		await expect(minecraft.locator(".game-card__developer")).toHaveText(
			"Mojang Studios",
		);
		await expect(minecraft.locator('[data-status="playing"]')).toContainText(
			"正在游玩",
		);
		await expect(minecraft.locator(".game-card__rating")).toContainText("5.0");
		await expect(minecraft.locator(".game-card__hours")).toContainText(
			"420 小时",
		);
		await expect(minecraft.locator(".game-card__platform")).toContainText("PC");
		await expect(minecraft.locator(".game-card__year")).toHaveText("2011");
		await expect(minecraft.locator(".game-card__tag").first()).toHaveText(
			"Sandbox",
		);
		await expect(minecraft).not.toHaveClass(/game-card--featured/);
		await expect(
			minecraft.getByRole("link", { name: "商店页面" }),
		).toHaveAttribute("href", "https://www.minecraft.net/");

		// 精选卡：徽标与横屏封面主视觉
		const hollowKnight = page.locator('[data-game="hollow-knight"]');
		await expect(hollowKnight).toHaveClass(/game-card--featured/);
		await expect(hollowKnight.locator(".game-card__featured")).toContainText(
			"特别推荐",
		);
		await expect(hollowKnight.locator(".game-card__cover")).toBeVisible();

		// 全部条目都带有官方横版封面，不再出现图标兜底横幅
		await expect(page.locator(".game-card__cover")).toHaveCount(GAME_COUNT);
		await expect(page.locator(".game-card__banner-icon")).toHaveCount(0);
	});

	test("直接加载时导航高亮与侧栏页面过滤正确", async ({ page }) => {
		await expect(
			page.locator('a[data-nav-key="games"]').first(),
		).toHaveAttribute("aria-current", "page");
		await expect(
			page.locator('widget-layout[data-id="categories"]'),
		).toBeVisible();
		await expect(page.locator('widget-layout[data-id="tags"]')).toBeVisible();
	});

	test("分类筛选同步剩余游戏与计数（含 LoadingIndicator 过渡）", async ({
		page,
	}) => {
		// 已移除的 open-world 分类不再渲染 chip
		await expect(
			page.getByRole("button", { name: "Open World", exact: true }),
		).toHaveCount(0);

		await page.getByRole("button", { name: "视觉小说", exact: true }).click();
		await expect(
			page.locator(".games-section__loading .m3-loading--contained"),
		).toBeVisible();
		await expect(page.locator(".game-card")).toHaveCount(2);
		await expect(page.locator(".games-section__count")).toHaveText("2 款游戏");
		await expect(page.locator('[data-game="va11-halla"]')).toBeVisible();
		await expect(page.locator('[data-game="aokana"]')).toBeVisible();
		await expect(page.locator('[data-game="minecraft"]')).toHaveCount(0);
		await expect(page.locator(".games-section__loading")).toHaveCount(0);

		// 再次点击已选分类取消筛选，恢复全部
		await page.getByRole("button", { name: "视觉小说", exact: true }).click();
		await expect(page.locator(".game-card")).toHaveCount(GAME_COUNT);
	});

	test("搜索无结果时展示空状态反馈", async ({ page }) => {
		const searchInput = page.locator(".games-section__search input");
		await searchInput.fill("Unknown9999");
		await expect(page.locator(".game-card")).toHaveCount(0);
		await expect(page.locator(".games-section__empty")).toContainText(
			"没有找到匹配的游戏",
		);
	});

	test("实时搜索过滤与清除（URL ?q= 同步）", async ({ page }) => {
		const searchInput = page.locator(".games-section__search input");
		await expect(searchInput).toBeVisible();
		await searchInput.fill("Minecraft");
		await expect(page.locator(".game-card")).toHaveCount(1);
		await expect(page.locator('[data-game="minecraft"]')).toBeVisible();
		await expect(page).toHaveURL(/[?&]q=Minecraft/);

		// 清除搜索恢复全部
		const clearBtn = page.locator(".games-section__search-clear");
		await clearBtn.click();
		await expect(page.locator(".game-card")).toHaveCount(GAME_COUNT);
		await expect(page).not.toHaveURL(/q=/);
	});

	test("URL 参数刷新后恢复筛选状态", async ({ page }) => {
		await page.getByRole("button", { name: "沙盒", exact: true }).click();
		await expect(page).toHaveURL(/[?&]category=sandbox/);
		await expect(page.locator(".game-card")).toHaveCount(1);
		await expect(page.locator('[data-game="minecraft"]')).toBeVisible();

		// 刷新后恢复同一次筛选
		await page.reload();
		await expect(page.locator(".game-card")).toHaveCount(1);
		await expect(page.locator('[data-game="minecraft"]')).toBeVisible();
		await expect(
			page.getByRole("button", { name: "沙盒", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
	});
});

test.describe("游戏展示页 Swup 导航", () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	registerPersistentShellSync("从持久顶栏进入后同步页面、导航与侧栏状态", {
		key: "games",
		fromPath: "/skills/",
		toPath: /\/games\/$/,
		cardSelector: "game-card",
		cardCount: GAME_COUNT,
	});
});
