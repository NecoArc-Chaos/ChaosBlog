<script lang="ts">
/**
 * 中等屏幕（640px–1023px，Medium Window Size Class）左侧导航导轨。
 * 复用 atoms/navigation/NavigationRail 原子；点击内部路由触发 Swup 导航，
 * 点击带子菜单的「更多」分组时派发 site-drawer:toggle 唤出全站抽屉。
 */
import NavigationRail from "@components/atoms/navigation/NavigationRail.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { resolveNavBarLinks, resolvePageKey } from "@utils/nav-utils";
import { url } from "@utils/url-utils";
import { onMount } from "svelte";
import { navBarConfig } from "@/config/navBarConfig";

const links = resolveNavBarLinks(navBarConfig.links);

const railEntries = links.map((link) => {
	const value = link.name.toLowerCase();
	return {
		value,
		label: link.name,
		icon: link.icon,
		href: link.url ? (link.external ? link.url : url(link.url)) : undefined,
		external: Boolean(link.external),
		pageKey: link.pageKey ?? "",
		hasChildren: Boolean(link.children?.length),
		childKeys: link.children?.map((c) => c.pageKey ?? "") ?? [],
	};
});

const railItems = railEntries.map(({ value, label, icon }) => ({
	value,
	label,
	icon,
}));

let activeValue = $state("");

function syncFromRoute() {
	const pageKey = resolvePageKey(new URL(window.location.href));
	const matched = railEntries.find(
		(entry) =>
			(entry.pageKey && entry.pageKey === pageKey) ||
			entry.childKeys.includes(pageKey),
	);
	activeValue = matched ? matched.value : "";
}

function handleValueChange(nextValue: string) {
	const target = railEntries.find((entry) => entry.value === nextValue);
	if (!target) return;

	if (target.hasChildren || !target.href) {
		document.dispatchEvent(new CustomEvent("site-drawer:toggle"));
		// 保持高亮与当前路由同步，不被分组触发按钮覆盖
		requestAnimationFrame(syncFromRoute);
		return;
	}

	if (target.external) {
		window.open(target.href, "_blank", "noopener,noreferrer");
		requestAnimationFrame(syncFromRoute);
		return;
	}

	if (window.swup?.navigate) {
		window.swup.navigate(target.href);
	} else {
		window.location.href = target.href;
	}
}

onMount(() => {
	syncFromRoute();
	document.addEventListener("swup:content:replace", syncFromRoute);
	window.addEventListener("popstate", syncFromRoute);
	return () => {
		document.removeEventListener("swup:content:replace", syncFromRoute);
		window.removeEventListener("popstate", syncFromRoute);
	};
});
</script>

<aside class="site-nav-rail" aria-label={i18n(I18nKey.mainNavigation)}>
	<NavigationRail
		items={railItems}
		bind:value={() => activeValue, handleValueChange}
		label={i18n(I18nKey.navigationDrawer)}
		alwaysShowLabel={false}
	/>
</aside>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.site-nav-rail
	display: none
	position: fixed
	top: 4rem
	bottom: 0
	left: 0
	z-index: 40
	overflow-y: auto
	scrollbar-width: none
	background: var(--surface)
	box-shadow: var(--m3e-elevation-1)
	&::-webkit-scrollbar
		display: none

	@media (min-width: bp-sm) and (max-width: bp-lg - 1px)
		display: flex
</style>
