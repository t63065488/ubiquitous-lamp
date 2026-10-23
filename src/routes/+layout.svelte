<script lang="ts">
	import type { Component } from 'svelte';

	import { resolve } from '$app/paths';
	import { LampDesk, Layers, SwatchBook } from '@lucide/svelte';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';

	import favicon from '#lib/assets/favicon.svg';

	import '../app.css';

	let { children } = $props();

	const links: { href: '/count' | '/sample'; icon: Component; label: string }[] = [
		{
			href: '/count',
			icon: SwatchBook,
			label: 'Count'
		},
		{
			href: '/sample',
			icon: Layers,
			label: 'Sample'
		}
	];

	let anchorRail =
		'btn hover:preset-tonal aspect-square w-full max-w-[84px] flex flex-col items-center gap-0.5';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
		<aside class="h-screen w-full">
			<Navigation layout="rail">
				<Navigation.Header>
					<a href={resolve('/')} title="Home Page" aria-label="Homepage" class={anchorRail}>
						<LampDesk class="size-8" />
					</a>
				</Navigation.Header>
				<Navigation.Content>
					<Navigation.Menu>
						{#each links as link (link.href)}
							{@const Icon = link.icon}
							<a href={resolve(link.href)} class={anchorRail}>
								<Icon class="size-5" />
								<span class="text-xs">{link.label}</span>
							</a>
						{/each}
					</Navigation.Menu>
				</Navigation.Content>
			</Navigation>
		</aside>

		<main class="flex justify-center space-y-4 p-4">
			<div class="w-full card preset-filled-surface-100-900 p-4">
				{@render children?.()}
			</div>
		</main>
	</div>
</div>
