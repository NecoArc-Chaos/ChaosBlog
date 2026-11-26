<script lang="ts">
import Chips from "@components/atoms/action/Chips.svelte";
import Card from "@components/atoms/display/Card.svelte";
import AlbumCard from "@components/molecules/AlbumCard.svelte";
import CollectionSearchField from "@components/molecules/CollectionSearchField.svelte";
import PageHeader from "@components/molecules/PageHeader.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { reveal } from "@utils/motion";
import { onMount } from "svelte";
import type { AlbumIndexItem } from "@/types/album";

let {
	albums = [] as AlbumIndexItem[],
	title = i18n(I18nKey.albums),
	subtitle = i18n(I18nKey.albumsBanner),
}: {
	albums?: AlbumIndexItem[];
	title?: string;
	subtitle?: string;
} = $props();
let query = $state("");
let selectedTag = $state("");
let initialized = false;

const tagItems = $derived(
	Array.from(new Set(albums.flatMap((album) => album.tags)))
		.sort((a, b) => a.localeCompare(b))
		.map((tag) => ({ value: tag, label: tag })),
);

const filtered = $derived.by(() => {
	const normalized = query.trim().toLowerCase();
	return albums.filter((album) => {
		if (selectedTag && !album.tags.includes(selectedTag)) return false;
		if (!normalized) return true;
		return [album.title, album.description, album.location, ...album.tags]
			.join(" ")
			.toLowerCase()
			.includes(normalized);
	});
});

$effect(() => {
	if (!initialized) return;
	const params = new URLSearchParams(window.location.search);
	params.delete("q");
	params.delete("albumTag");
	if (query.trim()) params.set("q", query.trim());
	if (selectedTag) params.set("albumTag", selectedTag);
	const search = params.toString();
	history.replaceState(
		history.state,
		"",
		search ? `?${search}` : window.location.pathname,
	);
});

onMount(() => {
	const params = new URLSearchParams(window.location.search);
	query = params.get("q") || "";
	selectedTag = params.get("albumTag") || "";
	initialized = true;
});
</script>

<Card color="var(--card-bg)" radius="l" class="album-section px-8 py-6">
	<PageHeader
		icon="material-symbols:photo-library-outline-rounded"
		{title}
		{subtitle}
	/>

	{#if albums.length > 0}
		<div class="album-section__tools">
			<div class="album-section__search">
				<CollectionSearchField
					bind:value={query}
					placeholder={i18n(I18nKey.search)}
					label={i18n(I18nKey.search)}
				/>
			</div>
			{#if tagItems.length > 0}
				<Chips items={tagItems} variant="filter" bind:value={selectedTag} />
			{/if}
			<p class="album-section__count" aria-live="polite">
				{filtered.length} {i18n(I18nKey.albumsCounts)}
			</p>
		</div>
	{/if}

	{#if filtered.length > 0}
		{#key `${query}|${selectedTag}`}
			<div class="album-section__grid">
				{#each filtered as album, index (album.id)}
					<div class="album-section__item" use:reveal={{ delay: Math.min(index, 7) * 45 }}>
						<AlbumCard {album} />
					</div>
				{/each}
			</div>
		{/key}
	{:else}
		<div class="album-section__empty">
			<Icon icon="material-symbols:search-off-rounded" aria-hidden="true" />
			<span>{i18n(I18nKey.albumsNoResults)}</span>
		</div>
	{/if}
</Card>

<style lang="stylus">
.album-section
	display: block
	&__tools
		display: grid
		gap: 0.875rem
		padding-bottom: 1.5rem
		border-bottom: 1px solid var(--outline-variant)
	&__search
		width: 100%
		max-width: 32rem
		:global(.m3-text-field)
			width: 100%
	&__count
		margin: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)
	&__grid
		display: grid
		grid-template-columns: repeat(1, minmax(0, 1fr))
		gap: 1rem
		padding-top: 1.5rem
		@media (min-width: 40rem)
			grid-template-columns: repeat(2, minmax(0, 1fr))
		@media (min-width: 75rem)
			grid-template-columns: repeat(3, minmax(0, 1fr))
	&__item
		min-width: 0
	&__empty
		display: grid
		place-items: center
		gap: 0.75rem
		min-height: 12rem
		padding-top: 1.5rem
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-medium)
		> :global(svg)
			width: 2rem
			height: 2rem
</style>
