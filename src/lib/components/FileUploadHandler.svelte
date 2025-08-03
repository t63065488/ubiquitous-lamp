<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import { FilePlus, File, CircleX } from '@lucide/svelte';

	interface FileUploadHandlerProps {
		name: string;
		onFileChange: () => void;
		onFileRejection: () => void;
	}

	const { name, onFileChange }: FileUploadHandlerProps = $props();
</script>

<FileUpload {name} onFileChange={console.log}>
	{#snippet iconInterface()}
		<FilePlus class="size-4" />
	{/snippet}
	{#snippet iconFile()}
		<File class="size-4" />
	{/snippet}
	{#snippet iconFileRemove()}
		<CircleX class="size-4" />
	{/snippet}
</FileUpload>
