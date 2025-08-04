<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import { FilePlus, File, CircleX, Check, X } from '@lucide/svelte';
	import type { FileChangeDetails } from '@zag-js/file-upload';

	interface FileTableEntry {
		name: string;
		processed: boolean;
	}

	interface FileUploadHandlerProps {
		name: string;
		processFile: () => void;
		onFileRejection: () => void;
	}

	const { name, processFile: onFileChange }: FileUploadHandlerProps = $props();

	let files: FileTableEntry[] = $state([]);

	const populateFiles = (fileChanges: FileChangeDetails) => {
		files = fileChanges.acceptedFiles.map((file) => {
			return {
				name: file.name,
				processed: false
			};
		});
	};
</script>

<div>
	<FileUpload {name} onFileChange={populateFiles}>
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
	<hr class="hr" />
	<table class="table caption-bottom">
		<caption class="pt-4">Uploaded Files</caption>
		<thead>
			<tr>
				<th>Name</th>
				<th>processed</th>
			</tr>
		</thead>
		<tbody class="[&>tr]:hover:preset-tonal-primary">
			{#each files as row}
				<tr>
					<td>{row.name}</td>
					<td>
						{#if row.processed}
							<Check color="green" />
						{:else}
							<X color="red" />
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
