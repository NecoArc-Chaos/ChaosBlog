<script lang="ts">
/**
 * 全站导航抽屉（M3 ModalNavigationDrawer 应用）。
 * 顶部栏菜单按钮或平板导航导轨派发 site-drawer:toggle 事件开合；
 * 遵循 MD3E Spatial/Effects 分离规范：
 *   - 面板主体采用平滑阻尼 Emphasized Decelerate/Accelerate（避免大面墙体晃动），
 *   - 外层 visibility 延迟至退场完成后隐藏（消除瞬移闪退），
 *   - 内部导航项轻量交错渐入 + 按压弹性微反馈，
 *   - 焦点落至 dialog 容器自身，保留 Tab 焦点陷阱与关闭返还焦点。
 */

import IconButton from "@components/atoms/action/IconButton.svelte";
import AccentBar from "@components/atoms/display/AccentBar.svelte";
import Avatar from "@components/atoms/display/Avatar.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { resolveNavBarLinks, resolvePageKey } from "@utils/nav-utils";
import { lockPageScroll, type ScrollLockRelease } from "@utils/scroll-lock";
import { url } from "@utils/url-utils";
import { onMount, tick } from "svelte";
import { siteConfig } from "@/config";
import { navBarConfig } from "@/config/navBarConfig";

let open = $state(false);
let activePrimary = $state("");
const openGroups = $state<Record<string, boolean>>({});

const links = resolveNavBarLinks(navBarConfig.links);

const primaryItems = links.map((link) => {
	const key = link.name.toLowerCase();
	return {
		value: key,
		label: link.name,
		icon: link.icon,
		href: link.url ? (link.external ? link.url : url(link.url)) : undefined,
		external: !!link.external,
		pageKey: link.pageKey ?? "",
		children: link.children?.map((child) => ({
			value: child.name.toLowerCase(),
			label: child.name,
			icon: child.icon,
			href: child.url
				? child.external
					? child.url
					: url(child.url)
				: undefined,
			external: !!child.external,
			pageKey: child.pageKey ?? "",
		})),
	};
});

function syncFromRoute() {
	const pageKey = resolvePageKey(new URL(window.location.href));
	activePrimary = "";
	for (const item of primaryItems) {
		if (item.pageKey && item.pageKey === pageKey) {
			activePrimary = item.value;
			break;
		}
		const activeChild = item.children?.find(
			(child) => child.pageKey && child.pageKey === pageKey,
		);
		if (activeChild) {
			activePrimary = activeChild.value;
			openGroups[item.value] = true;
			break;
		}
	}
}

// 点击链接后收起抽屉；外部链接不改变路由，高亮已由路由同步维护
function handleNavClick() {
	open = false;
}

function toggleGroup(group: string) {
	openGroups[group] = !openGroups[group];
}

let releaseScrollLock: ScrollLockRelease | null = null;
let previousFocusEl: HTMLElement | null = null;

function setBackgroundInert(inertState: boolean) {
	for (const id of ["top-row", "banner-wrapper", "main-layout"]) {
		const el = document.getElementById(id) as
			| (HTMLElement & { inert: boolean })
			| null;
		if (el) el.inert = inertState;
	}
}

function getFocusableElements(): HTMLElement[] {
	if (!drawerEl) return [];
	return Array.from(
		drawerEl.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
		),
	).filter((el) => el.offsetParent !== null);
}

$effect(() => {
	if (open) {
		previousFocusEl = document.activeElement as HTMLElement | null;
		releaseScrollLock?.();
		releaseScrollLock = lockPageScroll();
		setBackgroundInert(true);
		tick().then(() => {
			drawerEl?.focus({ preventScroll: true });
		});
	} else {
		releaseScrollLock?.();
		releaseScrollLock = null;
		setBackgroundInert(false);
		if (previousFocusEl && document.contains(previousFocusEl)) {
			previousFocusEl.focus({ preventScroll: true });
		}
		previousFocusEl = null;
	}
});

onMount(() => {
	syncFromRoute();
	const onToggle = () => {
		open = !open;
	};
	const onKey = (e: KeyboardEvent) => {
		if (!open) return;
		if (e.key === "Escape") {
			e.preventDefault();
			open = false;
			return;
		}
		if (e.key === "Tab") {
			const focusables = getFocusableElements();
			if (focusables.length === 0) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (
				e.shiftKey &&
				(document.activeElement === first ||
					document.activeElement === drawerEl)
			) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};
	document.addEventListener("site-drawer:toggle", onToggle);
	document.addEventListener("swup:content:replace", syncFromRoute);
	window.addEventListener("keydown", onKey);
	return () => {
		releaseScrollLock?.();
		setBackgroundInert(false);
		document.removeEventListener("site-drawer:toggle", onToggle);
		document.removeEventListener("swup:content:replace", syncFromRoute);
		window.removeEventListener("keydown", onKey);
	};
});

let drawerEl: HTMLElement | undefined = $state();
</script>

<div
	class="site-drawer"
	class:site-drawer--open={open}
	inert={!open}
>
	<div class="site-drawer__scrim" aria-hidden="true" onclick={() => (open = false)}></div>
	<aside
		bind:this={drawerEl}
		class="site-drawer__panel"
		role="dialog"
		aria-modal="true"
		aria-label={siteConfig.title}
		tabindex="-1"
	>
		<header class="site-drawer__brand">
			<div class="site-drawer__brand-identity">
				<Avatar
					src={url("/assets/images/chaos-avatar.jpg")}
					alt=""
					size={42}
					shape="rounded"
					fallback={siteConfig.title[0]}
				/>
				<div class="site-drawer__brand-text">
					<div class="site-drawer__title-row">
						<AccentBar size="small" />
						<span class="site-drawer__title">{siteConfig.title}</span>
					</div>
					<div class="site-drawer__subtitle">{siteConfig.subtitle}</div>
				</div>
			</div>
			<IconButton
				icon="material-symbols:close-rounded"
				label={i18n(I18nKey.close)}
				size="small"
				onclick={() => (open = false)}
			/>
		</header>

		<nav class="site-drawer__nav" aria-label={i18n(I18nKey.navigationDrawer)}>
			{#each primaryItems as item, index (item.value)}
				{#if item.children}
					<div class="site-drawer__group site-drawer__stagger" style={`--drawer-idx: ${Math.min(index, 8)}`}>
						<button type="button" class="site-drawer__group-head m3-state-layer" class:site-drawer__item--active={item.children.some((child) => activePrimary === child.value)} onclick={() => toggleGroup(item.value)} aria-expanded={openGroups[item.value] ?? false}>
							{#if item.icon}<span class="site-drawer__group-icon" aria-hidden="true"><Icon icon={item.icon} /></span>{/if}
							<span class="site-drawer__group-label">{item.label}</span>
							<Icon class={openGroups[item.value] ? "site-drawer__group-arrow site-drawer__group-arrow--open" : "site-drawer__group-arrow"} icon="material-symbols:keyboard-arrow-down" />
						</button>
						{#if openGroups[item.value]}
							<div class="site-drawer__group-body">
								{#each item.children as child (child.value)}
									<a href={child.href} class="site-drawer__item site-drawer__item--child m3-state-layer" class:site-drawer__item--active={activePrimary === child.value} aria-current={activePrimary === child.value ? "page" : undefined} target={child.external ? "_blank" : undefined} rel={child.external ? "noopener noreferrer" : undefined} onclick={handleNavClick}>
										{#if child.icon}<span class="site-drawer__item-icon" aria-hidden="true"><Icon icon={child.icon} /></span>{/if}
										<span class="site-drawer__item-label">{child.label}</span>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else if item.href}
					<a href={item.href} class="site-drawer__item site-drawer__stagger m3-state-layer" style={`--drawer-idx: ${Math.min(index, 8)}`} class:site-drawer__item--active={activePrimary === item.value} aria-current={activePrimary === item.value ? "page" : undefined} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} onclick={handleNavClick}>
						{#if item.icon}<span class="site-drawer__item-icon" aria-hidden="true"><Icon icon={item.icon} /></span>{/if}
						<span class="site-drawer__item-label">{item.label}</span>
					</a>
				{/if}
			{/each}

		</nav>
	</aside>
</div>

<style lang="stylus">
.site-drawer
	position: fixed
	inset: 0
	z-index: 60
	visibility: hidden
	pointer-events: none
	/* 关闭时等待面板平滑退场完成（240ms）后再隐藏，消除瞬间闪退 */
	transition: visibility 0s linear 240ms

	&--open
		visibility: visible
		pointer-events: auto
		transition: visibility 0s linear 0s

	&__scrim
		position: absolute
		inset: 0
		background: unquote("color-mix(in oklab, var(--scrim, #000) 34%, transparent)")
		backdrop-filter: blur(3px)
		-webkit-backdrop-filter: blur(3px)
		opacity: 0
		transition: opacity 240ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1))

	&--open &__scrim
		opacity: 1
		transition: opacity 320ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1))

	/* 面板：360dp 宽、surface-container-low、右侧 28dp 同心大圆角
	   采用 MD3E Emphasized Decelerate/Accelerate 平滑阻尼滑入滑出，保持大面积浮层稳重丝滑 */
	&__panel
		position: absolute
		top: 0
		bottom: 0
		left: 0
		display: flex
		flex-direction: column
		width: 360px
		max-width: 85vw
		box-sizing: border-box
		background: var(--surface-container-low)
		color: var(--on-surface)
		border-radius: 0 var(--shape-corner-xl) var(--shape-corner-xl) 0
		box-shadow: none
		outline: none
		transform: translateX(-100%)
		will-change: transform
		transition:
			transform 240ms var(--m3e-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15)),
			box-shadow 240ms var(--m3e-easing-standard)

	&--open &__panel
		transform: translateX(0)
		box-shadow: var(--m3e-elevation-3)
		transition:
			transform 380ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
			box-shadow 380ms var(--m3e-easing-standard)

	&__brand
		display: flex
		align-items: center
		justify-content: space-between
		gap: var(--m3e-space-3)
		padding: var(--m3e-space-5) var(--m3e-space-4) var(--m3e-space-3) var(--m3e-space-5)
		flex: none

	&__brand-identity
		display: flex
		align-items: center
		gap: var(--m3e-space-3)
		min-width: 0

	&__brand-text
		display: flex
		flex-direction: column
		min-width: 0

	&__title-row
		display: flex
		align-items: center
		gap: var(--m3e-space-2)
		min-width: 0

	&__title
		font: var(--m3e-type-title-medium)
		font-weight: 600
		color: var(--on-surface)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

	&__subtitle
		margin-top: 0.125rem
		font: var(--m3e-type-body-small)
		color: var(--on-surface-variant)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

	&__nav
		flex: 1
		overflow-y: auto
		padding: var(--m3e-space-2) var(--m3e-space-3) var(--m3e-space-5)
		scrollbar-width: thin

	/* 内部菜单项轻量交错渐入（关闭时不设延迟，利落退场） */
	&__stagger
		opacity: 0
		transform: translateX(-10px)
		transition:
			opacity 140ms var(--m3e-easing-effects-fast, cubic-bezier(0.2, 0, 0, 1)),
			transform 160ms var(--m3e-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15))
		transition-delay: 0ms

	&--open &__stagger
		opacity: 1
		transform: translateX(0)
		transition:
			opacity 240ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1)),
			transform 320ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1))
		transition-delay: calc(50ms + var(--drawer-idx, 0) * 24ms)

	/* 一级/子项：全宽 56dp（子项 48dp），选中整项 secondary-container 全圆 pill */
	&__item
		display: flex
		align-items: center
		gap: var(--m3e-space-3)
		width: 100%
		min-height: 52px
		box-sizing: border-box
		padding: 0 var(--m3e-space-4)
		border-radius: var(--shape-corner-full)
		color: var(--on-surface-variant)
		text-decoration: none
		cursor: pointer
		--m3e-state-color: var(--on-surface)
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			color var(--m3e-duration-short) var(--m3e-easing-standard),
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))

		&:active
			transform: scale(0.985)

		&:focus-visible
			outline: 2px solid var(--secondary)
			outline-offset: -2px

		&--active
			background: var(--secondary-container)
			color: var(--on-secondary-container)
			--m3e-state-color: var(--on-secondary-container)

		&--child
			min-height: 46px
			padding-left: var(--m3e-space-8)

	&__item-icon
		display: flex
		flex: none
		color: var(--on-surface-variant)
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__item--active &__item-icon
		color: var(--on-secondary-container)

	&__item-label
		flex: 1
		min-width: 0
		font: var(--m3e-type-label-large)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

	&__item--child &__item-label
		font: var(--m3e-type-body-medium)

	/* 分组头部 */
	&__group
		margin-top: 2px

	&__group-head
		display: flex
		align-items: center
		gap: 12px
		width: 100%
		min-height: 52px
		box-sizing: border-box
		padding: 0 16px
		border: none
		border-radius: var(--shape-corner-full)
		background: none
		color: var(--on-surface-variant)
		cursor: pointer
		--m3e-state-color: var(--on-surface)
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))
		&:active
			transform: scale(0.985)
		&:focus-visible
			outline: 2px solid var(--secondary)
			outline-offset: -2px

	&__group-icon
		display: flex
		flex: none
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__group-label
		flex: 1
		text-align: left
		font: var(--m3e-type-label-large)
		color: var(--on-surface-variant)

	&__group-arrow
		display: flex
		flex: none
		transition: transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))
		> :global(svg)
			width: 1.25rem
			height: 1.25rem

		&--open
			transform: rotate(180deg)

	&__group-body
		padding: 4px 0 8px
		transform-origin: top center
		animation:
			drawer-group-spatial var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1)),
			drawer-group-effects var(--m3e-duration-effects-default, 220ms) var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1))

@keyframes drawer-group-spatial
	from
		transform: translateY(-8px) scaleY(0.95)
	to
		transform: translateY(0) scaleY(1)

@keyframes drawer-group-effects
	from
		opacity: 0
	to
		opacity: 1
</style>
