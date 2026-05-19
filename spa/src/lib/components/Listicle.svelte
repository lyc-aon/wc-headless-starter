<script lang="ts">
	import type { ListicleModuleConfig, ModuleResolved, SpacingPreset } from '$lib/config.svelte';

	let {
		config,
		resolved,
		spacing_v = 'normal',
		spacing_h = 'normal',
	}: {
		config: ListicleModuleConfig;
		resolved?: ModuleResolved;
		spacing_v?: SpacingPreset;
		spacing_h?: SpacingPreset;
	} = $props();

	const accentStyle = $derived(resolved?.accent_color ? `--accent: ${resolved.accent_color};` : '');
	const items = $derived((config.items ?? []).filter((it) => (it.headline ?? '').trim()));
	const showCta = $derived(Boolean(config.cta_label?.trim() && config.cta_href?.trim()));
</script>

{#if config.headline?.trim() || config.intro?.trim() || items.length}
	<section
		class="listicle"
		class:is-v-compact={spacing_v === 'compact'}
		class:is-v-spacious={spacing_v === 'spacious'}
		class:is-h-compact={spacing_h === 'compact'}
		class:is-h-spacious={spacing_h === 'spacious'}
		style={accentStyle}
	>
		<div class="listicle__inner">
			{#if config.headline?.trim()}
				<h2 class="listicle__headline">{config.headline.trim()}</h2>
			{/if}

			{#if config.intro?.trim()}
				<div class="listicle__intro listicle__prose">{@html config.intro}</div>
			{/if}

			{#if items.length}
				<ol class="listicle__points">
					{#each items as item, i}
						<li class="listicle__point">
							<span class="listicle__num" aria-hidden="true">{i + 1}</span>
							<h3 class="listicle__point-title">{item.headline}</h3>
							{#if item.body?.trim()}
								<div class="listicle__point-body listicle__prose">{@html item.body}</div>
							{/if}
						</li>
					{/each}
				</ol>
			{/if}

			{#if config.closing?.trim()}
				<div class="listicle__closing listicle__prose">{@html config.closing}</div>
			{/if}

			{#if showCta}
				<p class="listicle__cta-wrap">
					<a href={config.cta_href!.trim()} class="listicle__cta">{config.cta_label!.trim()}</a>
				</p>
			{/if}
		</div>
	</section>
{/if}

<style>
	.listicle {
		--mod-pt: var(--wchs-spacing-v-normal, 56px);
		--mod-pb: var(--wchs-spacing-v-normal, 64px);
		--mod-px: 28px;
		--listicle-measure: min(720px, 100%);
		background: var(--bg-muted);
		color: var(--fg);
		padding: var(--mod-pt) var(--mod-px) var(--mod-pb);
	}
	.listicle.is-v-compact {
		--mod-pt: var(--wchs-spacing-v-compact, 28px);
		--mod-pb: var(--wchs-spacing-v-compact, 32px);
	}
	.listicle.is-v-spacious {
		--mod-pt: var(--wchs-spacing-v-spacious, 80px);
		--mod-pb: var(--wchs-spacing-v-spacious, 88px);
	}
	.listicle.is-h-compact {
		--mod-px: 16px;
	}
	.listicle.is-h-spacious {
		--mod-px: 40px;
	}

	.listicle__inner {
		max-width: var(--listicle-measure);
		margin: 0 auto;
		text-align: center;
	}

	.listicle__headline {
		font-family: var(--font-heading, var(--font-sans));
		font-size: clamp(28px, 4.2vw, 42px);
		font-weight: var(--heading-weight, 600);
		line-height: 1.12;
		letter-spacing: -0.03em;
		margin: 0 0 28px;
		color: var(--fg);
	}

	.listicle__points {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	.listicle__point {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}

	.listicle__num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--accent-fg);
		font-size: 15px;
		font-weight: 700;
		line-height: 1;
		flex-shrink: 0;
	}

	.listicle__point-title {
		font-family: var(--font-heading, var(--font-sans));
		font-size: clamp(22px, 3.2vw, 30px);
		font-weight: var(--heading-weight, 600);
		line-height: 1.2;
		letter-spacing: -0.025em;
		margin: 0;
		max-width: 36ch;
		color: var(--fg);
	}

	.listicle__cta-wrap {
		margin: 40px 0 0;
	}

	.listicle__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 14px 28px;
		background: var(--accent);
		color: var(--accent-fg);
		border: 1px solid var(--accent);
		text-decoration: none;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: opacity var(--dur-fast) var(--ease);
	}
	.listicle__cta:hover {
		opacity: 0.88;
	}

	.listicle__prose :global(p) {
		font-size: 15px;
		line-height: 1.7;
		color: var(--fg-muted);
		margin: 0 0 16px;
	}
	.listicle__prose :global(p:last-child) {
		margin-bottom: 0;
	}
	.listicle__intro {
		margin-bottom: 40px;
	}
	.listicle__closing {
		margin-top: 40px;
	}

	.listicle__point-body {
		max-width: 52ch;
	}

	@media (max-width: 640px) {
		.listicle {
			--mod-px: 20px;
		}
		.listicle__points {
			gap: 36px;
		}
	}
</style>
