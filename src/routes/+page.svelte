<script lang="ts">
	import { resolve } from '$app/paths';

	const tools: { description: string; href: '/count' | '/sample'; title: string }[] = [
		{
			description:
				'Count how often each value appears in a column, optionally grouped by another column.',
			href: '/count',
			title: 'Count'
		},
		{
			description:
				'Take a random percentage of rows, optionally limited to rows matching selected values.',
			href: '/sample',
			title: 'Sample'
		}
	];
</script>

<svelte:head>
	<title>Ubiquitous Lamp</title>
</svelte:head>

<div class="space-y-6">
	<section class="space-y-2">
		<h1 class="h1">Ubiquitous Lamp</h1>
		<p class="opacity-75">
			Quick data actions for CSV and Excel files. Everything runs in your browser and nothing is
			uploaded to a server.
		</p>
	</section>

	<section class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each tools as tool (tool.href)}
			<a
				href={resolve(tool.href)}
				class="space-y-2 card preset-outlined-surface-200-800 p-4 hover:preset-tonal"
			>
				<h2 class="h4">{tool.title}</h2>
				<p class="text-sm opacity-75">{tool.description}</p>
			</a>
		{/each}
	</section>
</div>
