<script lang="ts">
/**
 * 中等屏幕（640px–1023px，Medium Window Size Class）左侧同体变形导航导轨。
 * 复用 atoms/navigation/NavigationRail 原子（expandable 模式）：
 *   - 平时为 28px 大圆角悬浮毛玻璃胶囊条，不再用生硬直角切割 Banner；
 *   - 点击顶部展开按钮或「更多」分组时，同一容器平滑扩张至 248px，
 *     图标原地延续、胶囊延展为整行 pill、二级菜单原地展开，不再另弹重复大抽屉。
 */
import NavigationRail, {
	type NavigationRailItem,
} from "@components/atoms/navigation/NavigationRail.svelte";
import Avatar from "@components/atoms/display/Avatar.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { resolveNavBarLinks, resolvePageKey } from "@utils/nav-utils";
import { url } from "@utils/url-utils";
import { onMount } from "svelte";
import { siteConfig } from "@/config";
import { navBarConfig } from "@/config/navBarConfig";

interface RailRouteTarget {
	value: string;
	href?: string;
	external: boolean;
	pageKey: string;
}

const links = resolveNavBarLinks(navBarConfig.links);
const routeMap = new Map<string, RailRouteTarget>();

const railItems: NavigationRailItem[] = links.map((link) => {
	const value = link.name.toLowerCase();
	if (!link.children?.length && link.url) {
		routeMap.set(value, {
			value,
			href: link.external ? link.url : url(link.url),
			external: Boolean(link.external),
			pageKey: link.pageKey ?? "",
		});
	}
	return {
		value,
		label: link.name,
		icon: link.icon,
		children: link.children?.map((child) => {
			const childValue = child.name.toLowerCase();
			if (child.url) {
				routeMap.set(childValue, {
					value: childValue,
					href: child.external ? child.url : url(child.url),
					external: Boolean(child.external),
					pageKey: child.pageKey ?? "",
				});
			}
			return {
				value: childValue,
				label: child.name,
				icon: child.icon,
			};
		}),
	};
});

let activeValue = $state("");
let expanded = $state(false);

function syncFromRoute() {
	const pageKey = resolvePageKey(new URL(window.location.href));
	if (!pageKey) {
		activeValue = "";
		return;
	}
	for (const target of routeMap.values()) {
		if (target.pageKey === pageKey) {
			activeValue = target.value;
			return;
		}
	}
	activeValue = "";
}

function handleSelect(itemValue: string, isGroup: boolean) {
	if (isGroup) return;
	const target = routeMap.get(itemValue);
	if (!target?.href) return;

	expanded = false;
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
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape" && expanded) {
			expanded = false;
		}
	};
	document.addEventListener("swup:content:replace", syncFromRoute);
	window.addEventListener("popstate", syncFromRoute);
	window.addEventListener("keydown", onKey);
	return () => {
		document.removeEventListener("swup:content:replace", syncFromRoute);
		window.removeEventListener("popstate", syncFromRoute);
		window.removeEventListener("keydown", onKey);
	};
});
</script>

<div class="site-nav-rail-shell" class:site-nav-rail-shell--expanded={expanded}>
	{#if expanded}
		<div
			class="site-nav-rail-scrim"
			aria-hidden="true"
			onclick={() => (expanded = false)}
		></div>
	{/if}

	<div
		id="site-nav-rail"
		class="site-nav-rail"
		class:site-nav-rail--expanded={expanded}
	>
		<NavigationRail
			items={railItems}
			bind:value={activeValue}
			bind:expanded
			expandable
			label={`${i18n(I18nKey.mainNavigation)} · ${i18n(I18nKey.sidebar)}`}
			onselect={handleSelect}
		>
			{#snippet header()}
				<div class="site-nav-rail__head">
					<button
						type="button"
						class="site-nav-rail__toggle m3-state-layer"
						aria-label={expanded ? i18n(I18nKey.close) : i18n(I18nKey.menu)}
						aria-expanded={expanded}
						onclick={() => (expanded = !expanded)}
					>
						<span class="site-nav-rail__toggle-icon" aria-hidden="true">
							<Icon
								icon={expanded
									? "material-symbols:menu-open-rounded"
									: "material-symbols:menu-rounded"}
							/>
						</span>
						<span class="site-nav-rail__brand">
							<Avatar
								src={url("/assets/images/chaos-avatar.jpg")}
								alt=""
								size={24}
								shape="rounded"
								fallback={siteConfig.title[0]}
							/>
							<span class="site-nav-rail__brand-name">{siteConfig.title}</span>
						</span>
					</button>
				</div>
			{/snippet}
		</NavigationRail>
	</div>
</div>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.site-nav-rail-shell
	display: none

	@media (min-width: bp-sm) and (max-width: bp-lg - 1px)
		display: block

.site-nav-rail-scrim
	position: fixed
	inset: 0
	z-index: 44
	background: unquote("color-mix(in oklab, var(--scrim, #000) 20%, transparent)")
	backdrop-filter: blur(2px)
	-webkit-backdrop-filter: blur(2px)
	animation: rail-scrim-in 240ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1))

.site-nav-rail
	position: fixed
	top: calc(4rem + 0.75rem)
	left: 0.75rem
	max-height: calc(100dvh - 5.5rem)
	z-index: 45
	overflow-y: auto
	overflow-x: hidden
	scrollbar-width: none
	border-radius: var(--shape-corner-xl)
	background: unquote("color-mix(in oklab, var(--surface-container-low) 90%, transparent)")
	backdrop-filter: blur(16px)
	-webkit-backdrop-filter: blur(16px)
	box-shadow: var(--m3e-elevation-2)
	transition:
		background-color 240ms var(--m3e-easing-standard),
		box-shadow 300ms var(--m3e-easing-emphasized-decelerate)
	&::-webkit-scrollbar
		display: none

	&--expanded
		background: unquote("color-mix(in oklab, var(--surface-container-low) 97%, transparent)")
		box-shadow: var(--m3e-elevation-3)

	&__head
		display: flex
		flex-direction: column
		padding-bottom: 4px
		margin-bottom: 4px
		border-bottom: 1px solid unquote("color-mix(in oklab, var(--outline-variant) 50%, transparent)")

	&__toggle
		display: flex
		align-items: center
		gap: 12px
		width: 100%
		height: 44px
		box-sizing: border-box
		padding: 0 16px
		border: none
		border-radius: var(--shape-corner-full)
		background: transparent
		color: var(--on-surface)
		cursor: pointer
		overflow: hidden
		--m3e-state-color: var(--on-surface)
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))
		&:active
			transform: scale(0.96)
		&:focus-visible
			outline: 2px solid var(--primary)
			outline-offset: -2px

	&__toggle-icon
		display: flex
		flex: none
		align-items: center
		justify-content: center
		color: var(--primary)
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__brand
		display: flex
		align-items: center
		gap: 8px
		min-width: 0
		opacity: 0
		transform: translateX(-6px)
		pointer-events: none
		transition:
			opacity 140ms var(--m3e-easing-effects-fast, cubic-bezier(0.2, 0, 0, 1)),
			transform 200ms var(--m3e-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15))

	&--expanded &__brand
		opacity: 1
		transform: translateX(0)
		pointer-events: auto
		transition:
			opacity 240ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1)) 90ms,
			transform 300ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) 60ms

	&__brand-name
		font: var(--m3e-type-title-small)
		font-weight: 600
		color: var(--on-surface)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

@keyframes rail-scrim-in
	from
		opacity: 0
	to
		opacity: 1
</style>
