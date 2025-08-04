<script lang="ts">
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
    import { Slider } from '@skeletonlabs/skeleton-svelte';

    let value: number[] = $state([10])

	const processFile = async (file: File) => {
		console.log(file);
		await new Promise((f) => setTimeout(f, 3000));
	};
</script>

<div class="w-full card preset-filled-surface-100-900 p-4">
	<h2 class="pb-4 h2">Sample Data</h2>
	<FileUploadHandler name="Count" {processFile}>
		{#snippet additions()}
            <p>Select Sample Percentage</p>
			<Slider name="sample-percentage-input" {value} onValueChange={(e) => (value = e.value)} markers={[10, 25, 50, 75, 90]}/>
            <p class="p opacity-60">Current: {value[0]}%</p>
		{/snippet}
	</FileUploadHandler>
</div>
