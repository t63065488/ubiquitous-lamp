<script>
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
</script>

<div class="w-full max-w-md card preset-filled-surface-100-900 p-4 text-center">
	<FileUploadHandler
		name="Count"
		onFileChange={() => console.log('test')}
		onFileRejection={() => console.log('Test')}
	/>
</div>
