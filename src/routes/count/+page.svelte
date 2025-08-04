<script lang="ts">
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';

	const processFile = async (file: File) => {
		console.log(file);
		await new Promise((f) => setTimeout(f, 3000));
	};
</script>

<div class="w-full card preset-filled-surface-100-900 p-4">
	<h2 class="pb-4 h2">Count Data</h2>
	<FileUploadHandler name="Count" {processFile}>
		{#snippet additions()}
			<p>Test</p>
		{/snippet}
	</FileUploadHandler>
</div>
