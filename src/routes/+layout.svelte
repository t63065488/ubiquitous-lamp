<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { toaster } from '$lib/toaster-svelte';
	import { LampDesk, Layers, SwatchBook } from '@lucide/svelte';
	import { AppBar, Navigation, Toaster } from '@skeletonlabs/skeleton-svelte';
	let { children } = $props();
</script>

<Toaster {toaster} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppBar>
	{#snippet lead()}
		<LampDesk />
		<h1>Ubiquitous Lamp</h1>
	{/snippet}
</AppBar>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
		<aside class="h-screen w-full">
			<Navigation.Rail>
				{#snippet tiles()}
					<Navigation.Tile href="sample" label="Sample"><SwatchBook /></Navigation.Tile>
					<Navigation.Tile href="count" label="Count"><Layers /></Navigation.Tile>
				{/snippet}
			</Navigation.Rail>
		</aside>

		<main class="flex justify-center space-y-4 p-4">
			{@render children?.()}
		</main>
	</div>
</div>
