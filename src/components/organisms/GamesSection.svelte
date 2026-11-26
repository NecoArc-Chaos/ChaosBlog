<script lang="ts">
/**
 * 游戏展示主体（有机体）：实时搜索 + 分类筛选（带 LoadingIndicator 过渡）
 * + 横屏卡片网格。
 * - 筛选状态与搜索词同步 URL（?category= / ?q=），刷新/分享/回退保留；
 * - 网格采用拉伸对齐（landscape 卡片同高等宽成行，页脚按钮对齐），
 *   与设备页的瀑布流打包刻意区分；
 * - 卡片为横屏封面主视觉的 GameCard。
 */
import Chips from "@components/atoms/action/Chips.svelte";
import Card from "@components/atoms/display/Card.svelte";
import CollectionSearchField from "@components/molecules/CollectionSearchField.svelte";
import GameCard from "@components/molecules/GameCard.svelte";
import PageHeader from "@components/molecules/PageHeader.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { GameCategory, GameItem } from "@/types/gamesConfig";

let {
	categories = [] as GameCategory[],
	items = [] as GameItem[],
	title = i18n(I18nKey.games),
	subtitle = i18n(I18nKey.gamesBanner),
}: {
	categories?: GameCategory[];
	items?: GameItem[];
	title?: string;
	subtitle?: string;
} = $props();

let query = $state("");
let selectedCategory = $state("");
let initialized = false;

const enabledItems = $derived(items.filter((item) => item.enable !== false));
const activeCategories = $derived(
	categories.filter((category) =>
		enabledItems.some((item) => item.category === category.key),
	),
);

const categoryChipItems = $derived(
	activeCategories.map((category) => ({
		value: category.key,
		label: category.label,
		leadingIcon: category.icon ?? "",
	})),
);

const filteredItems = $derived.by(() => {
	const normalized = query.trim().toLowerCase();
	return enabledItems.filter((item) => {
		if (selectedCategory && item.category !== selectedCategory) return false;
		if (!normalized) return true;
		return [
			item.name,
			item.developer,
			item.platform ?? "",
			item.year ?? "",
			item.description,
			...(item.tags ?? []),
		].some((val) => val.toLowerCase().includes(normalized));
	});
});

// URL 参数同步（?category= / ?q=）
$effect(() => {
	const c = selectedCategory;
	const q = query;
	if (!initialized) return;
	const params = new URLSearchParams(window.location.search);
	params.delete("category");
	params.delete("q");
	if (c) params.set("category", c);
	if (q.trim()) params.set("q", q.trim());
	const qs = params.toString();
	history.replaceState(
		history.state,
		"",
		qs ? `?${qs}` : window.location.pathname,
	);
});

onMount(() => {
	const params = new URLSearchParams(window.location.search);
	selectedCategory = params.get("category") || "";
	query = params.get("q") || "";
	initialized = true;
});
</script>

<Card color="var(--card-bg)" radius="l" class="games-section px-8 py-6">
	<PageHeader
		icon="material-symbols:sports-esports-outline-rounded"
		{title}
		{subtitle}
	/>

	{#if enabledItems.length > 0}
		<div class="games-section__tools">
			<div class="games-section__search-row">
				<div class="games-section__search">
					<CollectionSearchField
						bind:value={query}
						placeholder={i18n(I18nKey.gamesSearchPlaceholder)}
						label={i18n(I18nKey.search)}
					/>
				</div>
			</div>

			<div class="games-section__filter-row">
				<div class="games-section__chips" aria-label={i18n(I18nKey.gamesCategoryLabel)}>
					<Chips
						items={categoryChipItems}
						variant="filter"
						bind:value={selectedCategory}
					/>
				</div>
				{#if filteredItems.length > 0}
					<p class="games-section__count" aria-live="polite">
						{filteredItems.length} {i18n(I18nKey.gamesCounts)}
					</p>
				{/if}
			</div>
		</div>
	{/if}

	{#if filteredItems.length > 0}
		{#key `${selectedCategory}|${query}`}
			<div class="games-section__grid" aria-live="polite">
				{#each filteredItems as game, index (game.id)}
					<GameCard {game} delay={Math.min(index, 7) * 45} />
				{/each}
			</div>
		{/key}
	{:else}
		<div class="games-section__empty">
			<Icon icon="material-symbols:sports-esports-outline-rounded" aria-hidden="true" />
			<span>{i18n(I18nKey.gamesNoResults)}</span>
		</div>
	{/if}
</Card>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.games-section
	display: block

	@media (max-width: bp-sm - 1px)
		padding: 1rem 0.75rem

	&__tools
		display: flex
		flex-direction: column
		gap: 0.875rem
		padding-bottom: 1.5rem
		border-bottom: 1px solid var(--outline-variant)

	&__search-row
		display: flex
		align-items: center
		width: 100%

	&__search
		width: 100%
		max-width: 32rem

		:global(.m3-text-field)
			width: 100%

	&__filter-row
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: 0.75rem
		width: 100%

	&__chips
		flex: 1
		min-width: 0
		max-width: 100%
		overflow-x: auto
		scrollbar-width: none
		&::-webkit-scrollbar
			display: none

	&__count
		margin: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)
		white-space: nowrap

	&__empty
		display: flex
		flex-direction: column
		align-items: center
		justify-content: center
		gap: 0.875rem
		min-height: 12rem
		padding-top: 1.5rem
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-large)

		> :global(svg)
			width: 2.75rem
			height: 2.75rem
			color: var(--outline)

	/* 横屏卡片网格：单列移动端起步，≥md 两列以上等高成行 */
	&__grid
		display: grid
		grid-template-columns: minmax(0, 1fr)
		gap: var(--m3e-space-4)
		margin-top: 1.5rem
		align-items: stretch

		@media (min-width: bp-md)
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr))
</style>
