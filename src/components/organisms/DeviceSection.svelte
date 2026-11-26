<script lang="ts">
/**
 * 设备展示主体（有机体）：实时搜索 + 场景分类筛选
 * （带 LoadingIndicator 过渡）+ 瀑布流柔性网格。
 * - 筛选状态与搜索词同步 URL（?category= / ?q=），刷新/分享/回退保留；
 * - 瀑布流复用文章列表的最短列打包（utils/masonry.ts），ResizeObserver 处理换列。
 */
import Chips from "@components/atoms/action/Chips.svelte";
import Card from "@components/atoms/display/Card.svelte";
import CollectionSearchField from "@components/molecules/CollectionSearchField.svelte";
import DeviceCard from "@components/molecules/DeviceCard.svelte";
import PageHeader from "@components/molecules/PageHeader.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { packMasonry, setupMasonry } from "@utils/masonry";
import { onMount } from "svelte";
import type { DeviceCategory, DeviceItem } from "@/types/devicesConfig";

let {
	categories = [] as DeviceCategory[],
	items = [] as DeviceItem[],
	title = i18n(I18nKey.devices),
	subtitle = i18n(I18nKey.devicesBanner),
}: {
	categories?: DeviceCategory[];
	items?: DeviceItem[];
	title?: string;
	subtitle?: string;
} = $props();

let query = $state("");
let selectedCategory = $state("");
let initialized = false;
let gridEl: HTMLElement | undefined = $state();

const enabledItems = $derived(items.filter((item) => item.enable !== false));
const activeCategories = $derived(
	categories.filter((category) =>
		enabledItems.some((item) => item.category === category.key),
	),
);

/** 场景分类筛选：仅展示存在设备的分类（无“全部”按钮，空选=全部） */
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
			item.brand,
			item.specs,
			item.description,
			item.year ?? "",
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

	if (!gridEl) return;
	const grid = gridEl;
	setupMasonry(grid);
	document.fonts?.ready.then(() => packMasonry(grid)).catch(() => {});
});

$effect(() => {
	filteredItems;
	if (gridEl) {
		const grid = gridEl;
		requestAnimationFrame(() => packMasonry(grid));
	}
});
</script>

<Card color="var(--card-bg)" radius="l" class="devices-section px-8 py-6">
	<PageHeader
		icon="material-symbols:devices-rounded"
		{title}
		{subtitle}
	/>

	{#if enabledItems.length > 0}
		<div class="devices-section__tools">
			<div class="devices-section__search-row">
				<div class="devices-section__search">
					<CollectionSearchField
						bind:value={query}
						placeholder={i18n(I18nKey.devicesSearchPlaceholder)}
						label={i18n(I18nKey.search)}
					/>
				</div>
			</div>

			<div class="devices-section__filter-row">
				<div class="devices-section__chips" aria-label={i18n(I18nKey.devicesCategoryLabel)}>
					<Chips
						items={categoryChipItems}
						variant="filter"
						bind:value={selectedCategory}
					/>
				</div>
				{#if filteredItems.length > 0}
					<p class="devices-section__count" aria-live="polite">
						{filteredItems.length} {i18n(I18nKey.devicesCounts)}
					</p>
				{/if}
			</div>
		</div>
	{/if}

	{#if filteredItems.length > 0}
		{#key `${selectedCategory}|${query}`}
			<div
				class="devices-section__grid"
				aria-live="polite"
				bind:this={gridEl}
			>
				{#each filteredItems as device, index (device.id)}
					<DeviceCard {device} delay={Math.min(index, 7) * 45} />
				{/each}
			</div>
		{/key}
	{:else}
		<div class="devices-section__empty">
			<Icon icon="material-symbols:devices-off-outline-rounded" aria-hidden="true" />
			<span>{i18n(I18nKey.devicesNoResults)}</span>
		</div>
	{/if}
</Card>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.devices-section
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

	&__grid
		display: grid
		grid-template-columns: minmax(0, 1fr)
		gap: 0.75rem
		margin-top: 1.5rem

		@media (min-width: bp-md)
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr))
			align-items: start
			grid-auto-rows: 8px
			row-gap: 0
			column-gap: var(--m3e-space-4)
</style>
