<script lang="ts">
import Icon from "@iconify/svelte";
import TextField from "@components/atoms/input/TextField.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

let {
	value = $bindable(""),
	placeholder = i18n(I18nKey.search),
	label = i18n(I18nKey.search),
	onclear,
	class: className = "",
}: {
	value?: string;
	placeholder?: string;
	label?: string;
	onclear?: () => void;
	class?: string;
} = $props();

function handleClear() {
	if (onclear) {
		onclear();
	} else {
		value = "";
	}
}
</script>

<TextField
	type="search"
	bind:value
	{placeholder}
	{label}
	hideLabel
	variant="outlined"
	class="m3-collection-search {className}"
>
	<Icon slot="leading" icon="material-symbols:search-rounded" aria-hidden="true" />
	<svelte:fragment slot="trailing">{#if value}<button
			type="button"
			class="m3-collection-search__clear m3-state-layer"
			aria-label={i18n(I18nKey.clear)}
			onclick={handleClear}
		>
			<Icon icon="material-symbols:close-rounded" aria-hidden="true" />
		</button>{/if}</svelte:fragment>
</TextField>

<style lang="stylus">
.m3-collection-search__clear
	position: relative
	display: inline-flex
	align-items: center
	justify-content: center
	width: 1.75rem
	height: 1.75rem
	padding: 0
	border: none
	border-radius: var(--shape-corner-full)
	background: transparent
	color: var(--on-surface-variant)
	cursor: pointer
	--m3e-state-color: var(--on-surface-variant)
	> :global(svg)
		width: 1.125rem
		height: 1.125rem

	@media (pointer: coarse)
		&::after
			content: ""
			position: absolute
			inset: -0.5rem
</style>
