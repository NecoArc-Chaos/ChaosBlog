<script lang="ts">
/**
 * 移动端与中等屏幕（<1024px）同体变形悬浮导航导轨。
 * 复用 atoms/navigation/NavigationRail 原子（expandable 模式）：
 *   - 平板 / 窄桌面（640px–1023px）：常驻 76px 宽 28px 大圆角悬浮毛玻璃 Dock，
 *     点击顶部按钮或「更多」原地平滑扩宽至 248px；
 *   - 手机小屏（<640px）：收起态零宽度占用（正文 100% 全宽阅读），点击顶栏左上角
 *     #nav-drawer-switch 按钮时，直接从左上角原地展开长成 248px 悬浮毛玻璃左栏，
 *     并支持背景滚动锁定、Esc 与点击外部遮罩收起。
 */
import Avatar from "@components/atoms/display/Avatar.svelte";
import NavigationRail, {
	type NavigationRailItem,
} from "@components/atoms/navigation/NavigationRail.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { resolveNavBarLinks, resolvePageKey } from "@utils/nav-utils";
import { lockPageScroll, type ScrollLockRelease } from "@utils/scroll-lock";
import { url } from "@utils/url-utils";
import { onMount, tick } from "svelte";
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
let railEl: HTMLElement | undefined = $state();
let releaseScrollLock: ScrollLockRelease | null = null;
let previousFocusEl: HTMLElement | null = null;

function isMobileViewport(): boolean {
	return typeof window !== "undefined" && window.innerWidth < 640;
}

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

$effect(() => {
	if (typeof document !== "undefined") {
		document.dispatchEvent(
			new CustomEvent("site-drawer:state", { detail: { open: expanded } }),
		);
	}
	if (expanded) {
		previousFocusEl = document.activeElement as HTMLElement | null;
		if (isMobileViewport()) {
			releaseScrollLock?.();
			releaseScrollLock = lockPageScroll();
		}
		tick().then(() => {
			if (isMobileViewport()) {
				railEl?.focus({ preventScroll: true });
			}
		});
	} else {
		releaseScrollLock?.();
		releaseScrollLock = null;
		if (
			isMobileViewport() &&
			previousFocusEl &&
			document.contains(previousFocusEl)
		) {
			previousFocusEl.focus({ preventScroll: true });
		}
		previousFocusEl = null;
	}
});

onMount(() => {
	syncFromRoute();
	const onToggle = () => {
		expanded = !expanded;
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape" && expanded) {
			e.preventDefault();
			expanded = false;
		}
	};
	document.addEventListener("site-drawer:toggle", onToggle);
	document.addEventListener("swup:content:replace", syncFromRoute);
	window.addEventListener("popstate", syncFromRoute);
	window.addEventListener("keydown", onKey);
	return () => {
		releaseScrollLock?.();
		document.removeEventListener("site-drawer:toggle", onToggle);
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
		bind:this={railEl}
		id="site-nav-rail"
		class="site-nav-rail"
		class:site-nav-rail--expanded={expanded}
		tabindex="-1"
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

	@media (max-width: bp-lg - 1px)
		display: block

.site-nav-rail-scrim
	position: fixed
	inset: 0
	z-index: 44
	background: unquote("color-mix(in oklab, var(--scrim, #000) 24%, transparent)")
	backdrop-filter: blur(3px)
	-webkit-backdrop-filter: blur(3px)
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
	outline: none
	border-radius: var(--shape-corner-xl)
	background: unquote("color-mix(in oklab, var(--surface-container-low) 90%, transparent)")
	backdrop-filter: blur(16px)
	-webkit-backdrop-filter: blur(16px)
	box-shadow: var(--m3e-elevation-2)
	transform-origin: top left
	transition:
		background-color 240ms var(--m3e-easing-standard),
		box-shadow 300ms var(--m3e-easing-emphasized-decelerate)
	&::-webkit-scrollbar
		display: none

	/* 手机端（<640px）：收起时零占宽隐藏，展开时从左上角原地缩放长成大圆角悬浮左栏 */
	@media (max-width: bp-sm - 1px)
		opacity: 0
		visibility: hidden
		pointer-events: none
		transform: translate(-6px, -12px) scale(0.84)
		transition:
			opacity 180ms var(--m3e-easing-effects-fast, cubic-bezier(0.2, 0, 0, 1)),
			transform 220ms var(--m3e-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15)),
			visibility 0s linear 220ms,
			background-color 240ms var(--m3e-easing-standard),
			box-shadow 240ms var(--m3e-easing-standard)

		&--expanded
			opacity: 1
			visibility: visible
			pointer-events: auto
			transform: translate(0, 0) scale(1)
			transition:
				opacity 220ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1)),
				transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1)),
				visibility 0s linear 0s,
				background-color 240ms var(--m3e-easing-standard),
				box-shadow 300ms var(--m3e-easing-emphasized-decelerate)

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
