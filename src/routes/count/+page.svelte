<script>
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
</script>

<FileUploadHandler
	name="Count"
	onFileChange={() => console.log('test')}
	onFileRejection={() => console.log('Test')}
/>
