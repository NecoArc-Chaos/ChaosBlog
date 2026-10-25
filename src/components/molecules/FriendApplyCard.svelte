<script lang="ts">
import Button from "@components/atoms/action/Button.svelte";
import Card from "@components/atoms/display/Card.svelte";
import Icon from "@iconify/svelte";

let { class: className = "" }: { class?: string } = $props();

const siteInfo = `title: "Chaos的小站"
imgurl: "https://www.nachaos.xyz/assets/images/chaos-avatar.jpg"
desc: "调制饮料，改变人生。正在尝试写点有用的"
siteurl: "https://www.nachaos.xyz/"
tags: ["Friend"]`;

const emailSubject = "【友链申请】交换友链 - [您的网站名称]";
const emailBody = `你好，我想与「Chaos的小站」申请交换友链！

【我的网站信息】
title: ""
siteurl: ""
imgurl: ""
desc: ""
tags: ["Friend"]

【贵站信息已预先添加】
title: "Chaos的小站"
siteurl: "https://www.nachaos.xyz/"
imgurl: "https://www.nachaos.xyz/assets/images/chaos-avatar.jpg"
desc: "调制饮料，改变人生。正在尝试写点有用的"
tags: ["Friend"]

期待您的回复并添加到友链列表，谢谢！`;

const mailtoUrl = `mailto:acceleratoor0123@gmail.com?subject=${encodeURIComponent(
	emailSubject,
)}&body=${encodeURIComponent(emailBody)}`;

let copied = $state(false);
let copyTimer: ReturnType<typeof setTimeout> | undefined;

function copySiteInfo() {
	if (typeof navigator !== "undefined" && navigator.clipboard) {
		navigator.clipboard.writeText(siteInfo).then(() => {
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
}
</script>

<Card color="var(--card-bg)" radius="l" class={`friend-apply-card px-8 py-6 ${className}`}>
	<div class="friend-apply-card__header">
		<div class="friend-apply-card__title-row">
			<span class="friend-apply-card__icon" aria-hidden="true">
				<Icon icon="material-symbols:add-link-rounded" />
			</span>
			<h2 class="friend-apply-card__title">申请友链</h2>
		</div>
		<p class="friend-apply-card__subtitle">
			欢迎志趣相投的朋友交换友链！您可以根据以下格式填写您的网站链接并发送申请，收到后我会尽快添加到本站（then I'll add it to my website）。
		</p>
	</div>

	<div class="friend-apply-card__content">
		<div class="friend-apply-card__snippet-box">
			<div class="friend-apply-card__snippet-header">
				<span class="friend-apply-card__snippet-label">
					<Icon icon="material-symbols:badge-outline-rounded" aria-hidden="true" />
					本站信息（欢迎提前添加）
				</span>
				<button
					type="button"
					class="friend-apply-card__copy-btn m3-state-layer"
					onclick={copySiteInfo}
					aria-label={copied ? "已复制本站信息" : "复制本站信息"}
				>
					<Icon
						icon={copied
							? "material-symbols:check-rounded"
							: "material-symbols:content-copy-outline-rounded"}
						aria-hidden="true"
					/>
					<span>{copied ? "已复制" : "复制信息"}</span>
				</button>
			</div>

			<pre class="friend-apply-card__code"><code>{siteInfo}</code></pre>
		</div>

		<div class="friend-apply-card__actions">
			<Button
				variant="filled"
				size="small"
				icon="material-symbols:mail-rounded"
				label="跳转邮箱发送申请"
				href={mailtoUrl}
			/>
			<span class="friend-apply-card__email-tip">
				或者直接发送至：<code>acceleratoor0123@gmail.com</code>
			</span>
		</div>
	</div>
</Card>

<style lang="stylus">
@import "../../styles/breakpoints.styl"

.friend-apply-card
	display: flex
	flex-direction: column
	gap: var(--m3e-space-4)
	border: 1px solid var(--outline-variant)

	&__header
		display: flex
		flex-direction: column
		gap: 0.375rem

	&__title-row
		display: flex
		align-items: center
		gap: 0.75rem

	&__icon
		display: flex
		align-items: center
		justify-content: center
		color: var(--primary)
		> :global(svg)
			width: 1.75rem
			height: 1.75rem

	&__title
		margin: 0
		color: var(--on-surface)
		font: var(--m3e-type-title-large)
		font-weight: 700

	&__subtitle
		margin: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-medium)
		line-height: 1.6

	&__content
		display: flex
		flex-direction: column
		gap: 1.25rem

	&__snippet-box
		position: relative
		border-radius: var(--shape-corner-m)
		background: var(--surface-container-high)
		border: 1px solid var(--outline-variant)
		overflow: hidden

	&__snippet-header
		display: flex
		align-items: center
		justify-content: space-between
		padding: 0.5rem 1rem
		background: unquote("color-mix(in oklab, var(--on-surface) 4%, var(--surface-container-high))")
		border-bottom: 1px solid var(--outline-variant)

	&__snippet-label
		display: inline-flex
		align-items: center
		gap: 0.375rem
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-medium)
		font-weight: 600
		> :global(svg)
			width: 1rem
			height: 1rem
			color: var(--primary)

	&__copy-btn
		display: inline-flex
		align-items: center
		gap: 0.25rem
		padding: 0.25rem 0.625rem
		border: 1px solid var(--outline-variant)
		border-radius: var(--shape-corner-full)
		background: var(--surface-container-highest)
		color: var(--on-surface)
		font: var(--m3e-type-label-small)
		font-weight: 600
		cursor: pointer
		transition:
			background-color var(--m3e-duration-short) var(--m3e-easing-standard),
			border-color var(--m3e-duration-short) var(--m3e-easing-standard)
		> :global(svg)
			width: 0.875rem
			height: 0.875rem
		&:hover
			background: unquote("color-mix(in oklab, var(--primary) 10%, var(--surface-container-highest))")
			border-color: var(--primary)

	&__code
		margin: 0
		padding: 0.875rem 1rem
		overflow-x: auto
		font-family: var(--m3e-font-mono-family), monospace
		font-size: 0.875rem
		line-height: 1.6
		color: var(--on-surface)
		tab-size: 2
		white-space: pre

	&__actions
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: 1rem

	&__email-tip
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)
		> code
			font-family: var(--m3e-font-mono-family), monospace
			padding: 0.125rem 0.375rem
			border-radius: var(--shape-corner-xs)
			background: var(--surface-container-high)
			color: var(--primary)

	@media (max-width: bp-sm - 1px)
		padding: 1.25rem 1rem
		&__actions
			flex-direction: column
			align-items: stretch
</style>
