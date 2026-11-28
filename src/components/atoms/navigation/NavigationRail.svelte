<script lang="ts">
/**
 * M3E NavigationRail — 侧边导航栏原子（官方 NavigationRail.kt / ExpandedNavigationRail 移植）。
 * 支持两种模式：
 * 1. 标准导轨（expandable = false）：80dp 宽，垂直图标+标签，56×32 active indicator pill；
 * 2. MD3E 可展开同体变形导轨（expandable = true）：
 *    - 收起态（76px 宽）：图标居中（16px 左内边距 + 24px 图标 + 16px 右内边距 = 56px），56×44 胶囊指示器；
 *    - 展开态（248px 宽）：同一容器平滑扩宽，图标位置无缝延续、胶囊延展为整行 pill、文字横向淡入，
 *      支持内置可折叠二级分组（children），无需再弹出第二个重复抽屉。
 */
import Icon from "@iconify/svelte";

export interface NavigationRailChild {
	value: string;
	label: string;
	icon?: string;
}

export interface NavigationRailItem {
	value: string;
	label: string;
	icon?: string;
	children?: NavigationRailChild[];
}

let {
	items = [],
	value = $bindable(""),
	expanded = $bindable(false),
	expandable = false,
	label = "导航",
	alwaysShowLabel = true,
	header,
	onselect,
	class: className = "",
}: {
	items: NavigationRailItem[];
	value?: string;
	expanded?: boolean;
	/** true = 启用 MD3E Expanded Navigation Rail 同体扩缩形态 */
	expandable?: boolean;
	label?: string;
	/** false = 折叠模式（仅标准导轨模式下生效）：仅选中项显示 label */
	alwaysShowLabel?: boolean;
	/** header 插槽（顶部，通常展开按钮 / 头像 / Logo） */
	header?: import("svelte").Snippet;
	/** 点击叶子项或分组触发的回调（可选，用于路由跳转或分组联动） */
	onselect?: (itemValue: string, isGroup: boolean) => void;
	class?: string;
} = $props();

const openGroups = $state<Record<string, boolean>>({});

function isGroupActive(item: NavigationRailItem): boolean {
	return Boolean(item.children?.some((child) => child.value === value));
}

function handleItemClick(item: NavigationRailItem) {
	if (item.children && item.children.length > 0) {
		if (expandable && !expanded) {
			expanded = true;
			openGroups[item.value] = true;
		} else {
			openGroups[item.value] = !openGroups[item.value];
		}
		onselect?.(item.value, true);
		return;
	}
	value = item.value;
	onselect?.(item.value, false);
}

function handleChildClick(child: NavigationRailChild) {
	value = child.value;
	onselect?.(child.value, false);
}
</script>

<div
	class="m3-nav-rail {className}"
	class:m3-nav-rail--expandable={expandable}
	class:m3-nav-rail--expanded={expandable && expanded}
	role="navigation"
	aria-label={label}
>
	{#if header}
		<div class="m3-nav-rail__header">{@render header()}</div>
	{/if}

	<div class="m3-nav-rail__items">
		{#each items as item (item.value)}
			{@const hasChildren = Boolean(item.children?.length)}
			{@const active = value === item.value || isGroupActive(item)}
			{#if expandable}
				<div class="m3-nav-rail__entry">
					<button
						type="button"
						class="m3-nav-rail__morph-item m3-state-layer"
						class:m3-nav-rail__morph-item--active={active}
						title={!expanded ? item.label : undefined}
						aria-label={item.label}
						aria-current={value === item.value ? "page" : undefined}
						aria-expanded={hasChildren ? Boolean(openGroups[item.value] && expanded) : undefined}
						onclick={() => handleItemClick(item)}
					>
						<span class="m3-nav-rail__morph-icon" aria-hidden="true">
							<Icon icon={item.icon ?? "material-symbols:circle"} />
						</span>
						<span class="m3-nav-rail__morph-label">{item.label}</span>
						{#if hasChildren}
							<span
								class="m3-nav-rail__morph-arrow"
								class:m3-nav-rail__morph-arrow--open={Boolean(openGroups[item.value])}
								aria-hidden="true"
							>
								<Icon icon="material-symbols:keyboard-arrow-down-rounded" />
							</span>
						{/if}
					</button>

					{#if hasChildren && expanded && openGroups[item.value]}
						<div class="m3-nav-rail__sublist">
							{#each item.children ?? [] as child (child.value)}
								<button
									type="button"
									class="m3-nav-rail__morph-item m3-nav-rail__morph-item--child m3-state-layer"
									class:m3-nav-rail__morph-item--active={value === child.value}
									aria-label={child.label}
									aria-current={value === child.value ? "page" : undefined}
									onclick={() => handleChildClick(child)}
								>
									<span class="m3-nav-rail__morph-icon" aria-hidden="true">
										<Icon icon={child.icon ?? "material-symbols:circle"} />
									</span>
									<span class="m3-nav-rail__morph-label">{child.label}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<button
					type="button"
					class="m3-nav-rail__item"
					class:m3-nav-rail__item--active={value === item.value}
					class:m3-nav-rail__item--collapsed={!alwaysShowLabel}
					aria-label={item.label}
					aria-current={value === item.value ? "page" : undefined}
					onclick={() => (value = item.value)}
				>
					<span class="m3-nav-rail__indicator" aria-hidden="true"></span>
					<span class="m3-nav-rail__icon" aria-hidden="true">
						<Icon icon={item.icon ?? "material-symbols:circle"}></Icon>
					</span>
					<span class="m3-nav-rail__label">{item.label}</span>
				</button>
			{/if}
		{/each}
	</div>
</div>

<style lang="stylus">
.m3-nav-rail
	display: flex
	flex-direction: column
	align-items: center
	gap: 12px
	width: 80px
	min-height: 100%
	box-sizing: border-box
	padding: 12px 0
	background: var(--surface)
	color: var(--on-surface)

	&__header
		display: flex
		flex-direction: column
		align-items: center
		width: 100%

	&__items
		display: flex
		flex-direction: column
		gap: 12px
		width: 100%
		align-items: center

	/* === 模式 2：MD3E Expandable 同体变形导轨 === */
	&--expandable
		align-items: stretch
		width: 76px
		min-height: auto
		gap: 8px
		padding: 12px 10px
		background: transparent
		overflow-x: hidden
		transition:
			width 360ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)),
			padding 360ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1))

		.m3-nav-rail__header
			align-items: stretch

		.m3-nav-rail__items
			align-items: stretch
			gap: 4px

	&--expanded
		width: 248px
		padding: 12px 12px

	&__entry
		display: flex
		flex-direction: column
		min-width: 0

	/* 数学同心对齐：收起宽 56px（76 - 2*10），左内边距 16px + 24px 图标 + 16px = 56px，图标完美居中；
	   展开时容器平滑增宽到 224px，图标原地不动，文字和胶囊随宽幅自然展开 */
	&__morph-item
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
		color: var(--on-surface-variant)
		text-align: left
		cursor: pointer
		overflow: hidden
		--m3e-state-color: var(--on-surface)
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			color var(--m3e-duration-short) var(--m3e-easing-standard),
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))

		&:active
			transform: scale(0.97)

		&:focus-visible
			outline: 2px solid var(--secondary)
			outline-offset: -2px

		&--active
			background: var(--secondary-container)
			color: var(--on-secondary-container)
			--m3e-state-color: var(--on-secondary-container)

		&--child
			height: 40px
			padding-left: 24px
			.m3-nav-rail__morph-icon > :global(svg)
				width: 1.25rem
				height: 1.25rem
			.m3-nav-rail__morph-label
				font: var(--m3e-type-body-medium)

	&__morph-icon
		display: flex
		flex: none
		align-items: center
		justify-content: center
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__morph-label
		flex: 1
		min-width: 0
		font: var(--m3e-type-label-large)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		opacity: 0
		transform: translateX(-6px)
		pointer-events: none
		transition:
			opacity 160ms var(--m3e-easing-effects-fast, cubic-bezier(0.2, 0, 0, 1)),
			transform 220ms var(--m3e-easing-emphasized-accelerate, cubic-bezier(0.3, 0, 0.8, 0.15))

	&--expanded &__morph-label
		opacity: 1
		transform: translateX(0)
		pointer-events: auto
		transition:
			opacity 240ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1)) 90ms,
			transform 300ms var(--m3e-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1)) 60ms

	&__morph-arrow
		display: flex
		flex: none
		opacity: 0
		transition:
			opacity 140ms var(--m3e-easing-effects-fast, cubic-bezier(0.2, 0, 0, 1)),
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))
		> :global(svg)
			width: 1.25rem
			height: 1.25rem
		&--open
			transform: rotate(180deg)

	&--expanded &__morph-arrow
		opacity: 1
		transition:
			opacity 220ms var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1)) 100ms,
			transform var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1))

	&__sublist
		display: flex
		flex-direction: column
		gap: 2px
		padding: 4px 0 6px
		transform-origin: top center
		animation:
			rail-sublist-spatial var(--m3e-duration-spring-fast, 340ms) var(--m3e-easing-spring-fast, cubic-bezier(0.34, 1.38, 0.64, 1)),
			rail-sublist-effects var(--m3e-duration-effects-default, 220ms) var(--m3e-easing-effects-default, cubic-bezier(0.05, 0.7, 0.1, 1))

	/* === 模式 1：标准导轨项（保持向后兼容） === */
	&__item
		display: grid
		grid-template-rows: 32px auto
		justify-items: center
		align-content: center
		width: 72px
		height: 64px
		box-sizing: border-box
		border: none
		border-radius: var(--shape-corner-full)
		background: none
		cursor: pointer
		&:focus-visible
			outline: 2px solid var(--secondary)
			outline-offset: -2px

	&__indicator
		grid-row: 1
		grid-column: 1
		width: 56px
		height: 32px
		border-radius: var(--shape-corner-full)
		background: unquote("color-mix(in oklab, var(--on-surface) 8%, transparent)")
		opacity: 0
		transform: scaleX(0)
		transition:
			transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate),
			opacity var(--m3e-duration-medium) var(--m3e-easing-standard),
			background-color var(--m3e-duration-short) var(--m3e-easing-standard)

	&__item:hover &__indicator
		transform: scaleX(1)
		opacity: 1

	&__item--active &__indicator
		transform: scaleX(1)
		opacity: 1
		background: var(--secondary-container)

	&__item--active:hover &__indicator
		background: unquote("color-mix(in oklab, var(--on-secondary-container) 8%, var(--secondary-container))")

	&__icon
		grid-row: 1
		grid-column: 1
		align-self: center
		z-index: 1
		display: flex
		color: var(--on-surface-variant)
		transition: color var(--m3e-duration-short) var(--m3e-easing-standard)
		> :global(svg)
			width: 1.5rem
			height: 1.5rem

	&__item--active &__icon
		color: var(--on-secondary-container)

	&__label
		grid-row: 2
		margin-top: 8px
		font: var(--m3e-type-label-medium)
		color: var(--on-surface-variant)
		white-space: nowrap
		transition: color var(--m3e-duration-short) var(--m3e-easing-standard)

	&__item--active &__label
		color: var(--secondary)

	&__item--collapsed
		min-height: 56px
		grid-template-rows: 32px auto

		&:not(.m3-nav-rail__item--active)
			.m3-nav-rail__label
				display: none

@keyframes rail-sublist-spatial
	from
		transform: translateY(-6px) scaleY(0.95)
	to
		transform: translateY(0) scaleY(1)

@keyframes rail-sublist-effects
	from
		opacity: 0
	to
		opacity: 1
</style>
