<script lang="ts">
	import type { AccordionModuleConfig, SpacingPreset } from '$lib/config.svelte';

	let { config, spacing_v = 'normal', spacing_h = 'normal', center_header = false }: { config: AccordionModuleConfig; spacing_v?: SpacingPreset; spacing_h?: SpacingPreset; center_header?: boolean } = $props();
	let openIndex = $state<number | null>(null);

	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}
</script>

{#if config.items?.length}
	<section class="accordion" class:is-v-compact={spacing_v === 'compact'} class:is-v-spacious={spacing_v === 'spacious'} class:is-h-compact={spacing_h === 'compact'} class:is-h-spacious={spacing_h === 'spacious'} id={config.title?.toLowerCase().replace(/\s+/g, '-') || 'accordion'}>
		<h2 class="accordion__title wchs-section-heading" class:is-centered={center_header}>{config.title}</h2>
		<div class="accordion__list">
			{#each config.items as item, i}
				<div class="accordion__item" class:is-open={openIndex === i}>
					<button
						class="accordion__trigger"
						class:is-open={openIndex === i}
						onclick={() => toggle(i)}
						aria-expanded={openIndex === i}
					>
						<span class="accordion__question">{item.q}</span>
						<span class="accordion__icon" aria-hidden="true"></span>
					</button>
					<div class="accordion__panel" class:is-open={openIndex === i}>
						<div class="accordion__answer accordion__answer--html">
							{@html item.a}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.accordion {
		--mod-pt: var(--wchs-spacing-v-normal, 48px);
		--mod-pb: var(--wchs-spacing-v-normal, 56px);
		--mod-px: 28px;
		--mod-max-w: 960px;
		max-width: var(--mod-max-w);
		margin: 0 auto;
		padding: var(--mod-pt) var(--mod-px) var(--mod-pb);
	}
	.accordion.is-v-compact {
		--mod-pt: var(--wchs-spacing-v-compact, 20px);
		--mod-pb: var(--wchs-spacing-v-compact, 24px);
	}
	.accordion.is-v-spacious {
		--mod-pt: var(--wchs-spacing-v-spacious, 72px);
		--mod-pb: var(--wchs-spacing-v-spacious, 80px);
	}
	.accordion.is-h-compact  { --mod-max-w: 100%; --mod-px: 12px; }
	.accordion.is-h-spacious { --mod-max-w: 760px; --mod-px: 40px; }

	.accordion__title {
		margin: 0 0 32px;
	}
	.accordion__title.is-centered {
		text-align: center;
	}

	.accordion__list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.accordion__item {
		border-radius: 10px;
		background: var(--bg-muted);
		overflow: hidden;
		transition: background var(--dur-fast) var(--ease);
	}
	.accordion__item.is-open {
		background: color-mix(in srgb, var(--bg-muted) 88%, var(--fg) 4%);
	}

	.accordion__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		width: 100%;
		padding: 18px 20px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-sans);
		color: var(--fg);
	}

	.accordion__question {
		flex: 1;
		min-width: 0;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.4;
		padding-right: 8px;
	}

	.accordion__icon {
		position: relative;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		color: var(--fg-muted);
	}
	.accordion__icon::before,
	.accordion__icon::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		background: currentColor;
		border-radius: 1px;
		transition:
			transform var(--dur-fast) var(--ease),
			opacity var(--dur-fast) var(--ease);
	}
	.accordion__icon::before {
		width: 2px;
		height: 14px;
		transform: translate(-50%, -50%);
	}
	.accordion__icon::after {
		width: 14px;
		height: 2px;
		transform: translate(-50%, -50%);
	}
	.accordion__trigger.is-open .accordion__icon::before {
		opacity: 0;
		transform: translate(-50%, -50%) scaleY(0);
	}

	.accordion__panel {
		display: grid;
		grid-template-rows: minmax(0, 0fr);
		overflow: hidden;
		transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.accordion__panel.is-open {
		grid-template-rows: minmax(0, 1fr);
	}

	.accordion__answer {
		min-height: 0;
		overflow: hidden;
	}

	.accordion__answer--html {
		font-size: 14px;
		line-height: 1.65;
		color: var(--fg-muted);
		max-width: 640px;
		padding: 0 20px 18px;
	}
	.accordion__answer--html :global(p) { margin: 0 0 10px; }
	.accordion__answer--html :global(p:last-child) { margin-bottom: 0; }
	.accordion__answer--html :global(a) { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }
	.accordion__answer--html :global(strong) { font-weight: 700; }
	.accordion__answer--html :global(em) { font-style: italic; }
	.accordion__answer--html :global(ul),
	.accordion__answer--html :global(ol) { padding-left: 24px; margin: 0 0 10px; }
	.accordion__answer--html :global(li) { margin-bottom: 4px; }
</style>
